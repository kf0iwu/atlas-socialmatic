import { NextResponse } from "next/server";

type ReqBody = {
  focus: string;          // e.g., "ISO 14971 medical device risk management consultancy"
  platform?: string;      // default "linkedin"
  audience?: string;      // optional
  tone?: string;          // optional
  count?: number;         // optional (default 12)
};

function stripCodeFences(s: string) {
  return s
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;

    if (!body.focus || body.focus.trim().length < 5) {
      return NextResponse.json({ error: "Focus is required (5+ chars)." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server missing OPENAI_API_KEY" }, { status: 500 });
    }

    const platform = body.platform ?? "linkedin";
    const count = Math.min(Math.max(body.count ?? 12, 5), 20);

    const prompt = `
You are a content strategist. Generate topic ideas for social posts.

Focus/domain: ${body.focus}
Target platform: ${platform}
Audience: ${body.audience ?? "professionals interested in the focus domain"}
Tone: ${body.tone ?? "professional"}

Return STRICT JSON with:
{
  "topics": [
    { "topic": "string", "angle": "string", "why": "string", "keywords": ["string", ...] }
  ]
}

Rules:
- Return exactly ${count} items.
- Topics must be specific, not generic.
- Topics should be suitable for a consultant trying to attract leads without sounding salesy.
- No code fences. No extra keys.
`.trim();

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
      return NextResponse.json({ error: "LLM request failed", details: errText }, { status: 502 });
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