import { expect, test } from "@playwright/test";

test.describe("home page content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has the Turkish title, language and a single h1", async ({ page }) => {
    await expect(page).toHaveTitle(
      "Tarot Falı | Sezgisel Tarot Okumaları ve Rehberlik"
    );
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("exposes a meta description", async ({ page }) => {
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Tarot kartları, açılımlar ve sezgisel okumalar/
    );
  });

  test("renders hero, approach and recent posts sections in order", async ({
    page,
  }) => {
    const hero = page
      .getByRole("region", {
        name: /Lorem ipsum dolor sit amet, consectetur adipiscing elit\./,
      })
      .first();
    const approach = page.getByRole("region", {
      name: "Lorem ipsum dolor sit amet consectetur.",
    });
    const recent = page.getByRole("region", { name: "Son Yazılar" });

    await expect(hero).toBeVisible();
    await expect(approach).toBeVisible();
    await expect(recent).toBeVisible();

    const [heroBox, approachBox, recentBox] = await Promise.all([
      hero.boundingBox(),
      approach.boundingBox(),
      recent.boundingBox(),
    ]);
    expect(heroBox.y).toBeLessThan(approachBox.y);
    expect(approachBox.y).toBeLessThan(recentBox.y);
  });

  test("uses a correct heading hierarchy", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 2 })).toHaveText([
      "Lorem ipsum dolor sit amet consectetur.",
      "Son Yazılar",
    ]);
    await expect(page.getByRole("heading", { level: 3 })).toHaveText([
      "Lorem ipsum dolor sit amet",
      "Consectetur adipiscing elit",
      "Sed do eiusmod tempor incididunt",
    ]);
  });

  test("lists three recent posts with dates, excerpts and read-more links", async ({
    page,
  }) => {
    const recent = page.getByRole("region", { name: "Son Yazılar" });
    const articles = recent.getByRole("article");
    await expect(articles).toHaveCount(3);

    const slugs = [
      "lorem-ipsum-dolor",
      "consectetur-adipiscing",
      "sed-do-eiusmod",
    ];
    const dates = ["2026-08-10", "2026-07-28", "2026-07-15"];

    for (const [i, slug] of slugs.entries()) {
      const article = articles.nth(i);
      await expect(article.locator("time")).toHaveAttribute(
        "datetime",
        dates[i]
      );
      await expect(article.locator("time")).toContainText("2026");
      await expect(
        article.getByRole("link", { name: "Devamını oku →" })
      ).toHaveAttribute("href", `/blog/${slug}`);
      await expect(
        article.getByRole("heading", { level: 3 }).getByRole("link")
      ).toHaveAttribute("href", `/blog/${slug}`);
    }
  });

  test("embeds valid Article JSON-LD for every recent post", async ({
    page,
  }) => {
    const raw = await page
      .locator('article script[type="application/ld+json"]')
      .allTextContents();
    expect(raw).toHaveLength(3);

    const parsed = raw.map((text) => JSON.parse(text));
    for (const data of parsed) {
      expect(data["@context"]).toBe("https://schema.org");
      expect(data["@type"]).toBe("Article");
      expect(data.headline).toBeTruthy();
      expect(data.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(data.description).toBeTruthy();
    }
    expect(parsed.map((d) => d.headline)).toEqual([
      "Lorem ipsum dolor sit amet",
      "Consectetur adipiscing elit",
      "Sed do eiusmod tempor incididunt",
    ]);
  });

  test("hides purely decorative graphics from assistive technology", async ({
    page,
  }) => {
    // Hero card illustration and post thumbnails are aria-hidden.
    expect(await page.locator('[aria-hidden="true"]').count()).toBeGreaterThan(
      3
    );
    await expect(page.getByRole("img")).toHaveCount(0);
  });
});
