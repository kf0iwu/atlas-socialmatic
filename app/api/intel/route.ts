/*
Atlas-Socialmatic
Copyright (C) 2026 David Grilli

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { callChatCompletions, resolveLlmConfig } from "@/lib/llm/provider";
import { acquireOrThrow, isRateLimitError, release } from "@/lib/llm/rateLimit";
import { NextResponse } from "next/server";

type HashtagSize = "small" | "medium" | "large";
type Platform = "instagram" | "linkedin";

type ReqBody = {
  topic: string;
  audience?: string;
  tone?: string;

  // Hooks
  generate_hooks?: boolean;
  hook_count?: number; // default 5

  // Hashtags
  generate_hashtags?: boolean;
  hashtag_size?: HashtagSize; // small/medium/large
  hashtag_platforms?: Platform[]; // default ["instagram"]
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(Math.max(n, lo), hi);
}

function pickMixedLine(hashtags: {
  broad: string[];
  niche: string[];
  longtail: string[];
}) {
  // Simple deterministic “blend” for copy/paste. You can tweak ordering later.
  return [...hashtags.broad, ...hashtags.niche, ...hashtags.longtail].join(" ");
}

// Build a JSON structure hint to embed in the system prompt.
// Provider-agnostic alternative to Responses API structured outputs.
function buildJsonStructureHint(opts: {
  generateHooks: boolean;
  generateHashtags: boolean;
  platforms: Platform[];
}): string {
  const metaFields: string[] = [];

  if (opts.generateHooks) {
    metaFields.push(`    "linkedin_hooks": ["hook string", ...]`);
  }

  if (opts.generateHashtags) {
    const platformEntries = opts.platforms
      .map(
        (p) =>
          `      "${p}": {\n        "broad": ["#tag", ...],\n        "niche": ["#tag", ...],\n        "longtail": ["#tag", ...],\n        "mixed_line": "#tag1 #tag2 ..."\n      }`,
      )
      .join(",\n");
    metaFields.push(`    "hashtag_packs": {\n${platformEntries}\n    }`);
  }

  return `{\n  "meta": {\n${metaFields.join(",\n")}\n  }\n}`;
}

type HashtagPackResult = { broad: string[]; niche: string[]; longtail: string[]; mixed_line?: string };
type IntelParsed = { meta?: { hashtag_packs?: Record<string, HashtagPackResult> } };

export async function POST(req: Request) {
  let acquired = false;
  try {
    acquireOrThrow(req);
    acquired = true;
    const body = (await req.json()) as ReqBody;

    if (!body.topic || body.topic.trim().length < 3) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const { apiKey } = resolveLlmConfig();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing LLM_API_KEY (or OPENAI_API_KEY)" },
        { status: 500 }
      );
    }

    const generateHooks = !!body.generate_hooks;
    const generateHashtags = !!body.generate_hashtags;

    if (!generateHooks && !generateHashtags) {
      return NextResponse.json(
        { error: "Nothing requested (enable hooks and/or hashtags)." },
        { status: 400 }
      );
    }

    const hookCount = clamp(body.hook_count ?? 5, 3, 10);

    const size = (body.hashtag_size ?? "medium") as HashtagSize;
    const sizeRanges: Record<
      HashtagSize,
      { broad: [number, number]; niche: [number, number]; longtail: [number, number] }
    > = {
      small: { broad: [1, 2], niche: [2, 3], longtail: [1, 2] }, // ~4–7
      medium: { broad: [2, 3], niche: [3, 5], longtail: [2, 4] }, // ~7–12
      large: { broad: [3, 4], niche: [5, 7], longtail: [3, 5] }, // ~11–16
    };

    const platforms: Platform[] =
      body.hashtag_platforms?.length ? body.hashtag_platforms : ["instagram"];

    // Build instructions
    const topic = body.topic.trim();
    const audience = (body.audience ?? "general").trim();
    const tone = (body.tone ?? "professional").trim();

    const instructions: string[] = [];

    if (generateHooks) {
      instructions.push(
        [
          `Generate ${hookCount} LinkedIn hooks.`,
          `Rules:`,
          `- Each hook is 1–2 lines max.`,
          `- Avoid hype. Be clear, specific, slightly provocative/curious.`,
          `- Use patterns like: counterintuitive insight, common mistake, checklist, "if you only do one thing", mini case-study teaser.`,
          `- Suitable for consultants *without being salesy*.`,
          `Return in meta.linkedin_hooks as string[].`,
        ].join("\n")
      );
    }

    if (generateHashtags) {
      const r = sizeRanges[size];
      instructions.push(
        [
          `Generate hashtag strategy packs targeted to the topic/audience.`,
          `Platforms requested: ${platforms.join(", ")}`,
          ``,
          `For each platform, return:`,
          `- broad: ${r.broad[0]}–${r.broad[1]} hashtags (high volume / broad category)`,
          `- niche: ${r.niche[0]}–${r.niche[1]} hashtags (mid-tier, strongly relevant)`,
          `- longtail: ${r.longtail[0]}–${r.longtail[1]} hashtags (very specific, low competition)`,
          ``,
          `Rules:`,
          `- Use #LikeThis formatting. Plausible, commonly-used.`,
          `- Avoid spammy/irrelevant tags.`,
          `- Avoid duplicates across groups if possible.`,
          `- Also return mixed_line: a single copy/paste line that blends broad+niche+longtail.`,
          `Return in meta.hashtag_packs[platform].{broad,niche,longtail,mixed_line}.`,
        ].join("\n")
      );
    }

    const jsonHint = buildJsonStructureHint({ generateHooks, generateHashtags, platforms });

    const resp = await callChatCompletions(
      [
        {
          role: "system",
          content: [
            "You are Atlas-Socialmatic Intelligence. You generate strategic add-ons for social writing.",
            "",
            "Respond ONLY with valid JSON matching this exact structure. No code fences. No explanation outside the JSON object.",
            jsonHint,
          ].join("\n"),
        },
        {
          role: "user",
          content: [
            `Topic: ${topic}`,
            `Audience: ${audience}`,
            `Tone: ${tone}`,
            "",
            instructions.join("\n\n"),
          ].join("\n"),
        },
      ],
      { temperature: 0.4 },
    );

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json(
        { error: "LLM request failed", details: errText },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const rawContent: string = data.choices?.[0]?.message?.content ?? "";
    // Strip code fences defensively — some providers wrap JSON in ```json blocks
    const outputText = rawContent
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    let parsed: IntelParsed;
    try {
      parsed = (typeof outputText === "string" ? JSON.parse(outputText) : outputText) as IntelParsed;
    } catch {
      // If SDK/server ever returns already-parsed JSON or a non-JSON string,
      // return the raw payload to debug.
      return NextResponse.json({ ok: true, raw: outputText, data }, { status: 200 });
    }

    // Optional: if the model ever forgets mixed_line (shouldn't under strict),
    // compute it as a safety net.
    if (generateHashtags && parsed?.meta?.hashtag_packs) {
      for (const p of platforms) {
        const pack = parsed.meta.hashtag_packs?.[p];
        if (pack && typeof pack.mixed_line !== "string") {
          pack.mixed_line = pickMixedLine(pack);
        }
      }
    }

    return NextResponse.json({ ok: true, ...parsed }, { status: 200 });
  } catch (error: unknown) {
    if (isRateLimitError(error)) {
      return NextResponse.json(
        { error: error.message },
        {
          status: error.code === "RATE_LIMIT" ? 429 : 503,
          headers: error.retryAfterSeconds
            ? { "Retry-After": String(error.retryAfterSeconds) }
            : undefined,
        }
      );
    }
    return NextResponse.json(
      { error: "Unhandled error", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  } finally {
    if (acquired) release();
  }
}