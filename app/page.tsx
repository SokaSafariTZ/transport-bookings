import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plane,
  Bus,
  ShieldCheck,
  Zap,
  Globe2,
  Ticket,
  MapPin,
  Users,
  Star,
  ArrowRight,
  Smartphone,
  CreditCard,
  HeartHandshake,
  Trophy,
  ChevronDown,
} from "lucide-react";
import { StickyHeader } from "@/components/StickyHeader";
import { SiteFooter } from "@/components/SiteHeader";
import { SearchForm } from "@/components/SearchForm";
import { Card, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { ROUTES, getLocationByCode } from "@/lib/data/catalog";
import { formatMoney } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const SERVICES = [
  {
    icon: Plane,
    title: "Flights",
    sub: "Book flights across Africa to any match",
    color: "text-primary",
    bg: "bg-primary/12",
    href: "/search?mode=flights",
  },
  {
    icon: Bus,
    title: "Buses",
    sub: "Affordable coach travel between cities",
    color: "text-gold",
    bg: "bg-gold/12",
    href: "/search?mode=buses",
  },
  {
    icon: Ticket,
    title: "Tickets",
    sub: "Match & event tickets at the best price",
    color: "text-success",
    bg: "bg-success/12",
    href: "#",
  },
  {
    icon: ShieldCheck,
    title: "eVisa",
    sub: "Fast travel document processing",
    color: "text-indigo",
    bg: "bg-indigo/12",
    href: "#",
  },
  {
    icon: MapPin,
    title: "Accommodation",
    sub: "Hotels & stays close to stadiums",
    color: "text-orange",
    bg: "bg-orange/12",
    href: "#",
  },
  {
    icon: Users,
    title: "Fan ID",
    sub: "Your official fan digital identity",
    color: "text-amber",
    bg: "bg-amber/12",
    href: "#",
  },
  {
    icon: Globe2,
    title: "Explore",
    sub: "Safaris & tourism around Africa",
    color: "text-teal",
    bg: "bg-teal/12",
    href: "#",
  },
  {
    icon: HeartHandshake,
    title: "FanPilot",
    sub: "Match-day guides & local experts",
    color: "text-danger",
    bg: "bg-danger/12",
    href: "#",
  },
  {
    icon: Trophy,
    title: "Community",
    sub: "Fan feed, chat & predictions",
    color: "text-primary",
    bg: "bg-primary/8",
    href: "#",
  },
] as const;

const FEATURES = [
  {
    icon: Zap,
    title: "Book in seconds",
    body: "Search, compare, pick a seat and confirm — the entire journey takes under two minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Verified operators",
    body: "Every airline and coach line is vetted. Real-time availability, no overbooking.",
  },
  {
    icon: Ticket,
    title: "One PNR wallet",
    body: "Flights, buses and match tickets together. Manage every trip by a single reference.",
  },
  {
    icon: CreditCard,
    title: "Flexible payments",
    body: "Pay by card, mobile money or your SokaSafari wallet. No hidden conversion fees.",
  },
  {
    icon: Smartphone,
    title: "Download the app",
    body: "The full SokaSafari super-app is on Android and iOS. Fan ID, AI assistant and more.",
  },
  {
    icon: Star,
    title: "Match-day trusted",
    body: "Used by thousands of fans attending AFCON, CAF CL and national team fixtures.",
  },
];

const STATS = [
  { value: "20+", label: "Cities served" },
  { value: "12", label: "Operators" },
  { value: "50K+", label: "Fans served" },
  { value: "4.4★", label: "App rating" },
];

export default function LandingPage() {
  const popularRoutes = ROUTES.slice(0, 6).map((r) => ({
    mode: r.mode,
    from: getLocationByCode(r.originCode)!,
    to: getLocationByCode(r.destCode)!,
    price: r.basePrice,
  }));

  return (
    <>
      <StickyHeader />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      {/* Hero fills the full viewport; fixed header floats above it */}
      <section className="relative isolate min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background: real app bg image */}
        <Image
          src="/main-bg-image.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          quality={85}
        />
        {/* Layered overlay — mimics the app's rgba(0,0,0,0.35) scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-canvas" />
        {/* Subtle blue radial wash */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,158,255,0.18),transparent_70%)]" />

        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-5 pt-24 pb-16 text-center">
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your Ultimate Football &amp; Safari Experience
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
            Book flights, buses, match tickets, eVisa and safaris — all in one place
            for football fans across Africa.
          </p>

          {/* CTA row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="shadow-[0_8px_32px_rgba(59,158,255,0.5)]">
              <Link href="/search?mode=flights">
                <Plane className="size-5" />
                Search Flights
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/search?mode=buses">
                <Bus className="size-5" />
                Search Buses
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-white/50">
            Join thousands of football fans and safari enthusiasts
          </p>

          {/* Stats strip */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-[16px] border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-md">
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/65">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Scroll cue */}
          <a href="#services" className="mt-10 flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition">
            <span className="text-xs tracking-widest uppercase">Explore</span>
            <ChevronDown className="size-5 animate-bounce" />
          </a>
        </div>
      </section>

      {/* ── SERVICES GRID ─────────────────────────────────────────────────── */}
      <section id="services" className="bg-canvas-deep">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="mb-10 text-center">
            <Badge tone="info" className="mb-3">Everything in one app</Badge>
            <h2 className="text-3xl font-extrabold text-title sm:text-4xl">
              One platform.<br className="sm:hidden" /> Every fan need.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-subtitle">
              From travel documents to safari adventures — SokaSafari covers the
              complete match-day journey.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-9 lg:gap-4">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              const isActive = s.href !== "#";
              const inner = (
                <div className={`group flex flex-col items-center rounded-[20px] border border-line p-4 text-center transition-all hover:border-white/20 hover:bg-card-elevated ${isActive ? "cursor-pointer" : "opacity-75"}`}>
                  <span className={`grid size-12 place-items-center rounded-[14px] ${s.bg} transition-transform group-hover:scale-110`}>
                    <Icon className={`size-6 ${s.color}`} />
                  </span>
                  <p className="mt-3 text-xs font-semibold text-title leading-tight">{s.title}</p>
                  <p className="mt-1 hidden text-[11px] text-muted leading-tight md:block">{s.sub}</p>
                  {!isActive && (
                    <span className="mt-1.5 text-[10px] text-muted/60">Coming soon</span>
                  )}
                </div>
              );
              return isActive ? (
                <Link key={s.title} href={s.href} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={s.title}>{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BOOKING SECTION ───────────────────────────────────────────────── */}
      <section id="book" className="bg-canvas">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
            {/* Left: intro */}
            <div className="flex flex-col justify-center">
              <Badge tone="success" className="mb-4 self-start">Live availability</Badge>
              <h2 className="text-3xl font-extrabold text-title sm:text-4xl">
                Search flights &amp; buses
              </h2>
              <p className="mt-3 text-subtitle leading-relaxed">
                Real-time schedules across {ROUTES.length} routes — Tanzania domestic, East Africa regional, and long-haul.
                Compare fares, pick your seat and pay in one flow.
              </p>
              <div className="mt-6 space-y-2">
                {[
                  "Deterministic seat maps — same search, same results",
                  "Economy, Business and First / VIP fares",
                  "Mock card, mobile money and wallet checkout",
                  "PNR ticket on confirmation — printable and shareable",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2 text-sm text-subtitle">
                    <span className="mt-0.5 size-4 shrink-0 rounded-full bg-success/20 text-center text-[10px] font-bold text-success">✓</span>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: search widget */}
            <div className="flex flex-col justify-center">
              <Suspense fallback={<div className="h-56 rounded-[24px] bg-card/60 animate-pulse" />}>
                <SearchForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ────────────────────────────────────────────────── */}
      <section className="bg-canvas-deep">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-title">Popular routes</h2>
              <p className="mt-1 text-sm text-subtitle">Fares from — prices include all taxes</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/search?mode=flights">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularRoutes.map((r, i) => {
              const date = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
              const Icon = r.mode === "flights" ? Plane : Bus;
              return (
                <Link
                  key={i}
                  href={`/search?mode=${r.mode}&from=${r.from.code}&to=${r.to.code}&date=${date}&passengers=1`}
                >
                  <Card className="group flex items-center justify-between p-4 transition-all hover:border-primary/50 hover:bg-card-elevated">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-10 shrink-0 place-items-center rounded-[12px] ${r.mode === "flights" ? "bg-primary/12 text-primary" : "bg-gold/12 text-gold"}`}>
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-title group-hover:text-primary transition-colors">
                          {r.from.city} → {r.to.city}
                        </p>
                        <p className="text-xs capitalize text-subtitle">
                          {r.from.countryCode} · {r.to.countryCode} · {r.mode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-title">{formatMoney(r.price)}</p>
                      <p className="text-[11px] text-muted">from</p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── APP FEATURES ──────────────────────────────────────────────────── */}
      <section id="features" className="bg-canvas">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="mb-10 text-center">
            <Badge tone="neutral" className="mb-3">Why SokaSafari</Badge>
            <h2 className="text-3xl font-extrabold text-title sm:text-4xl">
              Built for the matchgoing fan
            </h2>
            <p className="mx-auto mt-3 max-w-md text-subtitle">
              Every feature is designed around getting you to the stadium safely,
              on time, and without the stress.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="p-6 transition-all hover:border-white/18">
                  <div className="mb-4 grid size-12 place-items-center rounded-[14px] bg-primary/12">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-title">{f.title}</h3>
                  <p className="mt-2 text-sm text-subtitle leading-relaxed">{f.body}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PHOTO GALLERY strip ───────────────────────────────────────────── */}
      <section className="overflow-hidden bg-canvas-deep py-14">
        <div className="mx-auto mb-8 max-w-7xl px-5 text-center">
          <h2 className="text-2xl font-extrabold text-title">
            The SokaSafari Experience
          </h2>
          <p className="mt-2 text-subtitle">Stadiums, safaris and everything in between</p>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 sm:gap-4 [&::-webkit-scrollbar]:hidden">
          {[
            { src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=75", alt: "Football stadium" },
            { src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=75", alt: "Safari wildlife" },
            { src: "https://images.unsplash.com/photo-1522778119026-d79f4067fd8e?w=600&q=75", alt: "Match fans" },
            { src: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=75", alt: "Coach travel" },
            { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=75", alt: "Fan community" },
            { src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=75", alt: "Accommodation" },
          ].map((img) => (
            <div
              key={img.src}
              className="relative h-52 w-80 shrink-0 overflow-hidden rounded-[18px] sm:h-60 sm:w-96"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover object-center transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 640px) 320px, 384px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-canvas py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_50%,rgba(59,158,255,0.12),transparent_70%)]" />
        <div className="relative mx-auto max-w-2xl px-5 text-center">
          <Image
            src="/appicon.png"
            alt="SokaSafari"
            width={64}
            height={64}
            className="mx-auto mb-5 rounded-[16px] shadow-[0_8px_32px_rgba(245,197,66,0.4)]"
          />
          <h2 className="text-3xl font-extrabold text-title sm:text-4xl">
            Ready for your next match?
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-subtitle">
            Search flights and buses now — or download the full SokaSafari app for
            Fan ID, eVisa, AI assistant and much more.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="shadow-[0_8px_32px_rgba(59,158,255,0.45)]">
              <Link href="/search?mode=flights">
                <Plane className="size-5" /> Search Flights
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/search?mode=buses">
                <Bus className="size-5" /> Search Buses
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
