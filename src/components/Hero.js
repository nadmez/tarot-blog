import Link from "next/link";
import { MoonIcon, StarIcon } from "./icons";

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="overflow-hidden bg-gradient-to-b from-primary/5 to-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24 lg:px-8">
        <div className="flex flex-col gap-6 text-center md:text-left">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Sezgisel Rehberlik</p>
          <h1 id="hero-heading" className="font-heading text-4xl font-semibold leading-tight text-primary sm:text-5xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </h1>
          <p className="text-lg leading-relaxed text-foreground/70">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href="/tarot"
              className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Tarota Başla
            </Link>
            <Link
              href="/blog"
              className="rounded-full border border-primary/30 px-6 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              Blogu Keşfet
            </Link>
          </div>
        </div>

        <div
          className="relative mx-auto flex h-72 w-full max-w-sm items-center justify-center sm:h-80"
          aria-hidden="true"
        >
          <div className="absolute h-56 w-40 -rotate-6 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-xl" />
          <div className="absolute flex h-56 w-40 rotate-6 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/90 to-accent/60 shadow-xl">
            <StarIcon className="h-16 w-16 text-white/80" />
          </div>
          <MoonIcon className="absolute -top-2 right-6 h-10 w-10 text-accent" />
        </div>
      </div>
    </section>
  );
}
