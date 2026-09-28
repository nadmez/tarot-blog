import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import Footer from ".";

const FOOTER_LINKS = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hakkında", href: "/hakkinda" },
  { label: "Tarot", href: "/tarot" },
  { label: "Blog", href: "/blog" },
  { label: "Podcastler", href: "/podcastler" },
  { label: "Bağlan", href: "/baglan" },
];

test("renders footer structure and links", () => {
  render(<Footer />);

  expect(screen.getByText("Tarot Falı")).toBeInTheDocument();

  const footerNav = screen.getByRole("navigation", {
    name: "Alt bilgi menüsü",
  });
  const nav = within(footerNav);

  for (const { label, href } of FOOTER_LINKS) {
    expect(nav.getByRole("link", { name: label })).toHaveAttribute(
      "href",
      href
    );
  }

  expect(screen.getByRole("link", { name: "Abone Ol" })).toHaveAttribute(
    "href",
    "/haber-bulteni"
  );

  const year = new Date().getFullYear();
  expect(
    screen.getByText(`© ${year} Tarot Falı. Tüm hakları saklıdır.`)
  ).toBeInTheDocument();
});
