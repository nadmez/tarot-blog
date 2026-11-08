import { QuestionIcon } from "../icons";

const PLACEHOLDER_COUNT = 3;
const CARD_SLOT = "w-18 sm:w-24 md:w-30";

export default function CardSpread({ cards = [] }) {
  const hasCards = cards.length > 0;

  return (
    <section
      aria-label="Çekilen kartlar"
      className="rounded-3xl border border-accent/30 bg-accent/5 px-4 py-4.5"
    >
      <ul className="flex items-start justify-center gap-4 sm:gap-6">
        {hasCards
          ? cards.map((card, index) => (
              <li key={`${card.name_short}-${index}`} className={CARD_SLOT}>
                <figure
                  className="fade-in-up flex flex-col items-center gap-2"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className="aspect-[2/3.5] w-full rounded-xl border-2 border-accent/50 object-cover shadow-[0_10px_30px_rgba(201,162,75,0.35)] transition duration-500 hover:-translate-y-2 hover:scale-105 hover:border-accent"
                  />
                  <figcaption className="text-center text-xs font-semibold uppercase tracking-wider text-primary">
                    {card.name}
                  </figcaption>
                </figure>
              </li>
            ))
          : Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
              <li key={index} className={CARD_SLOT}>
                <div className="flex aspect-[2/3.5] w-full items-center justify-center rounded-xl border-2 border-dashed border-accent/50 bg-white/60">
                  <QuestionIcon
                    className="size-7.5 animate-pulse text-accent/70"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Kart henüz çekilmedi</span>
                </div>
              </li>
            ))}
      </ul>
    </section>
  );
}
