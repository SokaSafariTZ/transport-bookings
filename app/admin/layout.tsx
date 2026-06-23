import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Building2,
  MapPin,
  Route as RouteIcon,
  LogOut,
} from "lucide-react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/Button";
import { isAdminAuthed, destroyAdminSession } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/operators", label: "Operators", icon: Building2 },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/routes", label: "Routes", icon: RouteIcon },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page renders its own tree; it isn't wrapped here because it lives at
  // /admin/login and this layout's children include it — so guard non-login only.
  const authed = await isAdminAuthed();

  async function logout() {
    "use server";
    await destroyAdminSession();
    redirect("/admin/login");
  }

  // When unauthenticated, middleware already redirects /admin/* (except login)
  // to /admin/login. The login page short-circuits its own auth, so if we reach
  // here unauthenticated we must be ON the login page — render bare.
  if (!authed) return <>{children}</>;

  return (
    <div className="grid min-h-dvh grid-cols-[230px_1fr]">
      <aside className="sticky top-0 flex h-dvh flex-col border-r border-line bg-nav/70 p-4 backdrop-blur">
        <div className="px-2 py-3">
          <Brand subtitle="Admin" />
        </div>
        <nav className="mt-4 flex-1 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm text-subtitle transition hover:bg-white/5 hover:text-title"
            >
              <n.icon className="size-4.5" />
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <Button variant="ghost" size="sm" className="w-full justify-start text-subtitle">
            <LogOut className="size-4" /> Sign out
          </Button>
        </form>
        <Link
          href="/"
          className="mt-2 px-3 text-[11px] text-muted hover:text-subtitle"
        >
          ← Back to site
        </Link>
      </aside>
      <main className="min-w-0 bg-canvas">{children}</main>
    </div>
  );
}
