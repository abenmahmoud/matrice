import { useState, type ComponentType } from "react";
import { Link } from "wouter";
import { CheckCircle2, Circle, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileNavLink = {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  done?: boolean;
};

export type MobileNavSection = {
  label: string;
  links: MobileNavLink[];
};

type MobileNavUser = {
  displayName: string;
  email: string;
};

type MobileNavProps = {
  sections: MobileNavSection[];
  user?: MobileNavUser | null;
  onLogout: () => void;
};

export function MobileNav({ sections, user, onLogout }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative z-[120] flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-matrice-sable bg-white text-matrice-encre shadow-sm lg:hidden"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[130] lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/40"
            onClick={close}
          />
          <nav className="absolute inset-y-0 left-0 flex w-[86vw] max-w-sm flex-col overflow-hidden border-r border-matrice-sable bg-matrice-ivoire shadow-2xl">
            <div className="flex min-h-[64px] items-center justify-between border-b border-matrice-sable px-5">
              <span className="font-serif text-lg font-bold uppercase tracking-[0.18em] text-matrice-or-fonce">
                Matrice
              </span>
              <button
                type="button"
                onClick={close}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-matrice-encre hover:bg-matrice-sable/45"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {user && (
              <div className="border-b border-matrice-sable px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-matrice-terracotta text-sm font-semibold text-white">
                    {(user.displayName || user.email).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-matrice-encre">{user.displayName || "Compte Matrice"}</p>
                    <p className="truncate text-sm text-matrice-encre/55">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-3 py-4">
              {sections.map((section) => (
                <div key={section.label} className="mb-5 last:mb-0">
                  <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-matrice-encre/42">
                    {section.label}
                  </p>
                  <ul className="space-y-1">
                    {section.links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <li key={`${section.label}-${link.href}-${link.name}`}>
                          <Link href={link.href}>
                            <div
                              onClick={close}
                              className={cn(
                                "flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                                link.active
                                  ? "bg-matrice-terracotta/12 text-matrice-terracotta"
                                  : "text-matrice-encre/70 hover:bg-matrice-sable/45 hover:text-matrice-encre"
                              )}
                            >
                              <Icon className="h-5 w-5 shrink-0" />
                              <span className="min-w-0 flex-1 truncate">{link.name}</span>
                              {typeof link.done === "boolean" && (
                                link.done
                                  ? <CheckCircle2 className="h-4 w-4 shrink-0 text-matrice-success" />
                                  : <Circle className="h-4 w-4 shrink-0 text-matrice-encre/25" />
                              )}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {user && (
              <div className="border-t border-matrice-sable p-3">
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onLogout();
                  }}
                  className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-sm text-matrice-encre/70 transition hover:bg-matrice-sable/45 hover:text-matrice-encre"
                >
                  <LogOut className="h-5 w-5" />
                  Deconnexion
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
