"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronIcon, CloseIcon, MenuIcon, MoonIcon } from "./icons";

const NAV_ITEMS = [
  { label: "Ana Sayfa", href: "/" },
  {
    label: "Hakkında",
    href: "/hakkinda",
    children: [
      { label: "Hakkında", href: "/hakkinda" },
      { label: "Benim Yaklaşımım", href: "/hakkinda/yaklasimim" },
    ],
  },
  {
    label: "Tarot",
    href: "/tarot",
    children: [
      { label: "Tarot Kart Tavsiyeleri", href: "/tarot/tavsiyeler" },
      { label: "Tarot Kart Anlamları", href: "/tarot/anlamlar" },
      { label: "Tarot Açılımları", href: "/tarot/acilimlar" },
      { label: "Ağızdan Ağıza Tarot", href: "/tarot/agizdan-agiza" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Podcastler", href: "/podcastler" },
  { label: "Bağlan", href: "/baglan" },
  { label: "Ücretsiz Haber Bülteni", href: "/haber-bulteni" },
];

export default function Header() {
  const [openDesktopMenu, setOpenDesktopMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState(null);
  const desktopNavRef = useRef(null);

  useEffect(() => {
    if (!openDesktopMenu) return;

    function handlePointerDown(event) {
      if (!desktopNavRef.current?.contains(event.target)) {
        setOpenDesktopMenu(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openDesktopMenu]);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-semibold text-primary"
          aria-label="Tarot Falı - Ana Sayfa"
        >
          <MoonIcon className="h-6 w-6 text-accent" aria-hidden="true" />
          Tarot Falı
        </Link>

        <nav
          aria-label="Ana menü"
          className="hidden md:flex"
          ref={desktopNavRef}
        >
          <ul className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.label} className="relative">
                {item.children ? (
                  <>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                      aria-expanded={openDesktopMenu === item.label}
                      aria-haspopup="true"
                      onClick={() =>
                        setOpenDesktopMenu((current) =>
                          current === item.label ? null : item.label
                        )
                      }
                    >
                      {item.label}
                      <ChevronIcon className="h-3 w-3" aria-hidden="true" />
                    </button>
                    {openDesktopMenu === item.label && (
                      <ul className="absolute left-0 top-full mt-2 min-w-[220px] rounded-xl border border-primary/10 bg-white py-2 shadow-lg">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent/10 hover:text-primary"
                              onClick={() => setOpenDesktopMenu(null)}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <button
            type="button"
            className="rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            aria-label="Giriş yap"
          >
            Giriş Yap
          </button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-primary md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? (
            <CloseIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobil menü"
          className="border-t border-primary/10 bg-background md:hidden"
        >
          <ul className="flex flex-col gap-1 px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <div>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-base font-medium text-foreground/90"
                      aria-expanded={openMobileSection === item.label}
                      onClick={() =>
                        setOpenMobileSection((current) =>
                          current === item.label ? null : item.label
                        )
                      }
                    >
                      {item.label}
                      <ChevronIcon
                        className={`h-4 w-4 transition-transform ${
                          openMobileSection === item.label ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {openMobileSection === item.label && (
                      <ul className="ml-3 flex flex-col gap-1 border-l border-accent/30 pl-4">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block rounded-lg px-3 py-2 text-sm text-foreground/70"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-foreground/90"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="border-t border-primary/10 px-4 py-4">
            <button
              type="button"
              className="w-full rounded-full border border-primary px-5 py-3 text-sm font-medium text-primary"
              aria-label="Giriş yap"
            >
              Giriş Yap
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
