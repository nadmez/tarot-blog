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
      className="mx-auto flex min-h-[calc(100dvh-73px)] max-w-3xl flex-col gap-6 px-4 py-4 sm:px-6 md:py-[16px]"
    >
      <header className="text-center">
        <p
          id="tarot-heading"
          className="text-sm font-medium uppercase tracking-widest text-accent"
        >
          Sorunuzu yazın; üç kart çekelim ve birlikte yorumlayalım.
        </p>
      </header>
      <TarotChat />
    </section>
  );
}
