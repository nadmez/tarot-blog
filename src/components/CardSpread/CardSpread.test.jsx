import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import CardSpread from ".";

const CARDS = [
  {
    name: "The Magician",
    name_short: "ar01",
    image_url: "/assets/images/themagician.jpeg",
  },
  {
    name: "The High Priestess",
    name_short: "ar02",
    image_url: "/assets/images/thehighpriestess.jpeg",
  },
  {
    name: "The Empress",
    name_short: "ar03",
    image_url: "/assets/images/theempress.jpeg",
  },
];

test("is a labelled section containing a list of card slots", () => {
  render(<CardSpread cards={[]} />);

  const section = screen.getByRole("region", { name: "Çekilen kartlar" });
  expect(within(section).getByRole("list")).toBeInTheDocument();
});

test("shows three placeholders while no cards are drawn", () => {
  render(<CardSpread cards={[]} />);

  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(screen.getAllByText("Kart henüz çekilmedi")).toHaveLength(3);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});

test("shows each drawn card as an image with its name as alt text", () => {
  render(<CardSpread cards={CARDS} />);

  CARDS.forEach((card) => {
    expect(screen.getByRole("img", { name: card.name })).toHaveAttribute(
      "src",
      card.image_url
    );
  });
  expect(screen.queryByText("Kart henüz çekilmedi")).not.toBeInTheDocument();
});

test("always shows the card name as visible text, not only on hover", () => {
  render(<CardSpread cards={CARDS} />);

  CARDS.forEach((card) => {
    expect(
      screen.getByText(card.name, { selector: "figcaption" })
    ).toBeVisible();
  });
});
