import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hakkında", href: "/hakkinda" },
  { label: "Tarot", href: "/tarot" },
  { label: "Blog", href: "/blog" },
  { label: "Podcastler", href: "/podcastler" },
  { label: "Bağlan", href: "/baglan" },
];

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-primary text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-heading text-lg font-semibold">Tarot Falı</p>
            <p className="mt-2 max-w-xs text-sm text-white/70">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>

          <nav aria-label="Alt bilgi menüsü">
            <ul className="grid grid-cols-2 gap-2 text-sm text-white/80 sm:grid-cols-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-xs">
            <p className="text-sm font-semibold">Ücretsiz Haber Bülteni</p>
            <p className="mt-2 text-sm text-white/70">
              Lorem ipsum dolor sit amet consectetur adipiscing.
            </p>
            <Link
              href="/haber-bulteni"
              className="mt-3 inline-block rounded-full bg-accent px-5 py-2 text-sm font-semibold text-primary hover:bg-accent/90"
            >
              Abone Ol
            </Link>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Tarot Falı. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
