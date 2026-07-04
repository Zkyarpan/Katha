// ---------------------------------------------------------------------------
// scripts/test-watsonx.mjs
//
// Smoke-test for the Pollinations OpenAI-compatible POST endpoint.
// Replicates the exact logic in lib/watsonx.ts so this file runs directly
// with Node — no TypeScript compilation required.
//
// Usage (loads .env.local automatically via Node's built-in --env-file flag):
//
//   node --env-file=.env.local scripts/test-watsonx.mjs
//
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Step 1 — Read the API key injected by --env-file into process.env.
// ---------------------------------------------------------------------------
const apiKey = process.env.POLLINATIONS_API_KEY;

if (!apiKey) {
  console.error(
    "❌  POLLINATIONS_API_KEY is not set.\n" +
      "    Run the script with: node --env-file=.env.local scripts/test-watsonx.mjs"
  );
  process.exit(1);
}

const prompt = "Say hello in one sentence";

console.log(`⏳  Sending prompt: "${prompt}"\n`);

// ---------------------------------------------------------------------------
// Step 2 — POST to the Pollinations OpenAI-compatible endpoint.
//           Prompt travels in the request body — no URI length limit.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Step 3 — Handle HTTP-level errors before parsing JSON.
// ---------------------------------------------------------------------------
if (!response.ok) {
  const errorText = await response.text();
  console.error(`❌  HTTP ${response.status}: ${errorText}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 4 — Parse the OpenAI-compatible response and print the reply.
// ---------------------------------------------------------------------------
const data = await response.json();
const reply = data.choices[0].message.content;

console.log("✅  askGranite replied:\n");
console.log("   ", reply);
