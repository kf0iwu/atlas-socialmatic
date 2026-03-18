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

import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SettingsRow = {
  default_platforms: string;
  default_tone: string | null;
  default_audience: string | null;
  default_length_tier: string | null;
  llm_provider: string | null;
  llm_base_url: string | null;
  llm_model: string | null;
};

export async function GET() {
  try {
    const db = getDb();
    const row = db
      .prepare(
        `SELECT default_platforms, default_tone, default_audience, default_length_tier,
                llm_provider, llm_base_url, llm_model
         FROM settings WHERE id = 1`,
      )
      .get() as SettingsRow | undefined;

    const settings = {
      default_platforms: JSON.parse(row?.default_platforms ?? "[]"),
      default_tone: row?.default_tone ?? null,
      default_audience: row?.default_audience ?? null,
      default_length_tier: row?.default_length_tier ?? null,
      llm_provider: row?.llm_provider ?? null,
      llm_base_url: row?.llm_base_url ?? null,
      llm_model: row?.llm_model ?? null,
    };

    // Indicate which values are overridden by env vars (read-only in UI)
    const env = {
      api_key_set: !!(process.env.LLM_API_KEY || process.env.OPENAI_API_KEY),
      base_url_set: !!(process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL),
      model_set: !!(process.env.LLM_MODEL || process.env.OPENAI_MODEL),
    };

    return NextResponse.json({ settings, env });
  } catch {
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json() as {
      llm_provider?: string | null;
      llm_base_url?: string | null;
      llm_model?: string | null;
      default_platforms?: string[];
      default_tone?: string | null;
      default_audience?: string | null;
      default_length_tier?: string | null;
    };

    // Validate base URL — must be http/https to prevent SSRF
    if (body.llm_base_url) {
      let parsed: URL;
      try { parsed = new URL(body.llm_base_url); } catch {
        return NextResponse.json({ error: "llm_base_url is not a valid URL" }, { status: 400 });
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return NextResponse.json({ error: "llm_base_url must use http or https" }, { status: 400 });
      }
    }

    const db = getDb();
    const now = Date.now();

    // Build dynamic SET clause from provided keys only
    const updates: string[] = ["updated_at = ?"];
    const params: unknown[] = [now];

    if ("llm_provider" in body) { updates.push("llm_provider = ?"); params.push(body.llm_provider ?? null); }
    if ("llm_base_url" in body) { updates.push("llm_base_url = ?"); params.push(body.llm_base_url ?? null); }
    if ("llm_model" in body) { updates.push("llm_model = ?"); params.push(body.llm_model ?? null); }
    if ("default_platforms" in body) { updates.push("default_platforms = ?"); params.push(JSON.stringify(body.default_platforms ?? [])); }
    if ("default_tone" in body) { updates.push("default_tone = ?"); params.push(body.default_tone ?? null); }
    if ("default_audience" in body) { updates.push("default_audience = ?"); params.push(body.default_audience ?? null); }
    if ("default_length_tier" in body) { updates.push("default_length_tier = ?"); params.push(body.default_length_tier ?? null); }

    params.push(1); // WHERE id = 1
    db.prepare(`UPDATE settings SET ${updates.join(", ")} WHERE id = 1`).run(...params);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
