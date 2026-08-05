// Test: send a help request to the deployed entity01-chat Edge Function and verify
// the reply contains no visible reasoning traces (<think>, Action: N, etc.).
import { createClient } from "@supabase/supabase-js";

const PROJECT_URL = "https://mgrkldaisagxuyuqrezh.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_pCTIK8UGfyVQjHMsU36zog_hehKdPAb";

const sb = createClient(PROJECT_URL, PUBLISHABLE_KEY);

const FORBIDDEN = [
  /<think>/i,
  /<\/think>/i,
  /Action:\s*(NONE|GLITCH_FLASH|FAKE_CRASH|JUMPSCARE|INTEGRITY_SHAKE)/i,
  /reasoning_content/i,
  /\{\"reply\"/i, // raw JSON should never leak through
  /\{\"action\"/i,
];

async function main() {
  const { data, error } = await sb.functions.invoke("entity01-chat", {
    body: {
      messages: [{ role: "user", content: "I need help with the ROOT_DIR puzzle" }],
      systemIntegrity: 75,
    },
  });

  if (error) {
    console.error("Invocation error:", error);
    process.exit(1);
  }

  console.log("Raw response:");
  console.log(JSON.stringify(data, null, 2));
  console.log("\nExtracted reply:");
  console.log(data.reply);

  const violations = FORBIDDEN.filter((re) => re.test(data.reply));
  if (violations.length > 0) {
    console.error("\nFAILED — forbidden patterns found in reply:");
    for (const re of violations) console.error("  -", re.source);
    process.exit(1);
  }

  if (!data.reply || data.reply.trim().length === 0) {
    console.error("\nFAILED — reply is empty");
    process.exit(1);
  }

  console.log("\nPASSED — reply is clean and non-empty.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
