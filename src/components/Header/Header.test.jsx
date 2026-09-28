import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import Header from ".";

const PLAIN_NAV_LINKS = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Podcastler", href: "/podcastler" },
  { label: "Bağlan", href: "/baglan" },
  { label: "Ücretsiz Haber Bülteni", href: "/haber-bulteni" },
];

const DROPDOWN_LABELS = ["Hakkında", "Tarot"];

test("renders header structure on initial load", () => {
  const { container } = render(<Header />);

  const homeLink = screen.getByRole("link", { name: "Tarot Falı - Ana Sayfa" });
  expect(homeLink).toHaveAttribute("href", "/");
  expect(homeLink).toHaveTextContent("Tarot Falı");

  const desktopNav = screen.getByRole("navigation", { name: "Ana menü" });
  const nav = within(desktopNav);

  for (const { label, href } of PLAIN_NAV_LINKS) {
    const link = nav.getByRole("link", { name: label });
    expect(link).toHaveAttribute("href", href);
  }

  for (const label of DROPDOWN_LABELS) {
    const button = nav.getByRole("button", { name: label });
    expect(button).toHaveAttribute("aria-haspopup", "true");
    expect(button).toHaveAttribute("aria-expanded", "false");
  }

  expect(screen.getByRole("button", { name: /Giriş/i })).toHaveTextContent(
    "Giriş Yap"
  );

  const menuToggle = screen.getByRole("button", { name: "Menüyü aç" });
  expect(menuToggle).toHaveAttribute("aria-expanded", "false");

  expect(container.querySelector("#mobile-menu")).not.toBeInTheDocument();
});
