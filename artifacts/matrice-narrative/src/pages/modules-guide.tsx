import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, CircleAlert, CircleHelp, Download, ExternalLink, MonitorSmartphone, Smartphone, TabletSmartphone } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { MODULE_GUIDE, MODULE_PHASES, type ModuleGuideItem, type ModuleHealth } from "@/data/moduleGuide";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const healthCopy: Record<ModuleHealth, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  ok: {
    label: "Stable",
    className: "border-matrice-success/30 bg-matrice-success/12 text-matrice-encre",
    icon: CheckCircle2,
  },
  watch: {
    label: "A surveiller",
    className: "border-matrice-warning/35 bg-matrice-warning/14 text-matrice-encre",
    icon: CircleHelp,
  },
  polish: {
    label: "UX a polir",
    className: "border-matrice-terracotta/35 bg-matrice-terracotta/12 text-matrice-encre",
    icon: CircleAlert,
  },
};

export default function ModulesGuidePage() {
  const [selectedPhase, setSelectedPhase] = useState<string>("Tous");
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  const modules = useMemo(() => {
    if (selectedPhase === "Tous") return MODULE_GUIDE;
    return MODULE_GUIDE.filter((item) => item.phase === selectedPhase);
  }, [selectedPhase]);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => undefined);
    setInstallPrompt(null);
  }

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matrice-or-fonce">Guide de production</p>
              <h1 className="mt-3 font-serif text-4xl font-bold text-matrice-encre sm:text-5xl">Fiches claires par module</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-matrice-encre/68">
                Chaque fiche explique l'utilite du module, le bouton principal, le cout en credits,
                le resultat attendu et les corrections UX a surveiller. C'est notre tableau de bord pour
                decrypter Matrice fonctionnalite par fonctionnalite.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-matrice-sable bg-matrice-ivoire p-2 text-center text-xs text-matrice-encre/70 sm:min-w-[360px]">
              <Metric label="Modules" value={MODULE_GUIDE.length} />
              <Metric label="Stables" value={MODULE_GUIDE.filter((item) => item.health === "ok").length} />
              <Metric label="A polir" value={MODULE_GUIDE.filter((item) => item.health !== "ok").length} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-matrice-encre text-matrice-ivoire">
                <MonitorSmartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-matrice-encre">Adaptation tous supports</h2>
                <p className="mt-2 text-sm leading-6 text-matrice-encre/65">
                  Matrice fonctionne en navigateur desktop, tablette et smartphone. Le menu mobile regroupe les routes
                  principales et les modules du projet. Les pages marquees "UX a polir" sont les priorites de contraste
                  et lisibilite.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <SupportCard icon={MonitorSmartphone} title="Ordinateur" text="Vue complete avec sidebar projet et cockpit." />
              <SupportCard icon={TabletSmartphone} title="Tablette" text="Grilles fluides, cartes lisibles et menu compacte." />
              <SupportCard icon={Smartphone} title="Smartphone" text="Menu mobile, boutons 44px minimum, installation PWA." />
            </div>
          </div>

          <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Installation smartphone</p>
                <h2 className="mt-2 font-serif text-2xl font-bold text-matrice-encre">Installer Matrice comme une app</h2>
              </div>
              <Download className="h-5 w-5 text-matrice-or-fonce" />
            </div>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-matrice-encre/70">
              <li><strong className="text-matrice-encre">Android Chrome :</strong> ouvre le menu, puis "Installer l'application" ou utilise le bouton ci-dessous si disponible.</li>
              <li><strong className="text-matrice-encre">iPhone Safari :</strong> bouton Partager, puis "Sur l'ecran d'accueil".</li>
              <li><strong className="text-matrice-encre">Apres installation :</strong> ouvre Matrice depuis l'icone, connecte-toi, puis continue ton projet.</li>
            </ol>
            <Button
              type="button"
              onClick={() => void installApp()}
              disabled={!installPrompt}
              className="mt-5 w-full rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit"
            >
              Installer si le navigateur le propose
            </Button>
            {!installPrompt ? (
              <p className="mt-2 text-xs text-matrice-encre/52">
                Si le bouton est grise, utilise le menu du navigateur. iOS ne donne pas encore de bouton automatique.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-matrice-sable bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {["Tous", ...MODULE_PHASES].map((phase) => (
              <button
                type="button"
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={cn(
                  "min-h-11 rounded-xl border px-4 text-sm font-medium transition",
                  selectedPhase === phase
                    ? "border-matrice-encre bg-matrice-encre text-matrice-ivoire"
                    : "border-matrice-sable bg-matrice-ivoire text-matrice-encre/72 hover:bg-matrice-sable/45 hover:text-matrice-encre",
                )}
              >
                {phase}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </section>
      </div>
    </AppLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white px-3 py-3">
      <p className="text-2xl font-bold text-matrice-encre">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-matrice-encre/50">{label}</p>
    </div>
  );
}

function SupportCard({ icon: Icon, title, text }: { icon: typeof MonitorSmartphone; title: string; text: string }) {
  return (
    <article className="rounded-xl border border-matrice-sable bg-matrice-ivoire p-4">
      <Icon className="h-5 w-5 text-matrice-or-fonce" />
      <h3 className="mt-3 font-semibold text-matrice-encre">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-matrice-encre/62">{text}</p>
    </article>
  );
}

function ModuleCard({ module }: { module: ModuleGuideItem }) {
  const health = healthCopy[module.health];
  const Icon = health.icon;
  const href = module.route.includes(":id") ? "/dashboard" : module.route;

  return (
    <article className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">{module.phase}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-matrice-encre">{module.title}</h2>
        </div>
        <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", health.className)}>
          <Icon className="h-3.5 w-3.5" />
          {health.label}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="A quoi ca sert" value={module.purpose} />
        <Info label="Ce qui marche" value={module.works} />
        <Info label="Ce qui bloque" value={module.blocks} />
        <Info label="Bouton principal" value={module.mainButton} />
        <Info label="Cout credits" value={module.creditCost} />
        <Info label="Resultat attendu" value={module.expectedResult} />
      </dl>

      <div className="mt-4 rounded-xl border border-matrice-warning/25 bg-matrice-warning/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-matrice-or-fonce">Correction UX si besoin</p>
        <p className="mt-2 text-sm leading-6 text-matrice-encre/72">{module.uxFix}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={href}>
            Ouvrir
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        {module.route.includes(":id") ? (
          <p className="flex min-h-11 items-center text-xs text-matrice-encre/52">
            Depuis un projet, le lien exact remplace automatiquement :id.
          </p>
        ) : null}
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-matrice-sable bg-matrice-ivoire p-3">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-matrice-encre/50">{label}</dt>
      <dd className="mt-2 leading-6 text-matrice-encre/78">{value}</dd>
    </div>
  );
}
