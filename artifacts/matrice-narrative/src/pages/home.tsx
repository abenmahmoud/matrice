import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clapperboard,
  CreditCard,
  FileSignature,
  LockKeyhole,
  PenLine,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const DIMENSIONS = [
  {
    kicker: "Creation",
    title: "Ecrire avec une architecture narrative vivante",
    text: "Matrice transforme une idee brute en dossier de travail : matrice narrative, noyau emotionnel, personnages, scenes, pitch, exports.",
    points: ["Un chemin guide du brouillon au dossier", "Des modules specialises par etape", "Une memoire creative qui conserve les choix forts"],
  },
  {
    kicker: "Production",
    title: "Preparer l'oeuvre pour le marche reel",
    text: "La plateforme ne s'arrete pas au texte : Lentille Marche, protection blockchain, exports, mandat editorial et paiements arrivent dans le meme cockpit.",
    points: ["Lentille Marche 2026", "Passeport d'oeuvre et horodatage", "Mandat via Essuf-Sign"],
  },
];

const FEATURES = [
  { icon: BookOpen, title: "Matrice narrative", text: "Clarifie theme, conflit, promesse de genre et trajectoire emotionnelle." },
  { icon: PenLine, title: "Ateliers d'ecriture", text: "Roman, scenario, serie, scenes jouables et notes d'intention." },
  { icon: Clapperboard, title: "Lentille Production", text: "Audit microdrama, IA-prod, huis clos, personnage deplace et hybridation." },
  { icon: ShieldCheck, title: "Protection blockchain", text: "Hash, preuve publique et passeport d'oeuvre pour tracer l'anteriorite." },
  { icon: FileSignature, title: "Mandat editorial", text: "Signature eIDAS SES via Essuf-Sign, OTP, audit log et verification publique." },
  { icon: WalletCards, title: "Credits transparents", text: "1 generation, 5 credits export, 10 credits Lentille. Pas de zone floue." },
];

const PLANS = [
  { name: "Free", price: "0 EUR", credits: "50 credits", detail: "Tester avec une premiere oeuvre", featured: false },
  { name: "Studio", price: "4,99 EUR/mois", credits: "300 credits/mois", detail: "Construire serieusement", featured: false },
  { name: "Premium", price: "9,99 EUR/mois", credits: "800 credits/mois", detail: "Porter l'oeuvre jusqu'a la vente", featured: true },
];

