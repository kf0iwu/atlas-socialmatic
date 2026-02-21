import { NextResponse } from "next/server";

type ReqBody = {
  topic: string;
  audience?: string;
  tone?: string;
};

function stripCodeFences(s: string) {
  // Remove ```json ... ``` or ``` ... ```
  return s
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
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

    const prompt = `
You are Atlas-Socialmatic, a generator of platform-specific social media drafts.

Topic: ${body.topic}
Audience: ${body.audience ?? "general"}
Tone: ${body.tone ?? "professional"}

Return STRICT JSON with keys exactly: linkedin, x, instagram, threads.
Each key must be an array of 3 post variants (strings).

Rules:
- linkedin: 120–250 words, 0–3 hashtags max, end with a CTA.
- x: <= 280 chars, no hashtag pile.
- instagram: caption + 5–12 hashtags at end.
- threads: conversational, ask a question.
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
      return NextResponse.json(
        { error: "LLM request failed", details: errText },
        { status: 502 }
      );
    }

    const data = await resp.json();

    // Try to grab the unified text output if present; otherwise fallback.
	const outputText =
	  data.output_text ??
	  data.output?.[0]?.content?.map((c: any) => c.text).join("") ??
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
  }
}