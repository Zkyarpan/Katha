// ---------------------------------------------------------------------------
// lib/watsonx.ts
// Calls Pollinations' text generation endpoint.
// Swappable with any other provider by changing this file only —
// the exported function name `askGranite` is stable across the app.
// ---------------------------------------------------------------------------

/**
 * Send a plain-text prompt to Pollinations and return the generated reply.
 *
 * @param prompt - The user message to send.
 * @returns       The model's plain-text reply.
 */
export async function askGranite(prompt: string): Promise<string> {
  const apiKey = process.env.POLLINATIONS_API_KEY;

  // GET request — the prompt is URL-encoded into the path segment.
  const response = await fetch(
    `https://gen.pollinations.ai/text/${encodeURIComponent(prompt)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  // Surface any HTTP-level error (4xx / 5xx) before trying to read the body.
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Pollinations request failed: ${response.status} ${errorText}`
    );
  }

  // The endpoint returns plain text directly — no JSON parsing needed.
  return await response.text();
}
