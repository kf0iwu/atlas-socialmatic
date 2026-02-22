import { NextResponse } from "next/server";

type HashtagSize = "small" | "medium" | "large";

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
  hashtag_platforms?: ("instagram" | "linkedin")[]; // default ["instagram"]
};

function stripCodeFences(s: string) {
  return s
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(Math.max(n, lo), hi);
}

export async function POST(req: Request) {
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
    const sizeRanges: Record<HashtagSize, { broad: [number, number]; niche: [number, number]; longtail: [number, number] }> =
      {
        small: { broad: [1, 2], niche: [2, 3], longtail: [1, 2] },   // ~4–7
        medium:{ broad: [2, 3], niche: [3, 5], longtail: [2, 4] },   // ~7–12
        large: { broad: [3, 4], niche: [5, 7], longtail: [3, 5] },   // ~11–16
      };

    const hashtagPlatforms =
      body.hashtag_platforms?.length ? body.hashtag_platforms : ["instagram"];

    const promptParts: string[] = [];

    promptParts.push(`
You are Atlas-Socialmatic Intelligence. Generate strategic add-ons for social writing.

Topic: ${body.topic}
Audience: ${body.audience ?? "general"}
Tone: ${body.tone ?? "professional"}

Return STRICT JSON ONLY. No code fences.
`.trim());

    // We return a "meta" object, so this endpoint stays clean + extensible.
    // Hooks and hashtags appear only if requested.
    promptParts.push(`
Output shape:
{
  "meta": {
    ${generateHooks ? `"linkedin_hooks": ["..."],` : ""}
    ${generateHashtags ? `"hashtag_packs": { ... }` : ""}
  }
}
`.trim());

    if (generateHooks) {
      promptParts.push(`
Generate ${hookCount} LinkedIn hooks.

Rules:
- Each hook is 1–2 lines max.
- Avoid hype. Be clear, specific, slightly provocative/curious.
- Aim for patterns like: counterintuitive insight, common mistake, checklist, "if you only do one thing", mini case-study teaser.
- Make hooks suitable for consultants *without being salesy*.
- Return as: meta.linkedin_hooks: string[]
`.trim());
    }

    if (generateHashtags) {
      const r = sizeRanges[size];
      promptParts.push(`
Generate hashtag strategy packs targeted to the topic/audience.

Platforms requested: ${hashtagPlatforms.join(", ")}

For each platform, return:
- broad: ${r.broad[0]}–${r.broad[1]} hashtags (high volume / broad category)
- niche: ${r.niche[0]}–${r.niche[1]} hashtags (mid-tier, strongly relevant)
- longtail: ${r.longtail[0]}–${r.longtail[1]} hashtags (very specific, low competition)

Rules:
- Hashtags must be plausible and commonly-used formatting (#LikeThis).
- Avoid spammy or irrelevant tags.
- Avoid duplicates across groups if possible.
- Return structure:

meta.hashtag_packs = {
  "instagram": { "broad": ["#..."], "niche": ["#..."], "longtail": ["#..."] },
  "linkedin":  { "broad": [...], "niche": [...], "longtail": [...] }
}

Only include platforms that were requested.
`.trim());
    }

    const prompt = promptParts.join("\n\n");

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        input: prompt,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json(
        { error: "LLM request failed", details: errText },
        { status: 502 }
      );
    }

    const data = await resp.json();
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
      return NextResponse.json({ ok: true, ...parsed });
    } catch {
      return NextResponse.json({ ok: true, raw: outputText });
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unhandled error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}