const COSTS = [
  ["Generation IA", "1 credit"],
  ["Export EPUB/DOCX/PDF", "5 credits"],
  ["Lentille Marche", "10 credits"],
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-[#f4ece0] text-[#2a2119]">
      <header className="sticky top-0 z-40 border-b border-[#15110d]/10 bg-[#f4ece0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="font-serif text-xl font-semibold text-[#15110d]">
            Matrice<span className="text-[#8B6F2E]">.</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#6b5d4a] md:flex">
            <a href="#dimensions" className="hover:text-[#15110d]">Vision</a>
            <a href="#features" className="hover:text-[#15110d]">Modules</a>
            <a href="#pricing" className="hover:text-[#15110d]">Tarifs</a>
            <Link href="/support" className="hover:text-[#15110d]">Support</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-[#2a2119]/70 hover:text-[#15110d]">
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-[#15110d] px-3 text-[#f4ece0] hover:bg-[#241c14] sm:px-5">
              <Link href="/signup">
                Commencer <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#1a140e] text-[#f4ece0]">
          <div className="absolute inset-0 opacity-70">
            <div className="absolute right-[-120px] top-[-160px] h-[420px] w-[520px] rounded-full bg-[#d6a85c]/20 blur-[120px]" />
            <div className="absolute bottom-[-220px] left-[-120px] h-[420px] w-[520px] rounded-full bg-[#8B6F2E]/20 blur-[120px]" />
          </div>

          <div className="relative mx-auto grid min-h-[calc(100dvh-72px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <span className="inline-flex rounded-full border border-[#d6a85c]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#e8c98a]">
                L'OS creatif du recit
              </span>
              <h1 className="mt-7 max-w-[12ch] font-serif text-5xl font-semibold leading-[1.02] text-[#f6efe2] sm:text-6xl lg:text-7xl">
                Ecrire, proteger, vendre ton oeuvre.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#cbbea3]">
                Matrice accompagne un projet narratif de l'idee brute jusqu'a la production : structure, IA,
                Lentille Marche, exports, signature du mandat et bientot paiements auteurs.
              </p>
              <p className="mt-4 max-w-2xl rounded-2xl border border-[#d6a85c]/25 bg-[#d6a85c]/10 px-4 py-3 text-sm font-semibold leading-6 text-[#f6efe2]">
                Tu publies sous ton nom, tu gardes 90% et ta paternite (preuve d'anteriorite incluse).
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full bg-[#d6a85c] px-7 text-[#15110d] hover:bg-[#e8c98a]">
                  <Link href="/signup">
                    Creer mon compte <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-[#f4ece0]/35 bg-transparent px-7 text-[#f4ece0] hover:border-[#e8c98a] hover:bg-transparent hover:text-[#e8c98a]">
                  <Link href="/pricing">Voir les tarifs</Link>
                </Button>
              </div>
              <div className="mt-11 grid max-w-xl grid-cols-3 gap-5 border-t border-[#f4ece0]/10 pt-6">
                <Metric value="11" label="sprints live" />
                <Metric value="3" label="plans beta" />
                <Metric value="1" label="cockpit auteur" />
              </div>
            </div>

            <div className="rounded-[18px] border border-[#f4ece0]/10 bg-[#f6efe2]/[0.04] p-3 shadow-2xl shadow-black/30">
              <div className="rounded-[14px] border border-[#f4ece0]/10 bg-[#100c08] p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#d6a85c]">Cockpit Matrice</p>
                    <p className="mt-1 text-sm text-[#cbbea3]">Projet : Les Cendres du Mirage</p>
                  </div>
                  <span className="rounded-full bg-[#d6a85c]/15 px-3 py-1 text-xs text-[#e8c98a]">Premium</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Credits disponibles", "800"],
                    ["Score Lentille", "87/100"],
                    ["Exports prets", "EPUB + PDF"],
                    ["Mandat", "Signature OTP"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-[#f4ece0]/10 bg-[#f4ece0]/[0.035] p-4">
                      <p className="text-xs text-[#a89878]">{label}</p>
                      <p className="mt-2 font-serif text-2xl font-semibold text-[#f6efe2]">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-[#d6a85c]/20 bg-[#d6a85c]/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#e8c98a]">
                    <Sparkles className="h-4 w-4" />
                    Lentille Production active
                  </div>
                  <p className="text-sm leading-6 text-[#cbbea3]">
                    Le projet est analyse sous l'angle production 2026 : format court, IA-prod, pression spatiale,
                    personnage deplace et hybridation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="dimensions" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <SectionHead kicker="Double dimension" title="Un outil pour creer, mais aussi pour preparer la commercialisation." />
          <div className="grid gap-6 lg:grid-cols-2">
            {DIMENSIONS.map((dimension) => (
              <article key={dimension.title} className="overflow-hidden rounded-[18px] border border-[#15110d]/10 bg-[#fffaf2]">
                <div className="h-1 bg-[#d6a85c]" />
                <div className="p-7 sm:p-9">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B6F2E]">{dimension.kicker}</p>
                  <h2 className="mt-4 font-serif text-2xl font-semibold leading-tight text-[#15110d] sm:text-3xl">{dimension.title}</h2>
                  <p className="mt-4 leading-7 text-[#6b5d4a]">{dimension.text}</p>
                  <ul className="mt-6 space-y-3">
                    {dimension.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm text-[#2a2119]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8B6F2E]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="border-y border-[#15110d]/10 bg-[#ece1cf]/55 px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHead kicker="Modules" title="Tout ce qui transforme une idee en actif exploitable." />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="rounded-[18px] border border-[#15110d]/10 bg-[#fffaf2] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#15110d] text-[#e8c98a]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#15110d]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#6b5d4a]">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <SectionHead kicker="Tarifs credits" title="Des paliers simples, lisibles, prets pour les beta testeurs." />
          <div className="grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[18px] border bg-[#fffaf2] p-7 shadow-sm ${
                  plan.featured ? "border-[#8B6F2E] ring-2 ring-[#d6a85c]/25" : "border-[#15110d]/10"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-serif text-2xl font-semibold text-[#15110d]">{plan.name}</h3>
                  {plan.featured ? <span className="rounded-full bg-[#8B6F2E] px-3 py-1 text-xs font-semibold text-[#f4ece0]">Premium</span> : null}
                </div>
                <p className="mt-4 text-3xl font-semibold text-[#15110d]">{plan.price}</p>
                <p className="mt-2 font-medium text-[#8B6F2E]">{plan.credits}</p>
                <p className="mt-3 min-h-[48px] text-sm leading-6 text-[#6b5d4a]">{plan.detail}</p>
                <Button asChild className="mt-6 w-full rounded-full bg-[#15110d] text-[#f4ece0] hover:bg-[#241c14]">
                  <Link href={plan.name === "Free" ? "/signup" : "/pricing"}>
                    {plan.name === "Free" ? "Commencer" : "Choisir ce plan"} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-[18px] border border-[#15110d]/10 bg-[#fffaf2] p-6">
            <div className="mb-5 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[#8B6F2E]" />
              <h3 className="font-serif text-xl font-semibold text-[#15110d]">Cout des actions</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {COSTS.map(([label, cost]) => (
                <div key={label} className="rounded-xl border border-[#15110d]/10 bg-[#f4ece0] p-4">
                  <p className="text-sm text-[#6b5d4a]">{label}</p>
                  <p className="mt-1 text-2xl font-semibold text-[#15110d]">{cost}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#15110d] px-5 py-20 text-center text-[#f4ece0] sm:px-8">
          <div className="mx-auto max-w-2xl">
            <LockKeyhole className="mx-auto mb-6 h-10 w-10 text-[#e8c98a]" />
            <h2 className="font-serif text-4xl font-semibold leading-tight">La beta peut accueillir les premiers auteurs.</h2>
            <p className="mt-5 leading-7 text-[#cbbea3]">
              Onboarding, notifications, support, credits et facturation sont maintenant alignes pour guider chaque testeur sans perdre le fil.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-[#d6a85c] px-7 text-[#15110d] hover:bg-[#e8c98a]">
                <Link href="/signup">Entrer dans Matrice</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-[#f4ece0]/30 bg-transparent px-7 text-[#f4ece0] hover:bg-transparent hover:text-[#e8c98a]">
                <Link href="/dashboard">Ouvrir le cockpit</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#15110d]/10 px-5 py-8 text-sm text-[#6b5d4a] sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-center">
          <span className="font-serif font-semibold text-[#15110d]">Matrice par Essuf-Group</span>
          <div className="flex flex-wrap gap-5">
            <Link href="/pricing" className="hover:text-[#15110d]">Tarifs</Link>
            <Link href="/billing" className="hover:text-[#15110d]">Credits</Link>
            <Link href="/support" className="hover:text-[#15110d]">Support</Link>
            <a href={`${BASE}/api/healthz`} className="hover:text-[#15110d]">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-2xl font-semibold text-[#e8c98a]">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#a89878]">{label}</p>
    </div>
  );
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <span className="inline-flex rounded-full border border-[#d6a85c]/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6F2E]">
        {kicker}
      </span>
      <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-[#15110d] sm:text-4xl">{title}</h2>
    </div>
  );
}
