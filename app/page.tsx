"use client";

import { useMemo, useState } from "react";

type Posts = {
  linkedin?: string[];
  x?: string[];
  instagram?: string[];
  threads?: string[];
};

function CopyButton({ text }: { text: string }) {
  return (
    <button
      className="text-xs border rounded px-2 py-1 hover:bg-slate-50"
      onClick={() => navigator.clipboard.writeText(text)}
      type="button"
    >
      Copy
    </button>
  );
}

function PlatformCard({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items?.length) return null;

  return (
    <section className="border rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-slate-500">{items.length} variants</span>
      </div>

      <div className="space-y-3">
        {items.map((txt, idx) => (
          <div key={idx} className="border rounded-lg p-3 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-700">
                Variant {idx + 1}
              </div>
              <CopyButton text={txt} />
            </div>
            <pre className="text-sm whitespace-pre-wrap font-sans">
              {txt}
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Friendly");
  const [busy, setBusy] = useState(false);

  const [posts, setPosts] = useState<Posts | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = useMemo(() => topic.trim().length >= 3, [topic]);

  async function generate() {
    setBusy(true);
    setError(null);
    setPosts(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience, tone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");

      if (data?.posts) {
        setPosts(data.posts as Posts);
      } else {
        // If the model ever returns non-JSON, show it as an error-ish message
        setError(data?.raw ? String(data.raw) : "No structured output returned.");
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Atlas-Socialmatic</h1>
          <p className="text-slate-600">
            Generate platform-ready drafts with multiple variants + one-click copy.
          </p>
        </header>

        <section className="border rounded-xl p-4 bg-white space-y-3">
          <div className="space-y-1">
            <label className="font-medium">Topic</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Announcing Atlas-Socialmatic..."
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium">Audience</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., makers and devs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium">Tone</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option>Professional</option>
              <option>Friendly</option>
              <option>Bold</option>
              <option>Playful</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
              onClick={generate}
              disabled={busy || !canGenerate}
              type="button"
            >
              {busy ? "Generating..." : "Generate Posts"}
            </button>
            {!canGenerate && (
              <span className="text-sm text-slate-500">
                Enter a topic (3+ characters)
              </span>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}
        </section>

        {posts && (
          <div className="grid gap-4">
            <PlatformCard title="LinkedIn" items={posts.linkedin} />
            <PlatformCard title="X" items={posts.x} />
            <PlatformCard title="Instagram" items={posts.instagram} />
            <PlatformCard title="Threads" items={posts.threads} />
          </div>
        )}
      </div>
    </main>
  );
}