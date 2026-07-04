// ---------------------------------------------------------------------------
// lib/watsonx.ts
// Calls Pollinations' OpenAI-compatible POST endpoint.
// Uses POST /v1/chat/completions so the prompt travels in the request body —
// no HTTP 414 URI-too-long errors regardless of story length.
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

  // POST the prompt in the request body — avoids the URI length limit that
  // the old GET /text/{prompt} endpoint hit with long story texts.
  const response = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  // Surface any HTTP-level error (4xx / 5xx) before trying to parse JSON.
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Pollinations request failed: ${response.status} ${errorText}`
    );
  }

  // Parse the OpenAI-compatible response and return the generated text.
  const data = await response.json();
  return data.choices[0].message.content;
}
