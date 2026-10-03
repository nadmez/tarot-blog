import { expect, test } from "@playwright/test";

const SIMPLE_NAV = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Podcastler", href: "/podcastler" },
  { label: "Bağlan", href: "/baglan" },
  { label: "Ücretsiz Haber Bülteni", href: "/haber-bulteni" },
];

const TAROT_CHILDREN = [
  { label: "Tarot Kart Tavsiyeleri", href: "/tarot/tavsiyeler" },
  { label: "Tarot Kart Anlamları", href: "/tarot/anlamlar" },
  { label: "Tarot Açılımları", href: "/tarot/acilimlar" },
  { label: "Ağızdan Ağıza Tarot", href: "/tarot/agizdan-agiza" },
];

const ABOUT_CHILDREN = [
  { label: "Hakkında", href: "/hakkinda" },
  { label: "Benim Yaklaşımım", href: "/hakkinda/yaklasimim" },
];

test.describe("desktop header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("shows the brand link, main nav and login button; hides the mobile toggle", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: "Tarot Falı - Ana Sayfa" })
    ).toHaveAttribute("href", "/");
    await expect(
      page.getByRole("navigation", { name: "Ana menü" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Giriş yap" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Menüyü aç" })).toBeHidden();
  });

  test("renders every simple nav item with the right href", async ({
    page,
  }) => {
    const nav = page.getByRole("navigation", { name: "Ana menü" });
    for (const { label, href } of SIMPLE_NAV) {
      await expect(
        nav.getByRole("link", { name: label, exact: true })
      ).toHaveAttribute("href", href);
    }
  });

  test("opens and closes the Tarot dropdown via its toggle button", async ({
    page,
  }) => {
    const nav = page.getByRole("navigation", { name: "Ana menü" });
    const toggle = nav.getByRole("button", { name: "Tarot" });

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    for (const { label, href } of TAROT_CHILDREN) {
      await expect(nav.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href
      );
    }

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(
      nav.getByRole("link", { name: "Tarot Kart Anlamları" })
    ).toHaveCount(0);
  });

  test("opens the Hakkında dropdown with both entries", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Ana menü" });
    await nav.getByRole("button", { name: "Hakkında" }).click();
    for (const { label, href } of ABOUT_CHILDREN) {
      await expect(
        nav.getByRole("link", { name: label, exact: true })
      ).toHaveAttribute("href", href);
    }
  });

  test("closes an open dropdown when clicking outside the nav", async ({
    page,
  }) => {
    const nav = page.getByRole("navigation", { name: "Ana menü" });
    const toggle = nav.getByRole("button", { name: "Tarot" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await page.getByRole("heading", { level: 1 }).click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("navigates from a dropdown item and closes the dropdown", async ({
    page,
  }) => {
    const nav = page.getByRole("navigation", { name: "Ana menü" });
    const toggle = nav.getByRole("button", { name: "Tarot" });
    await toggle.click();
    await nav.getByRole("link", { name: "Tarot Açılımları" }).click();

    await expect(page).toHaveURL("/tarot/acilimlar");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("hero calls to action lead to /tarot and /blog", async ({ page }) => {
    await page.getByRole("link", { name: "Tarota Başla" }).click();
    await expect(page).toHaveURL("/tarot");

    await page.goto("/");
    await page.getByRole("link", { name: "Blogu Keşfet" }).click();
    await expect(page).toHaveURL("/blog");
  });

  test("brand link returns home from another page", async ({ page }) => {
    await page.goto("/blog");
    await page.getByRole("link", { name: "Tarot Falı - Ana Sayfa" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Lorem ipsum"
    );
  });

  test("recent post link goes to the post route", async ({ page }) => {
    await page
      .getByRole("heading", { level: 3 })
      .getByRole("link", { name: "Lorem ipsum dolor sit amet" })
      .click();
    await expect(page).toHaveURL("/blog/lorem-ipsum-dolor");
  });
});

test.describe("mobile header", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("hides the desktop nav and shows the menu toggle", async ({ page }) => {
    await expect(
      page.getByRole("navigation", { name: "Ana menü" })
    ).toBeHidden();
    await expect(page.getByRole("button", { name: "Menüyü aç" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Mobil menü" })
    ).toHaveCount(0);
  });

  test("toggles the mobile menu open and closed", async ({ page }) => {
    const open = page.getByRole("button", { name: "Menüyü aç" });
    await open.click();

    const menu = page.getByRole("navigation", { name: "Mobil menü" });
    await expect(menu).toBeVisible();
    const close = page.getByRole("button", { name: "Menüyü kapat" });
    await expect(close).toHaveAttribute("aria-expanded", "true");
    await expect(menu.getByRole("button", { name: "Giriş yap" })).toBeVisible();

    await close.click();
    await expect(menu).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Menüyü aç" })
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("expands a section accordion and shows its children", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    const menu = page.getByRole("navigation", { name: "Mobil menü" });
    const tarot = menu.getByRole("button", { name: "Tarot" });

    await tarot.click();
    await expect(tarot).toHaveAttribute("aria-expanded", "true");
    for (const { label, href } of TAROT_CHILDREN) {
      await expect(menu.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href
      );
    }

    await tarot.click();
    await expect(
      menu.getByRole("link", { name: "Tarot Kart Anlamları" })
    ).toHaveCount(0);
  });

  test("lists simple items and navigates, closing the menu afterwards", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    const menu = page.getByRole("navigation", { name: "Mobil menü" });
    for (const { label, href } of SIMPLE_NAV) {
      await expect(
        menu.getByRole("link", { name: label, exact: true })
      ).toHaveAttribute("href", href);
    }

    await menu.getByRole("link", { name: "Podcastler" }).click();
    await expect(page).toHaveURL("/podcastler");
    await expect(
      page.getByRole("navigation", { name: "Mobil menü" })
    ).toHaveCount(0);
  });

  test("navigates from a nested mobile link", async ({ page }) => {
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    const menu = page.getByRole("navigation", { name: "Mobil menü" });
    await menu.getByRole("button", { name: "Hakkında" }).click();
    await menu.getByRole("link", { name: "Benim Yaklaşımım" }).click();

    await expect(page).toHaveURL("/hakkinda/yaklasimim");
    await expect(
      page.getByRole("navigation", { name: "Mobil menü" })
    ).toHaveCount(0);
  });

  test("home content stays within the viewport width (no horizontal scroll)", async ({
    page,
  }) => {
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
