import { test, expect } from "@playwright/test";

test.describe("Phase 4 — Briefing Screen", () => {
  test("AC1-3: Briefing renders on first load, no header/sidebar", async ({
    page,
  }) => {
    await page.goto("/");

    // Title present with glitch treatment
    const h1 = page.locator("h1");
    await expect(h1).toHaveText("RECOVERY_SHELL");
    await expect(h1).toHaveClass(/animate-glitch/);

    // Warning subtitle
    await expect(page.locator("p").first()).toHaveText(
      "[ UNAUTHORIZED TERMINATION OF THIS SESSION IS NOT RECOMMENDED ]",
    );

    // Exactly 3 instruction bullets
    const bullets = page.locator("ol li");
    await expect(bullets).toHaveCount(3);

    // Single BOOT_SESSION CTA
    const cta = page.locator("button");
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveText("BOOT_SESSION");

    // AC3: No header or sidebar chrome
    await expect(page.locator("header")).toHaveCount(0);
    await expect(page.locator("aside")).toHaveCount(0);
  });

  test("AC4-5: BOOT_SESSION enters shell on LOG_EXTRACT", async ({ page }) => {
    await page.goto("/");
    await page.locator("button", { hasText: "BOOT_SESSION" }).click();

    // Shell renders: header + sidebar
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("aside")).toHaveCount(1);

    // Lands on LOG_EXTRACT (default tab)
    await expect(page.locator("h2").first()).toHaveText("LOG_EXTRACT");

    // Sidebar nav renders all routes
    const nav = page.locator("nav a");
    await expect(nav).toHaveCount(4);
  });

  test("AC6: systemIntegrity is 42 on LOG_EXTRACT after boot", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("button", { hasText: "BOOT_SESSION" }).click();

    const integrity = page
      .locator("header")
      .getByText(/42%/)
      .first();
    await expect(integrity).toHaveText("42%");
  });

  test("AC8: REBOOT does not return to Briefing Screen", async ({ page }) => {
    await page.goto("/");
    await page.locator("button", { hasText: "BOOT_SESSION" }).click();

    // Click REBOOT in sidebar
    await page.locator("button", { hasText: "REBOOT" }).click();

    // Still inside the shell, no Briefing Screen
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(0);
    await expect(page.locator("button", { hasText: "BOOT_SESSION" })).toHaveCount(
      0,
    );
    await expect(page.locator("h2").first()).toHaveText("LOG_EXTRACT");
  });

  test("Refresh returns to Briefing Screen (no persistence)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("button", { hasText: "BOOT_SESSION" }).click();
    await expect(page.locator("header")).toHaveCount(1);

    // Refresh → back to Briefing Screen
    await page.reload();
    await expect(page.locator("h1")).toHaveText("RECOVERY_SHELL");
    await expect(page.locator("header")).toHaveCount(0);
  });
});
