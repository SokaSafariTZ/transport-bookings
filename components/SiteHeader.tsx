import Link from "next/link";
import Image from "next/image";
import { Ticket, Menu, Plane, Bus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/?mode=flights", label: "Flights" },
  { href: "/?mode=buses", label: "Buses" },
  { href: "/manage", label: "My trips" },
];

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        transparent
          ? "border-transparent bg-transparent"
          : "border-b border-line bg-canvas/85 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
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
            <span className="text-primary">Safari</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-subtitle transition hover:bg-white/6 hover:text-title"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-canvas-deep">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image src="/appicon.png" alt="SokaSafari" width={36} height={36} className="rounded-[9px]" />
              <span className="text-base font-extrabold">
                <span className="text-gold">Soka</span>
                <span className="text-primary">Safari</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-subtitle leading-relaxed">
              Your ultimate football &amp; safari experience.<br />
              Africa's fan travel super-app.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Travel</p>
            <ul className="space-y-2 text-sm text-subtitle">
              <li><Link href="/search?mode=flights" className="flex items-center gap-1.5 hover:text-title"><Plane className="size-3.5" />Flights</Link></li>
              <li><Link href="/search?mode=buses" className="flex items-center gap-1.5 hover:text-title"><Bus className="size-3.5" />Buses</Link></li>
              <li><Link href="/manage" className="hover:text-title">My trips</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Company</p>
            <ul className="space-y-2 text-sm text-subtitle">
              <li><span className="text-muted">About SokaSafari</span></li>
              <li><span className="text-muted">Careers</span></li>
              <li><span className="text-muted">Press</span></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Legal</p>
            <ul className="space-y-2 text-sm text-subtitle">
              <li><span className="text-muted">Terms of Service</span></li>
              <li><span className="text-muted">Privacy Policy</span></li>
              <li>
                <Link href="/admin" className="text-muted hover:text-subtitle">Admin Portal</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-muted">© {new Date().getFullYear()} SokaSafari. All rights reserved.</p>
          <p className="text-xs text-muted">Match-day travel across Africa.</p>
        </div>
      </div>
    </footer>
  );
}
