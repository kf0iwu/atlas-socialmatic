/**
 * Call the OpenAI Responses API (or any compatible endpoint).
 * URL and model are resolved from env vars; payload is merged with model.
 */
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
      // Integer seconds
      const seconds = parseInt(raw, 10);
      if (!isNaN(seconds) && seconds > 0) {
        return Math.min(seconds * 1_000, RETRY_AFTER_CAP_MS);
      }
      // HTTP-date
      const date = Date.parse(raw);
      if (!isNaN(date)) {
        const ms = date - Date.now();
        if (ms > 0) return Math.min(ms, RETRY_AFTER_CAP_MS);
      }
    }
  }
  return RETRY_BASE_MS * attempt;
}

export async function callResponsesApi(
  apiKey: string,
  payload: Record<string, unknown>,
): Promise<Response> {
  const baseUrl = (
    process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
  ).replace(/\/$/, "");

  const url = `${baseUrl}/responses`;
  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      ...payload,
    }),
  };

  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
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
