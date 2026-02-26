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

function isMeaningful(body: any): boolean {
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  const platforms = Array.isArray(body?.platforms) ? body.platforms : [];
  const outputs = body?.outputs && typeof body.outputs === "object" ? Object.keys(body.outputs).length : 0;
  const hooks = body?.hooks && typeof body.hooks === "object" ? Object.keys(body.hooks).length : 0;
  const packs = body?.hashtag_packs && typeof body.hashtag_packs === "object" ? Object.keys(body.hashtag_packs).length : 0;

  return topic.length > 0 || platforms.length > 0 || outputs > 0 || hooks > 0 || packs > 0;
}

function rowToDraft(row: any) {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    topic: row.topic,
    audience: row.audience ?? null,
    tone: row.tone ?? null,
    length_tier: row.length_tier ?? null,
    platforms: safeJsonParse<string[]>(row.platforms) ?? [],
    outputs: safeJsonParse<any>(row.outputs),
    hooks: safeJsonParse<any>(row.hooks),
    hashtag_packs: safeJsonParse<any>(row.hashtag_packs),
    meta: safeJsonParse<any>(row.meta),
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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const ifMatch = body?.if_match_updated_at;
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

  const topic = typeof body.topic === "string" ? body.topic : "";
  const audience = typeof body.audience === "string" ? body.audience : null;
  const tone = typeof body.tone === "string" ? body.tone : null;
  const length_tier = typeof body.length_tier === "string" ? body.length_tier : null;

  const platformsArr = Array.isArray(body.platforms) ? body.platforms : [];
  const platforms = JSON.stringify(platformsArr);

  const outputs = body.outputs ? JSON.stringify(body.outputs) : null;
  const hooks = body.hooks ? JSON.stringify(body.hooks) : null;
  const hashtag_packs = body.hashtag_packs ? JSON.stringify(body.hashtag_packs) : null;
  const meta = body.meta ? JSON.stringify(body.meta) : null;

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
