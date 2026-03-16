/**
 * Call the OpenAI Responses API (or any compatible endpoint).
 * URL and model are resolved from env vars; payload is merged with model.
 */
export async function callResponsesApi(
  apiKey: string,
  payload: Record<string, unknown>,
): Promise<Response> {
  const baseUrl = (
    process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
  ).replace(/\/$/, "");

  return fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      ...payload,
    }),
  });
}
