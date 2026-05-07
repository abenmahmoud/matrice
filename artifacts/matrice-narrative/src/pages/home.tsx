import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  FileText,
  Layers3,
  LockKeyhole,
  PenLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CREATIVE_FLOW = [
  {
    title: "Clarifier",
    text: "Transformez une intuition, une scene ou une note brute en matrice narrative lisible.",
    icon: BrainCircuit,
  },
  {
    title: "Structurer",
    text: "Personnages, conflits, arc emotionnel, monde, temporalite et promesse de genre.",
    icon: Layers3,
  },
  {
    title: "Ecrire",
    text: "Passez du plan au texte avec des ateliers dedies au roman, au scenario et a la serie.",
    icon: PenLine,
  },
  {
    title: "Presenter",
    text: "Pitch, note d'intention, scenes jouables et exports pour producteurs, editeurs ou labs.",
    icon: FileText,
  },
];

const PLAN_PREVIEW = [
  { name: "Free", detail: "Decouverte limitee", price: "0 EUR" },
  { name: "Pro", detail: "Createur individuel", price: "19 EUR" },
  { name: "Studio", detail: "Usage intensif", price: "49 EUR" },
  { name: "Enterprise", detail: "Equipes & sur-mesure", price: "Devis" },
];

const PROOF_POINTS = [
  "Memoire creative privee",
  "Paywall serveur et quotas",
  "Admin abonnements",
  "Mode proprietaire isole",
  "Pipeline narratif complet",
  "Pret pour Stripe en Phase 2C",
];

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute -inset-8 bg-violet-600/15 blur-[90px]" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#10101a] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/70">Cockpit createur</p>
            <p className="mt-1 text-sm text-white/45">Projet actif : Les Cendres du Mirage</p>
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/50" />
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[180px_1fr]">
          <div className="border-b border-white/[0.08] bg-black/20 p-4 md:border-b-0 md:border-r">
            {["Matrice", "Noyau", "Personnages", "Scenes", "Pitch"].map((item, index) => (
              <div
                key={item}
                className={`mb-2 flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                  index === 0 ? "bg-violet-500/18 text-violet-100" : "text-white/40"
                }`}
              >
                <span>{item}</span>
                {index < 2 && <CheckCircle2 className="h-3.5 w-3.5" />}
              </div>
            ))}
          </div>

          <div className="p-5">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.16em] text-white/28">Logline generee</p>
              <p className="mt-2 font-serif text-xl leading-snug text-white/[0.88]">
                Une realisatrice exilee reconstruit le film que son pere a brule, scene apres scene, jusqu'a decouvrir
                que la derniere bobine accuse sa propre famille.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Arc emotionnel", "74%"],
                ["Originalite", "81%"],
                ["Suspense", "68%"],
                ["Pitch readiness", "Pro"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-3">
                  <p className="text-[11px] text-white/32">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-white/[0.82]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-violet-400/18 bg-violet-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-violet-200">
                <Sparkles className="h-3.5 w-3.5" />
                Memoire creative active
              </div>
              <p className="text-xs leading-relaxed text-white/46">
                Interdits, references, criteres qualite et direction artistique sont injectes dans les generations
                seulement pour le proprietaire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-[#08080d] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#08080d]/[0.86] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/">
            <span className="font-serif text-lg font-bold uppercase tracking-[0.22em] text-violet-200">Matrice</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-white/48 md:flex">
            <a href="#workflow" className="hover:text-white">Workflow</a>
            <Link href="/pricing"><span className="cursor-pointer hover:text-white">Tarifs</span></Link>
            <Link href="/admin"><span className="cursor-pointer hover:text-white">Admin</span></Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hidden text-white/52 hover:text-white sm:inline-flex">
                Connexion
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full bg-violet-500 px-5 text-white hover:bg-violet-400">
                Commencer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-[-180px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-violet-700/18 blur-[120px]" />
            <div className="absolute bottom-0 right-[-10%] h-[360px] w-[420px] rounded-full bg-blue-600/10 blur-[120px]" />
          </div>

          <div className="relative mx-auto grid min-h-[calc(100dvh-64px)] max-w-7xl items-center gap-14 px-5 py-16 md:grid-cols-[0.92fr_1.08fr] md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h1 className="font-serif text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                Matrice Narrative
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-white/54 md:text-xl">
                L'atelier IA pour transformer une idee brute en univers fictionnel solide : matrice, personnages,
                scenes, pitch et memoire creative, dans un workflow pense pour auteurs, scenaristes et producteurs.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="h-12 rounded-full bg-violet-500 px-7 text-base text-white hover:bg-violet-400">
                    Creer mon compte <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="h-12 rounded-full border-white/[0.12] bg-white/[0.03] px-7 text-base text-white/70 hover:bg-white/[0.06] hover:text-white">
                    Voir les paliers
                  </Button>
                </Link>
              </div>
              <div className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-white/[0.08] pt-6">
                {[
                  ["31", "modules IA"],
                  ["4", "paliers"],
                  ["Owner", "lab prive"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="font-serif text-2xl font-bold text-white/[0.88]">{value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/30">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.1, ease: "easeOut" }}
            >
              <ProductPreview />
            </motion.div>
          </div>
        </section>

        <section id="workflow" className="border-y border-white/[0.06] bg-white/[0.018] px-5 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-2xl">
              <h2 className="font-serif text-3xl font-bold text-white md:text-5xl">Un workflow narratif, pas une boite a prompts.</h2>
              <p className="mt-4 text-base leading-7 text-white/44">
                Chaque module produit une piece utile du dossier creatif. Les decisions importantes restent visibles,
                modifiables et reutilisables dans les etapes suivantes.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {CREATIVE_FLOW.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-white/[0.07] bg-[#101018] p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <step.icon className="h-6 w-6 text-violet-300" />
                    <span className="font-mono text-xs text-white/26">0{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white/90">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/42">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="font-serif text-3xl font-bold text-white md:text-5xl">Commercialisable sans sacrifier le lab prive.</h2>
              <p className="mt-4 text-base leading-7 text-white/44">
                La Phase 2A prepare l'onboarding public, tout en gardant le Lab BraveHeart separe : memoire creative,
                modules experimentaux et modeles premium restent verrouilles par le role proprietaire.
              </p>
              <Link href="/pricing">
                <Button className="mt-7 rounded-full bg-white text-black hover:bg-white/90">
                  Explorer les offres <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {PROOF_POINTS.map((point) => (
                <div key={point} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm text-white/64">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.06] bg-[#0d0d15] px-5 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="font-serif text-3xl font-bold text-white md:text-5xl">Quatre paliers clairs.</h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-white/44">
                  Free pour decouvrir, Pro pour creer, Studio pour produire, Enterprise pour accompagner une equipe.
                </p>
              </div>
              <Link href="/pricing">
                <Button variant="ghost" className="w-fit text-violet-200 hover:text-white">
                  Detail des tarifs <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {PLAN_PREVIEW.map((plan, index) => (
                <div key={plan.name} className={`rounded-2xl border p-5 ${index === 1 ? "border-violet-400/35 bg-violet-500/10" : "border-white/[0.07] bg-white/[0.025]"}`}>
                  <p className="text-lg font-semibold text-white">{plan.name}</p>
                  <p className="mt-2 text-sm text-white/40">{plan.detail}</p>
                  <p className="mt-6 font-serif text-2xl font-bold text-white/90">{plan.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 text-center md:px-8">
          <div className="mx-auto max-w-2xl">
            <LockKeyhole className="mx-auto mb-6 h-10 w-10 text-violet-300" />
            <h2 className="font-serif text-3xl font-bold text-white md:text-5xl">Commencez avec une idee. Gardez le controle.</h2>
            <p className="mt-5 text-base leading-7 text-white/44">
              Matrice vous aide a avancer vite, mais les choix creatifs, les limites d'acces et le lab prive restent
              sous votre controle.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="h-12 rounded-full bg-violet-500 px-7 text-white hover:bg-violet-400">
                  Creer mon compte <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="ghost" className="h-12 rounded-full px-7 text-white/56 hover:text-white">
                  Aller au cockpit
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-white/28 md:flex-row md:items-center">
          <span className="font-serif uppercase tracking-[0.2em]">Matrice Narrative</span>
          <div className="flex gap-5">
            <Link href="/pricing"><span className="cursor-pointer hover:text-white">Tarifs</span></Link>
            <Link href="/admin"><span className="cursor-pointer hover:text-white">Admin</span></Link>
            <a href={`${BASE}/api/healthz`} className="hover:text-white">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
