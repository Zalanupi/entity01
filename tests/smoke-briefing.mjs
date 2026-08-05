/* Phase 4 — Briefing Screen smoke test (plain Playwright library script) */
import { chromium } from "playwright";

const BASE = "http://localhost:4173";
let failures = 0;

function check(name, cond, extra = "") {
  const status = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`[${status}] ${name}${extra ? ` — ${extra}` : ""}`);
}

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

/* ── AC1-3: Briefing renders on first load, no shell chrome ── */
await page.goto(BASE, { waitUntil: "networkidle" });

const h1 = page.locator("h1");
check("AC2 Title = RECOVERY_SHELL", (await h1.textContent())?.trim() === "RECOVERY_SHELL");
check("AC7 Title has glitch class", (await h1.getAttribute("class"))?.includes("animate-glitch"));

const subtitle = page.locator("p").first();
check(
  "AC2 Warning subtitle exact",
  (await subtitle.textContent())?.trim() === "[ UNAUTHORIZED TERMINATION OF THIS SESSION IS NOT RECOMMENDED ]",
);

const bullets = page.locator("ol li");
check("AC2 Exactly 3 instruction bullets", (await bullets.count()) === 3);
const bulletTexts = await bullets.allTextContents();
check("AC2 Bullet 1 mentions SYSTEM_INTEGRITY", bulletTexts[0].includes("SYSTEM_INTEGRITY"));
check("AC2 Bullet 2 mentions diagnostic tasks", bulletTexts[1].includes("diagnostic tasks"));
check("AC2 Bullet 3 mentions ENTITY_01", bulletTexts[2].includes("ENTITY_01"));

const cta = page.locator("button");
check("AC2 Single CTA button", (await cta.count()) === 1);
check("AC2 CTA = BOOT_SESSION", (await cta.textContent())?.trim() === "BOOT_SESSION");

check("AC3 No header on Briefing", (await page.locator("header").count()) === 0);
check("AC3 No sidebar on Briefing", (await page.locator("aside").count()) === 0);

await page.screenshot({ path: "tests/.artifacts/briefing.png" });

/* ── AC4-5: BOOT_SESSION enters shell on LOG_EXTRACT ── */
await cta.click();
await page.waitForTimeout(500);

check("AC5 Header renders after boot", (await page.locator("header").count()) === 1);
check("AC5 Sidebar renders after boot", (await page.locator("aside").count()) === 1);
check("AC4 Lands on LOG_EXTRACT", (await page.locator("h2").first().textContent())?.trim() === "LOG_EXTRACT");
check("AC5 4 nav items in sidebar", (await page.locator("nav a").count()) === 4);

/* ── AC6: systemIntegrity unchanged (42 on fresh load) ── */
const integrityText = await page.locator("header").textContent();
check("AC6 Integrity = 42% on LOG_EXTRACT", integrityText.includes("42%"));

await page.screenshot({ path: "tests/.artifacts/after-boot.png" });

/* ── AC8: REBOOT does not return to Briefing ── */
await page.locator("button", { hasText: "REBOOT" }).click();
await page.waitForTimeout(300);
check("AC8 Header still present after REBOOT", (await page.locator("header").count()) === 1);
check("AC8 No Briefing h1 after REBOOT", (await page.locator("h1").count()) === 0);
check(
  "AC8 No BOOT_SESSION button after REBOOT",
  (await page.locator("button", { hasText: "BOOT_SESSION" }).count()) === 0,
);
check(
  "AC8 Still on LOG_EXTRACT after REBOOT",
  (await page.locator("h2").first().textContent())?.trim() === "LOG_EXTRACT",
);

/* ── Refresh returns to Briefing (no persistence) ── */
await page.reload({ waitUntil: "networkidle" });
check("Refresh → Briefing title again", (await page.locator("h1").textContent())?.trim() === "RECOVERY_SHELL");
check("Refresh → no header", (await page.locator("header").count()) === 0);

await browser.close();
console.log(failures === 0 ? "\n✅ ALL CHECKS PASSED" : `\n❌ ${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
