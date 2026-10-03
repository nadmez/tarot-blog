import { expect, test } from "@playwright/test";

// Every route linked from the header, footer, hero and recent posts.
// None of these pages are built yet, so each must fall through to the
// custom "Sayfa yapım aşamasında" not-found page.
const UNBUILT_ROUTES = [
  "/hakkinda",
  "/hakkinda/yaklasimim",
  "/tarot",
  "/tarot/tavsiyeler",
  "/tarot/anlamlar",
  "/tarot/acilimlar",
  "/tarot/agizdan-agiza",
  "/blog",
  "/blog/lorem-ipsum-dolor",
  "/blog/consectetur-adipiscing",
  "/blog/sed-do-eiusmod",
  "/podcastler",
  "/baglan",
  "/haber-bulteni",
  "/bu-sayfa-yok",
];

test.describe("under-construction pages", () => {
  for (const route of UNBUILT_ROUTES) {
    test(`${route} responds 404 with the custom under-construction page`, async ({
      page,
    }) => {
      const response = await page.goto(route);

      expect(response.status()).toBe(404);
      await expect(page).toHaveTitle("Sayfa yapım aşamasında | Tarot Falı");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Sayfa yapım aşamasında"
      );
      await expect(
        page.getByRole("link", { name: "Anasayfaya dön" })
      ).toBeVisible();
    });
  }
});

test.describe("not-found page details", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/bu-sayfa-yok");
  });

  test("does not show the default Next.js 404 copy", async ({ page }) => {
    const body = page.locator("body");
    await expect(body).not.toContainText("This page could not be found");
    await expect(body).not.toContainText(/\b404\b/);
  });

  test("shows a loaded cat illustration with Turkish alt text", async ({
    page,
  }) => {
    const cat = page.getByRole("img", {
      name: "Süs amaçlı kedi illüstrasyonu",
    });
    await expect(cat).toBeVisible();
    await expect
      .poll(() => cat.evaluate((img) => img.complete && img.naturalWidth > 0))
      .toBe(true);
  });

  test("orders content as cat, heading, then home link", async ({ page }) => {
    const cat = await page
      .getByRole("img", { name: "Süs amaçlı kedi illüstrasyonu" })
      .boundingBox();
    const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
    const link = await page
      .getByRole("link", { name: "Anasayfaya dön" })
      .boundingBox();

    expect(cat.y).toBeLessThan(heading.y);
    expect(heading.y).toBeLessThan(link.y);
  });

  test("keeps the site header and footer around the content", async ({
    page,
  }) => {
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Ana menü" })
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("heading", { level: 1 })
    ).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("home link returns to the home page", async ({ page }) => {
    await page.getByRole("link", { name: "Anasayfaya dön" }).click();
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("link", { name: "Tarota Başla" })
    ).toBeVisible();
  });

  test("can be left through the header navigation", async ({ page }) => {
    await page
      .getByRole("navigation", { name: "Ana menü" })
      .getByRole("link", { name: "Ana Sayfa", exact: true })
      .click();
    await expect(page).toHaveURL("/");
  });
});
