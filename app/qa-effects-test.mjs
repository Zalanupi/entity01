// E2E test: ENTITY_01 visual actions via route interception.
// Verifies every non-NONE action fires the correct overlay AND NONE fires nothing.

import { chromium } from "/app/node_modules/playwright/index.mjs";

const BROWSER_ARGS = ["--no-sandbox", "--disable-gpu"];

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  await page.click("button:has-text('BOOT_SESSION')");
  await page.waitForTimeout(500);

  const inputVisible = await page
    .locator('input[placeholder="> type a message ..."]')
    .isVisible();
  if (!inputVisible) {
    console.log("❌ Chat input not found — aborting.");
    await browser.close();
    process.exit(1);
  }
  console.log("✅ Booted — chat page visible");

  // ── Route interception: respond with a chosen action ──
  let actionToSend = "NONE";
  await page.route("**/functions/v1/entity01-chat", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ reply: `Test: ${actionToSend}`, action: actionToSend }),
    });
  });

  function fulfilWith(action) {
    actionToSend = action;
  }

  const chatInput = page.locator('input[placeholder="> type a message ..."]');
  const sendBtn = page.locator('button:has-text("SEND")');

  async function sendChat(text) {
    await chatInput.fill(text);
    await sendBtn.click();
    await page.waitForTimeout(2200); // let response + effect play
  }

  const overlayCounts = async () => ({
    glitch: await page.locator('[data-effect="glitch-flash"]').count(),
    crash: await page.locator('[data-effect="fake-crash"]').count(),
    jump: await page.locator('[data-effect="jumpscare"]').count(),
  });

  let pass = true;

  // ── NONE ──
  console.log("\n--- NONE (should NOT fire any overlay) ---");
  fulfilWith("NONE");
  await sendChat("test none");
  const { glitch, crash, jump } = await overlayCounts();
  if (glitch + crash + jump === 0) {
    console.log("✅ NONE: no overlay visible (expected)");
  } else {
    console.log(`❌ NONE: unexpected overlays glitch=${glitch} crash=${crash} jump=${jump}`);
    pass = false;
  }

  // ── GLITCH_FLASH ──
  console.log("\n--- GLITCH_FLASH ---");
  fulfilWith("GLITCH_FLASH");
  await sendChat("trigger glitch");
  const g = (await overlayCounts()).glitch;
  console.log(g >= 1 ? `✅ GLITCH_FLASH overlay appeared (count=${g})` : "❌ GLITCH_FLASH not found");
  if (g < 1) pass = false;
  await page.waitForTimeout(700);
  const g2 = (await overlayCounts()).glitch;
  console.log(g2 === 0 ? "  → auto-cleared ✅" : `  → NOT cleared (${g2}) ❌`);
  if (g2 !== 0) pass = false;

  // ── FAKE_CRASH ──
  console.log("\n--- FAKE_CRASH ---");
  fulfilWith("FAKE_CRASH");
  await sendChat("trigger crash");
  const c = (await overlayCounts()).crash;
  console.log(c >= 1 ? `✅ FAKE_CRASH overlay appeared (count=${c})` : "❌ FAKE_CRASH not found");
  if (c < 1) pass = false;
  await page.waitForTimeout(1500);
  const c2 = (await overlayCounts()).crash;
  console.log(c2 === 0 ? "  → auto-cleared ✅" : `  → NOT cleared (${c2}) ❌`);
  if (c2 !== 0) pass = false;

  // ── JUMPSCARE ──
  console.log("\n--- JUMPSCARE ---");
  fulfilWith("JUMPSCARE");
  await sendChat("trigger jumpscare");
  const j = (await overlayCounts()).jump;
  console.log(j >= 1 ? `✅ JUMPSCARE overlay appeared (count=${j})` : "❌ JUMPSCARE not found");
  if (j < 1) pass = false;
  await page.waitForTimeout(900);
  const j2 = (await overlayCounts()).jump;
  console.log(j2 === 0 ? "  → auto-cleared ✅" : `  → NOT cleared (${j2}) ❌`);
  if (j2 !== 0) pass = false;

  // ── INTEGRITY_SHAKE ──
  console.log("\n--- INTEGRITY_SHAKE ---");
  fulfilWith("INTEGRITY_SHAKE");
  await sendChat("trigger shake");
  // The shake lives on the meter (data-shaking toggles true ~650ms)
  let shook = false;
  for (let i = 0; i < 8; i++) {
    const shaking = await page.locator('[data-shaking="true"]').count();
    if (shaking >= 1) { shook = true; break; }
    await page.waitForTimeout(100);
  }
  console.log(shook ? "✅ INTEGRITY_SHAKE: meter data-shaking=true seen" : "❌ INTEGRITY_SHAKE: meter never shook");
  if (!shook) pass = false;

  // ── Console errors ──
  const realErrors = consoleErrors.filter(
    (e) => !e.includes("favicon") && !e.includes("ERR_BLOCKED") && !e.includes("Autoplay")
  );
  console.log(realErrors.length === 0
    ? "\n✅ No console errors"
    : `\n❌ Console errors (${realErrors.length}):\n  ` + realErrors.join("\n  "));
  if (realErrors.length > 0) pass = false;

  console.log(`\n=== VISUAL EFFECTS TEST RESULT: ${pass ? "✅ PASS" : "❌ FAIL"} ===`);
  await browser.close();
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error("Test crashed:", e.message);
  process.exit(1);
});
