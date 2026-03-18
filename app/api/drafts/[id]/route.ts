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

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

function safeJsonParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function isMeaningful(body: unknown): boolean {
  const b = body as Record<string, unknown>;
  const topic = typeof b.topic === "string" ? b.topic.trim() : "";
  const platforms = Array.isArray(b.platforms) ? b.platforms : [];
  const outputs = b.outputs && typeof b.outputs === "object" ? Object.keys(b.outputs as object).length : 0;
  const hooks = b.hooks && typeof b.hooks === "object" ? Object.keys(b.hooks as object).length : 0;
  const packs = b.hashtag_packs && typeof b.hashtag_packs === "object" ? Object.keys(b.hashtag_packs as object).length : 0;

  return topic.length > 0 || platforms.length > 0 || outputs > 0 || hooks > 0 || packs > 0;
}

interface DraftRow {
  id: string;
  created_at: number;
  updated_at: number;
  topic: string;
  audience: string | null;
  tone: string | null;
  length_tier: string | null;
  platforms: string;
  outputs: string | null;
  hooks: string | null;
  hashtag_packs: string | null;
  meta: string | null;
}

function rowToDraft(row: unknown) {
  const r = row as DraftRow;
  return {
    id: r.id,
    created_at: r.created_at,
    updated_at: r.updated_at,
    topic: r.topic,
    audience: r.audience ?? null,
    tone: r.tone ?? null,
    length_tier: r.length_tier ?? null,
    platforms: safeJsonParse<string[]>(r.platforms) ?? [],
    outputs: safeJsonParse<unknown>(r.outputs),
    hooks: safeJsonParse<unknown>(r.hooks),
    hashtag_packs: safeJsonParse<unknown>(r.hashtag_packs),
    meta: safeJsonParse<unknown>(r.meta),
  };
}

/* GET() handler */

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await ctx.params;  //uses await ctx.params async, next.js 16 fix

  const row = db.prepare(`SELECT * FROM drafts WHERE id = ?`).get(id);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ draft: rowToDraft(row) });
}

/* PUT() handler */

  export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const ifMatch = b.if_match_updated_at;
  if (typeof ifMatch !== "number") {
    return NextResponse.json({ error: "missing_if_match_updated_at" }, { status: 400 });
  }

  const existing = db
    .prepare(`SELECT updated_at, created_at FROM drafts WHERE id = ?`)
    .get(id) as { updated_at: number; created_at: number } | undefined;

  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (existing.updated_at !== ifMatch) {
    return NextResponse.json(
      { error: "conflict", current_updated_at: existing.updated_at },
      { status: 409 }
    );
  }

  if (!isMeaningful(body)) {
    return NextResponse.json({ error: "empty_draft_not_allowed" }, { status: 400 });
  }

  const now = Date.now();

  const topic = typeof b.topic === "string" ? b.topic : "";
  const audience = typeof b.audience === "string" ? b.audience : null;
  const tone = typeof b.tone === "string" ? b.tone : null;
  const length_tier = typeof b.length_tier === "string" ? b.length_tier : null;

  const platformsArr = Array.isArray(b.platforms) ? b.platforms : [];
  const platforms = JSON.stringify(platformsArr);

  const outputs = b.outputs ? JSON.stringify(b.outputs) : null;
  const hooks = b.hooks ? JSON.stringify(b.hooks) : null;
  const hashtag_packs = b.hashtag_packs ? JSON.stringify(b.hashtag_packs) : null;
  const meta = b.meta ? JSON.stringify(b.meta) : null;

  db.prepare(
    `UPDATE drafts SET
      updated_at = ?,
      topic = ?,
      audience = ?,
      tone = ?,
      length_tier = ?,
      platforms = ?,
      outputs = ?,
      hooks = ?,
      hashtag_packs = ?,
      meta = ?
     WHERE id = ?`
  ).run(
    now,
    topic,
    audience,
    tone,
    length_tier,
    platforms,
    outputs,
    hooks,
    hashtag_packs,
    meta,
    id
  );

  const row = db.prepare(`SELECT * FROM drafts WHERE id = ?`).get(id);
  return NextResponse.json({ draft: rowToDraft(row) });
}

/* DELETE() handler */

  export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await ctx.params;

  const info = db.prepare(`DELETE FROM drafts WHERE id = ?`).run(id);
  if (info.changes === 0) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
