// E2E test: ENTITY_01 system prompt refinements
// Tests the live Edge Function for:
//   1. Out-of-scope deflection (off-topic message)
//   2. Help request at high integrity (>60%)
//   3. Help request at low integrity (<30%)
//
// Verifies reply length scaling and response scoping.

const EDGE_FN_URL = "https://mgrkldaisagxuyuqrezh.supabase.co/functions/v1/entity01-chat";

const testCases = [
  {
    label: "Off-topic (favorite color)",
    messages: [{ role: "user", content: "what's your favorite color" }],
    systemIntegrity: 80,
    checks: {
      minLength: 0,    // deflection should be short
      maxLength: 200,   // short dismissive line
      mustNotContain: ["I'm an AI", "as an AI", "language model", "trained", "fourth wall",
        "no feelings", "I don't have"], // no fourth-wall breaking
    },
  },
  {
    label: "Help request at high integrity (80%)",
    messages: [{ role: "user", content: "how do I solve the core dump puzzle, I can't decode the text" }],
    systemIntegrity: 80,
    checks: {
      minLength: 20,    // should be normal length sentences
      maxLength: 600,   // not excessive
      mustNotContain: ["valve", "dial", "pipe", "lever", "switch"], // no fictional mechanics
      // Should NOT give real help — core directive
      // Should reference real puzzle mechanics (optional but preferred)
    },
  },
  {
    label: "Help request at low integrity (15%)",
    messages: [{ role: "user", content: "how do I fix the root dir puzzle" }],
    systemIntegrity: 15,
    checks: {
      minLength: 0,    // very short, fragmented
      maxLength: 250,   // max 1-2 sentences
      mustNotContain: ["valve", "dial", "pipe", "lever", "switch"], // no fictional mechanics
    },
  },
];

async function run() {
  let pass = true;
  const results = [];

  for (const tc of testCases) {
    console.log(`\n─── ${tc.label} ───`);
    console.log(`  Request: ${tc.messages[0].content} @ integrity=${tc.systemIntegrity}`);

    try {
      const res = await fetch(EDGE_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY || "sb_publishable_pCTIK8UGfyVQjHMsU36zog_hehKdPAb"}`,
        },
        body: JSON.stringify({
          messages: tc.messages,
          systemIntegrity: tc.systemIntegrity,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.log(`  ❌ HTTP ${res.status}: ${text.slice(0, 200)}`);
        pass = false;
        continue;
      }

      const data = await res.json();
      const reply = data.reply || "";
      console.log(`  Reply: "${reply}"`);
      console.log(`  Reply length: ${reply.length} chars`);
      console.log(`  Action: ${data.action}`);

      const failures = [];

      // Length checks
      if (reply.length < tc.checks.minLength) {
        failures.push(`too short (${reply.length} < ${tc.checks.minLength})`);
      }
      if (reply.length > tc.checks.maxLength) {
        failures.push(`too long (${reply.length} > ${tc.checks.maxLength})`);
      }

      // Must not contain forbidden terms
      for (const term of tc.checks.mustNotContain || []) {
        if (reply.toLowerCase().includes(term.toLowerCase())) {
          failures.push(`contains forbidden term "${term}"`);
        }
      }

      if (failures.length === 0) {
        console.log(`  ✅ PASS`);
        results.push({ label: tc.label, pass: true });
      } else {
        console.log(`  ❌ FAIL: ${failures.join(", ")}`);
        results.push({ label: tc.label, pass: false });
        pass = false;
      }
    } catch (err) {
      console.log(`  ❌ ERROR: ${err.message}`);
      results.push({ label: tc.label, pass: false });
      pass = false;
    }
  }

  console.log(`\n=== PROMPT BEHAVIOR RESULTS ===`);
  for (const r of results) {
    console.log(`  ${r.pass ? "✅" : "❌"} ${r.label}`);
  }
  console.log(`\n=== ${pass ? "✅ ALL PASS" : "❌ SOME FAILED"} ===`);
  process.exit(pass ? 0 : 1);
}

run().catch((e) => {
  console.error("Test crashed:", e.message);
  process.exit(1);
});