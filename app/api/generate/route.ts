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


import { callResponsesApi } from "@/lib/llm/provider";
import { tryAcquire, release } from "@/lib/llm/rateLimit";
import { NextResponse } from "next/server";

type LengthTier = "short" | "medium" | "long";
type Platform = "linkedin" | "x" | "instagram" | "threads" | "blog";

type ReqBody = {
  topic: string;
  audience?: string;
  tone?: string;

  platforms?: Platform[];
  lengths?: Record<string, LengthTier>;
};

function stripCodeFences(s: string) {
  return s
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function isPlatform(x: any): x is Platform {
  return ["linkedin", "x", "instagram", "threads", "blog"].includes(String(x));
}

function normalizePlatforms(p?: any): Platform[] {
  const fallback: Platform[] = ["linkedin", "x", "instagram", "threads"];
  if (!Array.isArray(p) || p.length === 0) return fallback;

  const cleaned = p.filter(isPlatform) as Platform[];
  if (cleaned.length === 0) return fallback;

  // stable ordering
  const order: Platform[] = ["linkedin", "x", "instagram", "threads", "blog"];
  return order.filter((x) => cleaned.includes(x));
}

function normalizeTier(x: any): LengthTier {
  const v = String(x ?? "").toLowerCase();
  if (v === "short" || v === "medium" || v === "long") return v;
  return "medium";
}

export async function POST(req: Request) {
  if (!tryAcquire()) {
    return NextResponse.json({ error: "Server busy, try again shortly" }, { status: 429 });
  }
  try {
    const body = (await req.json()) as ReqBody;

    if (!body.topic || body.topic.trim().length < 3) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const platforms = normalizePlatforms(body.platforms);
    const lengths = body.lengths ?? {};
    const tier = (p: Platform) => normalizeTier(lengths[p]);

    const prompt = `
You are Atlas-Socialmatic. Generate content tailored per platform.

Topic: ${body.topic}
Audience: ${body.audience ?? "general"}
Tone: ${body.tone ?? "professional"}

Platforms requested: ${platforms.join(", ")}

Length tiers (per platform):
${platforms.map((p) => `- ${p}: ${tier(p)}`).join("\n")}

Return STRICT JSON with exactly these keys:
${platforms.join(", ")}

Rules by platform (apply the platform’s tier):

linkedin:
- short: 300–600 characters total
- medium: 700–1100 characters total (target ~900)
- long: 1000–1500 characters total (target ~1200; avoid short posts)
- Open with a strong hook: a bold claim, counterintuitive insight, direct question, or surprising observation (1–2 lines max)
- The first line must be a short, punchy hook (ideally under 12 words) that makes the reader curious to continue
- Focus the post on one clear insight rather than summarizing the topic broadly
- Use short paragraphs of 1–3 sentences each, separated by blank lines — no dense walls of text
- Long posts should fully develop the idea with explanation, example, lesson, or reasoning
- Use bullet points sparingly: at most one list per post, only where they genuinely add clarity
- Write in a professional but conversational tone; avoid corporate jargon and marketing language
- End with a question that invites professionals to share experience, perspective, or challenges (avoid generic questions like “What do you think?”)
- Place 0–3 relevant industry hashtags on their own line at the very end
- Prefer specific professional hashtags over generic tags like #innovation, #leadership, or #growth
- return an array of 3 variants

x:
- short: <= 140 chars
- medium: <= 220 chars
- long: <= 280 chars
- no hashtag pile
- return an array of 3 variants

instagram:
- short: 1–2 short paragraphs + 5–8 hashtags at end
- medium: 2–3 paragraphs + 8–12 hashtags at end
- long: 4–6 paragraphs + 10–15 hashtags at end
- return an array of 3 variants

threads:
- short: 2–4 sentences + question
- medium: 5–8 sentences + question
- long: 9–14 sentences + question
- return an array of 3 variants

blog:
- short: ~200–350 words (1–2 sections)
- medium: ~700–1100 words (3–5 sections)
- long: ~2000–3500 words (6–10 sections)
- use markdown with a title and headings
- return a single string (not an array)

Variant diversity (linkedin, x, instagram, threads):
- Variant 1: lead with an insight or strong opinion about the topic
- Variant 2: lead with a practical takeaway or concrete tip
- Variant 3: lead with a reflective question or observation
- Each variant must approach the topic from a meaningfully different angle — do not produce three versions of the same post with minor wording changes

Writing quality (all platforms):
- Never open with generic scene-setters: "In today's world", "Many organizations", "In today's fast-paced environment", or similar
- Avoid hollow filler phrases: "leverage", "key to success", "game-changer", "seamlessly", "in the realm of"
- Favour specific, concrete observations over vague advice
- Strong openings: bold statement, counterintuitive claim, direct question, or a specific scenario

Important:
- For linkedin/x/instagram/threads: value must be an array of 3 strings.
- For blog: value must be a single markdown string.
- No code fences. No extra keys.
`.trim();

    const resp = await callResponsesApi(apiKey, { input: prompt });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json(
        { error: "LLM request failed", details: errText },
        { status: 502 }
      );
    }

    const data = await resp.json();

    // Attempt to extract unified text; fallback if shape differs.
    const outputText: string =
      data.output_text ??
      (Array.isArray(data.output)
        ? data.output
            .flatMap((o: any) => o?.content ?? [])
            .map((c: any) => c?.text ?? "")
            .join("")
        : "") ??
      "";

    const cleaned = stripCodeFences(outputText);

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ ok: true, posts: parsed });
    } catch {
      return NextResponse.json({ ok: true, raw: outputText });
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unhandled error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  } finally {
    release();
  }
}
