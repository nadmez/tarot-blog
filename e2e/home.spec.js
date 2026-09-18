import { expect, test } from "@playwright/test";

test("home page shows the hero heading and actions", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tarota Başla" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Blogu Keşfet" })).toBeVisible();
});
