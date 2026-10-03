import { expect, test } from "@playwright/test";

const PAGES = [
  { name: "home", path: "/" },
  { name: "not-found", path: "/bu-sayfa-yok" },
];

for (const { name, path } of PAGES) {
  test.describe(`${name} page landmarks`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test("exposes banner, main and contentinfo landmarks exactly once", async ({
      page,
    }) => {
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
    });

    test("labels every navigation landmark", async ({ page }) => {
      const navs = page.getByRole("navigation");
      const count = await navs.count();
      expect(count).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < count; i++) {
        const label = await navs.nth(i).getAttribute("aria-label");
        expect(label, `navigation #${i} needs an aria-label`).toBeTruthy();
      }
    });

    test("every image has non-empty alt text", async ({ page }) => {
      const missing = await page.$$eval(
        "img",
        (imgs) => imgs.filter((img) => !img.getAttribute("alt")?.trim()).length
      );
      expect(missing).toBe(0);
    });

    test("every link and button has an accessible name", async ({ page }) => {
      const unnamed = await page.$$eval("a, button", (els) =>
        els
          .filter(
            (el) =>
              !(el.getAttribute("aria-label") || el.textContent || "").trim()
          )
          .map((el) => el.outerHTML.slice(0, 80))
      );
      expect(unnamed).toEqual([]);
    });
  });
}

test.describe("keyboard navigation", () => {
  test("first Tab stop is the brand link, and focus is visibly tracked", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Tarot Falı - Ana Sayfa" })
    ).toBeFocused();
  });

  test("dropdown toggle opens with Enter and Space from the keyboard", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const nav = page.getByRole("navigation", { name: "Ana menü" });
    const toggle = nav.getByRole("button", { name: "Tarot" });

    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("hero links are reachable and activate with Enter", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Tarota Başla" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/tarot");
  });

  test("not-found home link is keyboard operable", async ({ page }) => {
    await page.goto("/bu-sayfa-yok");
    await page.getByRole("link", { name: "Anasayfaya dön" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/");
  });
});
