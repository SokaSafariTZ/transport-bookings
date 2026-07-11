"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Ticket, Plane, Bus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/?mode=flights", label: "Flights" },
  { href: "/?mode=buses", label: "Buses" },
  { href: "/manage", label: "My trips" },
];

/** Header that starts transparent over the hero, then gains backdrop-blur on scroll. */
export function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-canvas/85 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/appicon.png"
            alt="SokaSafari"
            width={38}
            height={38}
            className="rounded-[10px] shadow-[0_4px_16px_rgba(245,197,66,0.35)]"
            priority
          />
          <span className="text-lg font-extrabold tracking-tight leading-none">
            <span className="text-gold">Soka</span>
            <span className={cn("transition-colors", scrolled ? "text-primary" : "text-white")}>
              Safari
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                scrolled
                  ? "text-subtitle hover:bg-white/6 hover:text-title"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <CurrencySwitcher
            compact
            className={
              scrolled
                ? undefined
                : "border-white/25 bg-white/10 [&_button]:text-white/80 [&_button[aria-pressed=true]]:bg-gold [&_button[aria-pressed=true]]:text-canvas"
            }
          />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/manage">
              <Ticket className="size-4" />
              Find booking
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/search?mode=flights">
              <Plane className="size-4" />
              Book now
            </Link>
          </Button>
          {/* Mobile hamburger */}
          <button
            className="ml-1 grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="border-t border-line bg-canvas/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col px-5 py-3 gap-1">
            {NAV_LINKS.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-[10px] px-3 py-3 text-sm font-medium text-subtitle hover:bg-white/5 hover:text-title"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 pb-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/search?mode=buses" onClick={() => setMobileOpen(false)}>
                  <Bus className="size-4" /> Buses
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/search?mode=flights" onClick={() => setMobileOpen(false)}>
                  <Plane className="size-4" /> Flights
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
