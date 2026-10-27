import TarotChat from "@/components/TarotChat";

export const metadata = {
  title: "Tarot Okuması | Tarot Falı",
  description:
    "Sorunuzu yazın, üç tarot kartı çekilsin ve kartların yorumunu sohbet ederek birlikte keşfedin.",
};

export default function TarotPage() {
  return (
    <section
      aria-labelledby="tarot-heading"
      className="mx-auto flex min-h-[calc(100dvh-73px)] max-w-3xl flex-col gap-6 px-4 py-4 sm:px-6 md:py-14"
    >
      <header className="flex flex-col gap-2 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          Sezgisel Rehberlik
        </p>
        <h1
          id="tarot-heading"
          className="font-heading text-3xl font-semibold text-primary sm:text-4xl"
        >
          Tarot Okuması
        </h1>
        <p className="text-foreground/70">
          Sorunuzu yazın; üç kart çekelim ve birlikte yorumlayalım.
        </p>
      </header>
      <TarotChat />
    </section>
  );
}
