import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, CreditCard, Loader2, Sparkles, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiFetch";
import { getUserToken } from "@/lib/userAuth";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Interval = "monthly" | "yearly";
type PaidPlan = "studio" | "premium";
type CreditPack = "pack_100" | "pack_300" | "pack_1000";

const PLANS = [
  {
    key: "free",
    label: "Free",
    monthly: 0,
    yearly: 0,
    credits: 50,
    description: "Pour tester Matrice avec une vraie premiere oeuvre.",
    features: ["50 credits offerts", "1 projet actif", "Generation IA de base", "Onboarding beta", "Support communaute"],
    featured: false,
  },
  {
    key: "studio",
    label: "Studio",
    monthly: 4.99,
    yearly: 47.9,
    credits: 300,
    description: "Pour ecrire regulierement sans friction.",
    features: ["300 credits / mois", "Projets illimites", "Exports EPUB, DOCX, PDF", "Mandat editorial", "Support prioritaire"],
    featured: false,
  },
  {
    key: "premium",
    label: "Premium",
    monthly: 9.99,
    yearly: 95.9,
    credits: 800,
    description: "Pour porter une oeuvre jusqu'a la vente.",
    features: ["800 credits / mois", "Lentille Marche 2026", "Protection blockchain", "Mandat Essuf-Sign", "Acces beta avance"],
    featured: true,
  },
] as const;

const PACKS: Array<{ key: CreditPack; credits: number; price: string; label: string }> = [
  { key: "pack_100", credits: 100, price: "3,99 EUR", label: "Recharge courte" },
  { key: "pack_300", credits: 300, price: "9,99 EUR", label: "Recharge atelier" },
  { key: "pack_1000", credits: 1000, price: "24,99 EUR", label: "Recharge production" },
];

function formatPrice(plan: typeof PLANS[number], interval: Interval): string {
  if (plan.monthly === 0) return "0 EUR";
  return `${(interval === "monthly" ? plan.monthly : plan.yearly).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EUR`;
}

export default function PricingPage() {
  const [interval, setInterval] = useState<Interval>("yearly");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const token = getUserToken();

  async function startCheckout(plan: PaidPlan) {
    if (!token) {
      window.location.href = `${BASE}/signup?plan=${plan}&interval=${interval}`;
      return;
    }

    setLoading(`${plan}:${interval}`);
    try {
      const response = await apiFetch(`${BASE}/api/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Checkout indisponible");
      }
      window.location.href = payload.url;
    } catch (err) {
      toast({
        title: "Paiement indisponible",
        description: err instanceof Error ? err.message : "Impossible d'ouvrir Stripe pour le moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  async function startRecharge(pack: CreditPack) {
    if (!token) {
      window.location.href = `${BASE}/signup?pack=${pack}`;
      return;
    }

    setLoading(pack);
    try {
      const response = await apiFetch(`${BASE}/api/payments/recharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Recharge indisponible");
      }
      window.location.href = payload.url;
    } catch (err) {
      toast({
        title: "Recharge indisponible",
        description: err instanceof Error ? err.message : "Impossible d'ouvrir Stripe pour le moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-matrice-ivoire text-matrice-encre">
      <header className="border-b border-matrice-sable bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href={`${BASE}/`} className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-matrice-or-fonce">
            Matrice
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-matrice-encre/70 md:flex">
            <Link href={`${BASE}/#credits`} className="hover:text-matrice-encre">Credits</Link>
            <Link href={`${BASE}/billing`} className="hover:text-matrice-encre">Facturation</Link>
            <Link href={`${BASE}/dashboard`} className="hover:text-matrice-encre">Dashboard</Link>
          </nav>
          <Button asChild>
            <Link href={`${BASE}/signup`}>Commencer</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matrice-or-fonce">Tarifs beta</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">
              Des credits clairs pour payer uniquement l'usage reel.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-matrice-encre/70">
              Generation IA, export, Lentille Marche : chaque action consomme un cout visible. Les abonnements
              rechargent tes credits chaque mois, les packs restent disponibles en plus.
            </p>
            <p className="mt-4 max-w-2xl rounded-xl border border-matrice-or-fonce/25 bg-white px-4 py-3 text-sm font-semibold leading-6 text-matrice-encre">
              Tu publies sous ton nom, tu gardes 90% et ta paternite (preuve d'anteriorite incluse).
            </p>
          </div>

          <div className="rounded-lg border border-matrice-sable bg-white p-4 shadow-sm">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="text-2xl font-semibold">1</p>
                <p className="text-matrice-encre/60">generation</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">5</p>
                <p className="text-matrice-encre/60">export</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">10</p>
                <p className="text-matrice-encre/60">lentille</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-matrice-sable bg-white/65">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-semibold">Abonnements</h2>
                <p className="mt-1 text-sm text-matrice-encre/65">Annuel = 20% d'economie. Sans engagement cache.</p>
              </div>
              <div className="inline-flex rounded-lg border border-matrice-sable bg-matrice-ivoire p-1">
                {(["monthly", "yearly"] as Interval[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setInterval(value)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      interval === value ? "bg-matrice-encre text-matrice-ivoire" : "text-matrice-encre/70 hover:text-matrice-encre"
                    }`}
                  >
                    {value === "monthly" ? "Mensuel" : "Annuel -20%"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <article
                  key={plan.key}
                  className={`flex min-h-[460px] flex-col rounded-lg border bg-matrice-ivoire p-6 shadow-sm ${
                    plan.featured ? "border-matrice-or-fonce ring-2 ring-matrice-or-fonce/20" : "border-matrice-sable"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-matrice-sable text-matrice-encre">
                      {plan.key === "premium" ? <Sparkles className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                    </div>
                    {plan.featured ? (
                      <span className="rounded-full bg-matrice-or-fonce px-3 py-1 text-xs font-semibold text-matrice-ivoire">
                        Premium
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold">{plan.label}</h3>
                  <p className="mt-3 min-h-[56px] text-sm leading-6 text-matrice-encre/65">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-3xl font-semibold">{formatPrice(plan, interval)}</span>
                    <span className="ml-2 text-sm text-matrice-encre/55">
                      {plan.key === "free" ? "" : interval === "monthly" ? "/ mois" : "/ an"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-matrice-or-fonce">{plan.credits} credits inclus</p>
                  {plan.key === "free" ? (
                    <Button asChild className="mt-6 w-full">
                      <Link href={`${BASE}/signup`}>Creer un compte</Link>
                    </Button>
                  ) : (
                    <Button className="mt-6 w-full" onClick={() => startCheckout(plan.key)} disabled={!!loading}>
                      {loading === `${plan.key}:${interval}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Choisir {plan.label}
                    </Button>
                  )}
                  <ul className="mt-6 space-y-3 text-sm text-matrice-encre/72">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-matrice-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="credits" className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="mb-6 flex items-center gap-3">
            <WalletCards className="h-6 w-6 text-matrice-or-fonce" />
            <div>
              <h2 className="text-2xl font-semibold">Recharges credits</h2>
              <p className="text-sm text-matrice-encre/65">Les credits achetes ne disparaissent pas au renouvellement mensuel.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PACKS.map((pack) => (
              <article key={pack.key} className="rounded-lg border border-matrice-sable bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-matrice-encre/60">{pack.label}</p>
                <p className="mt-2 text-3xl font-semibold">{pack.credits} credits</p>
                <p className="mt-1 text-matrice-or-fonce">{pack.price}</p>
                <Button variant="outline" className="mt-5 w-full" onClick={() => startRecharge(pack.key)} disabled={!!loading}>
                  {loading === pack.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Recharger
                </Button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
