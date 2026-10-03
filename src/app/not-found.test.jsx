import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import NotFound, { metadata } from "./not-found";

test("renders Turkish under-construction message as h1", () => {
  render(<NotFound />);

  const heading = screen.getByRole("heading", { level: 1 });
  expect(heading).toHaveTextContent(/^Sayfa yapım aşamasında$/);
});

test("does not show default Next.js 404 copy", () => {
  const { container } = render(<NotFound />);
  const bodyText = container.textContent ?? "";

  expect(bodyText).not.toContain("This page could not be found.");
  expect(bodyText).not.toMatch(/\b404\b/);
});

test('renders home link "Anasayfaya dön" pointing to /', () => {
  render(<NotFound />);

  const homeLink = screen.getByRole("link", { name: "Anasayfaya dön" });
  expect(homeLink).toHaveAttribute("href", "/");
});

test("renders decorative cat image with Turkish alt", () => {
  render(<NotFound />);

  const catImage = screen.getByRole("img", {
    name: /Süs amaçlı kedi illüstrasyonu/i,
  });
  expect(catImage).toBeInTheDocument();
  expect(catImage.getAttribute("alt")?.trim()).not.toBe("");
});

test("orders content: cat image, then h1, then home link", () => {
  render(<NotFound />);

  const catImage = screen.getByRole("img", {
    name: /Süs amaçlı kedi illüstrasyonu/i,
  });
  const heading = screen.getByRole("heading", {
    level: 1,
    name: "Sayfa yapım aşamasında",
  });
  const homeLink = screen.getByRole("link", { name: "Anasayfaya dön" });

  expect(
    catImage.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(
    heading.compareDocumentPosition(homeLink) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});

test("exports metadata title including Sayfa yapım aşamasında", () => {
  expect(metadata).toBeDefined();
  const title =
    typeof metadata.title === "string"
      ? metadata.title
      : (metadata.title?.default ?? String(metadata.title));
  expect(title).toContain("Sayfa yapım aşamasında");
});
