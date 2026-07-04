// ---------------------------------------------------------------------------
// scripts/test-watsonx.mjs
//
// Smoke-test for the Pollinations text endpoint.
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
// Step 2 — GET the Pollinations text endpoint with the prompt in the path.
// ---------------------------------------------------------------------------
const response = await fetch(
  `https://gen.pollinations.ai/text/${encodeURIComponent(prompt)}`,
  {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  }
);

// ---------------------------------------------------------------------------
// Step 3 — Handle HTTP-level errors before reading the body.
// ---------------------------------------------------------------------------
if (!response.ok) {
  const errorText = await response.text();
  console.error(`❌  HTTP ${response.status}: ${errorText}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 4 — The endpoint returns plain text directly.
// ---------------------------------------------------------------------------
const reply = await response.text();

console.log("✅  askGranite replied:\n");
console.log("   ", reply);
