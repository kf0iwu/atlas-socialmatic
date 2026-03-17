import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "node:crypto";

export const runtime = "nodejs";

const PREVIEW_LEN = 160;

function safeJsonParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function makePreview(outputsJson: string | null): string {
  const outputs = safeJsonParse<Record<string, unknown>>(outputsJson);
  if (!outputs) return "";
  for (const v of Object.values(outputs)) {
    if (typeof v === "string" && v.trim().length > 0) {
      return v.replace(/\s+/g, " ").trim().slice(0, PREVIEW_LEN);
    }
    if (Array.isArray(v) && typeof v[0] === "string" && v[0].trim().length > 0) {
      return v[0].replace(/\s+/g, " ").trim().slice(0, PREVIEW_LEN);
    }
  }
  return "";
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

export async function GET() {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT id, created_at, updated_at, topic, platforms, outputs
       FROM drafts
       ORDER BY updated_at DESC`
    )
    .all() as Array<{
      id: string;
      created_at: number;
      updated_at: number;
      topic: string;
      platforms: string;
      outputs: string | null;
    }>;

  const drafts = rows.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    updated_at: r.updated_at,
    topic: r.topic,
    platforms: safeJsonParse<string[]>(r.platforms) ?? [],
    preview: makePreview(r.outputs),
  }));

  return NextResponse.json({ drafts });
}

export async function POST(req: Request) {
  const db = getDb();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isMeaningful(body)) {
    return NextResponse.json({ error: "empty_draft_not_allowed" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const id = crypto.randomUUID();
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
    `INSERT INTO drafts
      (id, created_at, updated_at, topic, audience, tone, length_tier, platforms, outputs, hooks, hashtag_packs, meta)
     VALUES
      (?,  ?,         ?,         ?,     ?,        ?,    ?,           ?,         ?,       ?,     ?,            ?)`
  ).run(
    id,
    now,
    now,
    topic,
    audience,
    tone,
    length_tier,
    platforms,
    outputs,
    hooks,
    hashtag_packs,
    meta
  );

  const draft = {
    id,
    created_at: now,
    updated_at: now,
    topic,
    audience,
    tone,
    length_tier,
    platforms: platformsArr,
    outputs: b.outputs ?? null,
    hooks: b.hooks ?? null,
    hashtag_packs: b.hashtag_packs ?? null,
    meta: b.meta ?? null,
  };

  return NextResponse.json({ draft }, { status: 201 });
}
