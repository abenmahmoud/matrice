import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Crown,
  FlaskConical,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const PLANS = [
  {
    name: "Free",
    price: "0 EUR",
    period: "pour tester",
    description: "Decouvrir Matrice avec un projet et les fondations narratives.",
    cta: "Commencer",
    href: `${BASE}/projects/new`,
    featured: false,
    features: [
      "1 projet actif",
      "2 generations offertes",
      "Matrice narrative",
      "Noyau emotionnel",
      "Progression limitee",
    ],
  },
  {
    name: "Pro",
    price: "19 EUR",
    period: "par mois",
    description: "Pour construire serieusement un roman, un scenario ou une bible de serie.",
    cta: "Choisir Pro",
    href: `${BASE}/projects/new`,
    featured: true,
    features: [
      "Projets personnels illimites",
      "Modules avances",
      "Scenes, pitch et dossiers",
      "Exports narratifs",
      "Priorite modele Pro",
    ],
  },
  {
    name: "Studio",
    price: "49 EUR",
    period: "par mois",
    description: "Pour usage intensif, ateliers, producteurs independants et labs creatifs.",
    cta: "Choisir Studio",
    href: `${BASE}/projects/new`,
    featured: false,
    features: [
      "Usage intensif",
      "Workflow projets multiples",
      "Analyses plus profondes",
      "Modules experimentaux eligibles",
      "Support prioritaire",
    ],
  },
  {
    name: "Enterprise",
    price: "Devis",
    period: "sur mesure",
    description: "Pour equipes, formations, studios et integrations specifiques.",
    cta: "Preparer un acces",
    href: `${BASE}/admin`,
    featured: false,
    features: [
      "Gestion equipe",
      "Acces controle",
      "Parametrage dedie",
      "Accompagnement",
      "Contrat sur mesure",
    ],
  },
];

const COMPARISON = [
  { label: "Matrice + noyau emotionnel", free: true, pro: true, studio: true, enterprise: true },
  { label: "Modules avances", free: false, pro: true, studio: true, enterprise: true },
  { label: "Quotas eleves", free: false, pro: true, studio: true, enterprise: true },
  { label: "Modules experimentaux", free: false, pro: false, studio: true, enterprise: true },
  { label: "Gestion abonnements admin", free: false, pro: true, studio: true, enterprise: true },
  { label: "Lab prive proprietaire", free: false, pro: false, studio: false, enterprise: false },
];

function BoolCell({ value }: { value: boolean }) {
  return (
    <td className="px-4 py-4 text-center">
      {value ? (
        <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-300" />
      ) : (
        <span className="mx-auto block h-px w-5 bg-white/15" />
      )}
    </td>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#09090e] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#09090e]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href={`${BASE}/`} className="flex items-center gap-3 text-sm font-semibold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200">
              <Sparkles className="h-4 w-4" />
            </span>
            Matrice Narrative
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-white/55 md:flex">
            <Link href={`${BASE}/#workflow`} className="transition hover:text-white">Workflow</Link>
            <Link href={`${BASE}/dashboard`} className="transition hover:text-white">Dashboard</Link>
            <Link href={`${BASE}/admin`} className="transition hover:text-white">Admin</Link>
          </nav>
          <Button asChild className="bg-white text-black hover:bg-white/90">
            <Link href={`${BASE}/projects/new`}>
              Commencer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 lg:pb-20 lg:pt-20">
          <Link href={`${BASE}/`} className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Retour landing
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/75">Tarifs</p>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl lg:text-6xl">
                Un acces gratuit pour decouvrir, des paliers payants pour avancer vraiment.
              </h1>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-sm leading-6 text-white/58">
              <div className="mb-4 flex items-center gap-2 text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Paiement prepare, verrouillage deja cote serveur
              </div>
              Les limites ne sont pas seulement visuelles : les routes API distinguent public, utilisateur gratuit, Pro et owner.
              La Phase 2A pose l'onboarding; Stripe arrive ensuite en Phase 2C.
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.08] bg-white/[0.025]">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 py-12 sm:px-8 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`relative flex min-h-[470px] flex-col rounded-2xl border p-5 ${
                  plan.featured
                    ? "border-violet-300/45 bg-violet-500/12 shadow-2xl shadow-violet-950/30"
                    : "border-white/[0.08] bg-[#10101a]"
                }`}
              >
                {plan.featured && (
                  <div className="absolute right-4 top-4 rounded-full bg-violet-300 px-3 py-1 text-xs font-semibold text-black">
                    Recommande
                  </div>
                )}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-violet-200">
                  {plan.name === "Free" && <Sparkles className="h-5 w-5" />}
                  {plan.name === "Pro" && <Crown className="h-5 w-5" />}
                  {plan.name === "Studio" && <FlaskConical className="h-5 w-5" />}
                  {plan.name === "Enterprise" && <ShieldCheck className="h-5 w-5" />}
                </div>
                <h2 className="mt-6 text-2xl font-semibold">{plan.name}</h2>
                <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/55">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  <span className="ml-2 text-sm text-white/45">{plan.period}</span>
                </div>
                <Button asChild className={`mt-6 w-full ${plan.featured ? "bg-white text-black hover:bg-white/90" : ""}`} variant={plan.featured ? "default" : "secondary"}>
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <ul className="mt-6 space-y-3 text-sm text-white/65">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/75">Comparaison</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Ce qui est ouvert, bloque, ou garde prive.</h2>
              <p className="mt-5 text-sm leading-6 text-white/55">
                Le Lab prive proprietaire reste hors offre commerciale. Les utilisateurs publics voient l'experience produit,
                les quotas et les abonnements, pas tes modules confidentiels.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-white/[0.04] text-white/70">
                  <tr>
                    <th className="px-4 py-4 text-left font-medium">Capacite</th>
                    <th className="px-4 py-4 font-medium">Free</th>
                    <th className="px-4 py-4 font-medium">Pro</th>
                    <th className="px-4 py-4 font-medium">Studio</th>
                    <th className="px-4 py-4 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08] bg-[#10101a]">
                  {COMPARISON.map((row) => (
                    <tr key={row.label}>
                      <td className="px-4 py-4 text-white/70">{row.label}</td>
                      <BoolCell value={row.free} />
                      <BoolCell value={row.pro} />
                      <BoolCell value={row.studio} />
                      <BoolCell value={row.enterprise} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.08] bg-[#0d0d15]">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:px-8 lg:grid-cols-3">
            <div className="flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <LockKeyhole className="mt-1 h-5 w-5 text-violet-200" />
              <div>
                <h3 className="font-semibold text-white">Limites serveur</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">Les quotas sont verifies par l'API, pas seulement par l'interface.</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <ShieldCheck className="mt-1 h-5 w-5 text-emerald-300" />
              <div>
                <h3 className="font-semibold text-white">Owner protege</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">Ton mode proprietaire reste debloque et separe du public.</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <FlaskConical className="mt-1 h-5 w-5 text-blue-300" />
              <div>
                <h3 className="font-semibold text-white">Lab evolutif</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">Les modules experimentaux arrivent ensuite, avec activation par plan.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
