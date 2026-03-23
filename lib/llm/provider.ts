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
/**
 * LLM provider abstraction — calls /v1/chat/completions endpoint.
 *
 * Config resolved from LLM_* env vars with OPENAI_* fallbacks for
 * backward compatibility with existing deployments.
 */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 1_000;
const RETRY_AFTER_CAP_MS = 30_000;

function isTransientStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(resp: Response | null, attempt: number): number {
  if (resp) {
    const raw = resp.headers.get("Retry-After");
    if (raw) {
      const seconds = parseInt(raw, 10);
      if (!isNaN(seconds) && seconds > 0) {
        return Math.min(seconds * 1_000, RETRY_AFTER_CAP_MS);
      }
      const date = Date.parse(raw);
      if (!isNaN(date)) {
        const ms = date - Date.now();
        if (ms > 0) return Math.min(ms, RETRY_AFTER_CAP_MS);
      }
    }
  }
  return RETRY_BASE_MS * attempt;
}

/**
 * Resolve LLM configuration. LLM_* vars take precedence; OPENAI_* vars
 * are accepted as fallbacks. Optional `fallback` values (e.g. from DB
 * settings) fill in gaps after env vars.
 */
export function resolveLlmConfig(fallback?: {
  baseUrl?: string | null;
  model?: string | null;
}): { baseUrl: string; apiKey: string; model: string } {
  const baseUrl = (
    process.env.LLM_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    fallback?.baseUrl ||
    "https://api.openai.com/v1"
  ).replace(/\/$/, "");

  const apiKey =
    process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "";

  const model =
    process.env.LLM_MODEL ||
    process.env.OPENAI_MODEL ||
    fallback?.model ||
    "gpt-4.1-mini";

  return { baseUrl, apiKey, model };
}

export async function callChatCompletions(
  messages: ChatMessage[],
  opts: {
    temperature?: number;
    fallback?: { baseUrl?: string | null; model?: string | null };
  } = {},
): Promise<Response> {
  const { baseUrl, apiKey, model } = resolveLlmConfig(opts.fallback);
  const url = `${baseUrl}/chat/completions`;

  const body: Record<string, unknown> = { model, messages };
  if (opts.temperature !== undefined) body.temperature = opts.temperature;

  const isGoogleAI = baseUrl.includes("generativelanguage.googleapis.com");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (isGoogleAI) {
    headers["x-goog-api-key"] = apiKey;
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const init: RequestInit = {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  };

  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[llm] POST ${url} model=${model}`);
      const resp = await fetch(url, init);
      if (!isTransientStatus(resp.status) || attempt === MAX_ATTEMPTS - 1) {
        return resp;
      }
      await sleep(retryDelayMs(resp, attempt + 1));
    } catch (err) {
      lastError = err;
      if (attempt === MAX_ATTEMPTS - 1) throw lastError;
      await sleep(retryDelayMs(null, attempt + 1));
    }
  }
  throw lastError;
}

export function friendlyLlmError(status: number): string {
  if (status === 401 || status === 403)
    return "Invalid or missing API key. Check your LLM_API_KEY setting.";
  if (status === 429)
    return "The AI provider is rate-limiting this server. Please wait a moment and try again.";
  if (status >= 500)
    return "The AI provider is temporarily unavailable. Please try again.";
  return "The AI provider returned an unexpected error. Please try again.";
}
