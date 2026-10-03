import { expect, test } from "@playwright/test";

const FOOTER_LINKS = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hakkında", href: "/hakkinda" },
  { label: "Tarot", href: "/tarot" },
  { label: "Blog", href: "/blog" },
  { label: "Podcastler", href: "/podcastler" },
  { label: "Bağlan", href: "/baglan" },
];

test.describe("footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has a labelled footer navigation with all links", async ({ page }) => {
    const nav = page.getByRole("contentinfo").getByRole("navigation", {
      name: "Alt bilgi menüsü",
    });
    await expect(nav).toBeVisible();
    for (const { label, href } of FOOTER_LINKS) {
      await expect(
        nav.getByRole("link", { name: label, exact: true })
      ).toHaveAttribute("href", href);
    }
  });

  test("shows the brand name and a copyright line with the current year", async ({
    page,
  }) => {
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByText("Tarot Falı", { exact: true })).toBeVisible();
    await expect(footer).toContainText(
      `© ${new Date().getFullYear()} Tarot Falı. Tüm hakları saklıdır.`
    );
  });

  test("newsletter call to action links to /haber-bulteni", async ({
    page,
  }) => {
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByText("Ücretsiz Haber Bülteni")).toBeVisible();
    await footer.getByRole("link", { name: "Abone Ol" }).click();
    await expect(page).toHaveURL("/haber-bulteni");
  });

  test("footer sits below the page content", async ({ page }) => {
    const mainBox = await page.getByRole("main").boundingBox();
    const footerBox = await page.getByRole("contentinfo").boundingBox();
    expect(footerBox.y).toBeGreaterThanOrEqual(mainBox.y + mainBox.height - 1);
  });
});
