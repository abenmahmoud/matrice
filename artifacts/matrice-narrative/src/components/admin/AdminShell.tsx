import { Link, useLocation } from "wouter";
import { Activity, Bot, LayoutDashboard, Mic2, ScrollText, ServerCog, Ticket, Users, WalletCards } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/finance", label: "Finance", icon: Activity },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/credits", label: "Credits", icon: WalletCards },
  { href: "/admin/audit", label: "Audit", icon: ScrollText },
  { href: "/admin/support", label: "Support", icon: Ticket },
  { href: "/admin/invites", label: "Invitations", icon: Ticket },
  { href: "/creator-lab", label: "Creator Lab", icon: Bot },
  { href: "/creator-lab/voice", label: "Voice Lab", icon: Mic2 },
  { href: "/admin/system", label: "Systeme", icon: ServerCog },
];

export function AdminShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  const [location] = useLocation();
  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Admin Matrice</p>
          <h1 className="mt-2 font-serif text-3xl text-matrice-encre sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-matrice-encre/70">{subtitle}</p>
        </header>
        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-matrice-sable bg-white p-2">
          {NAV.map((item) => {
            const active = isNavActive(location, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-[44px] flex-shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium transition",
                  active ? "bg-matrice-encre text-matrice-ivoire" : "text-matrice-encre/70 hover:bg-matrice-sable/45 hover:text-matrice-encre",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </AppLayout>
  );
}

function isNavActive(location: string, href: string): boolean {
  if (href === "/admin") return location === "/admin";
  if (href === "/creator-lab") return location === "/creator-lab" || location === "/creator-lab/preview";
  return location === href || location.startsWith(`${href}/`);
}
