import { test, expect } from "@playwright/test";

test.describe("باستا مينا — Pasta Mina site", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/index.html");
  });

  test("loads with RTL + Arabic title", async ({ page }) => {
    await expect(page).toHaveTitle(/باستا مينا/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  });

  test("hero headline and both CTAs are visible", async ({ page }) => {
    await expect(page.locator(".hero h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /احجز طاولة/ }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /استعرض القائمة/ })).toBeVisible();
  });

  test("cites real Google rating 4.6", async ({ page }) => {
    await expect(page.getByText(/4\.6/).first()).toBeVisible();
    await expect(page.getByText(/خرائط قوقل/).first()).toBeVisible();
  });

  test("no invented prices — uses 'حسب القائمة'", async ({ page }) => {
    await expect(page.getByText(/حسب القائمة/).first()).toBeVisible();
    // ensure no SAR price tokens like "٣٤ ريال" / "34 ريال" leaked into dish cards
    const dishText = await page.locator("#dishes").innerText();
    expect(dishText).not.toMatch(/\d+\s*ريال/);
  });

  test("full-screen mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const burger = page.locator("#burger");
    await expect(burger).toBeVisible();
    await burger.click();
    const overlay = page.locator("#overlay");
    await expect(overlay).toHaveClass(/open/);
    // overlay should cover the full viewport width
    const box = await overlay.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(389);
    await page.locator("#overlayClose").click();
    await expect(overlay).not.toHaveClass(/open/);
  });

  test("reservation form prefills WhatsApp + shows toast", async ({ page, context }) => {
    await page.locator("#name").fill("عبدالله");
    await page.locator("#phone").fill("0501234567");
    const popupPromise = context.waitForEvent("page").catch(() => null);
    await page.locator("#reserveForm button[type=submit]").click();
    await expect(page.locator("#toast")).toHaveClass(/show/);
    const popup = await popupPromise;
    if (popup) {
      // wa.me may redirect to api.whatsapp.com/send — both carry the same number
      expect(popup.url()).toContain("966554580943");
    }
  });

  test("floating FABs present (WhatsApp, call, maps)", async ({ page }) => {
    await expect(page.locator(".fab-wa")).toHaveAttribute("href", /wa\.me\/966554580943/);
    await expect(page.locator(".fab-call")).toHaveAttribute("href", /tel:0554580943/);
    await expect(page.locator(".fab-map")).toHaveAttribute("href", /google\.com\/maps/);
  });

  test("no horizontal scroll at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(2);
  });

  test("every img has alt text", async ({ page }) => {
    const imgs = page.locator("img");
    const count = await imgs.count();
    for (let i = 0; i < count; i++) {
      await expect(imgs.nth(i)).toHaveAttribute("alt", /.+/);
    }
  });

  test("JSON-LD Restaurant schema with aggregateRating", async ({ page }) => {
    const ld = await page.locator('script[type="application/ld+json"]').innerText();
    const data = JSON.parse(ld);
    expect(data["@type"]).toBe("Restaurant");
    expect(data.aggregateRating.ratingValue).toBe("4.6");
    expect(data.aggregateRating.reviewCount).toBe("235");
    expect(data.servesCuisine).toContain("Italian");
  });
});
