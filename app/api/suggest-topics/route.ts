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
import { acquireOrThrow, isRateLimitError, release } from "@/lib/llm/rateLimit";
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
  let acquired = false;
  try {
    acquireOrThrow(req);
    acquired = true;
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

    const resp = await callResponsesApi(apiKey, { input: prompt });

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
  } catch (error: any) {
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
      { error: "Unhandled error", details: String(error?.message ?? error) },
      { status: 500 }
    );
  } finally {
    if (acquired) release();
  }
}