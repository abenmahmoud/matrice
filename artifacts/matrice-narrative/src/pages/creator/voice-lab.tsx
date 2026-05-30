import { Link } from "wouter";
import { CheckCircle2, Mic2, Server, ShieldCheck, TriangleAlert } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminButton } from "@/components/admin/AdminBits";

const ENGINES = [
  { name: "Chatterbox Multilingual", license: "MIT", fit: "Voix clonée 5s, FR natif, watermarking", status: "candidat prioritaire" },
  { name: "OpenVoice v2", license: "MIT", fit: "Clone zero-shot, français, contrôle style", status: "fallback solide" },
  { name: "Kokoro 82M", license: "Apache 2.0", fit: "Très léger CPU, voix FR prête, pas de cloning", status: "lecture standard gratuite" },
];

export default function VoiceLabPage() {
  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-essuf-or px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-matrice-encre">
            <Mic2 className="h-4 w-4" />
            Voice Lab gratuit
          </div>
          <h1 className="mt-4 font-serif text-4xl text-matrice-encre">Laboratoire voix auteur</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-matrice-encre/70">
            Préparation pro sans coût récurrent : consentement, choix moteur open source, checklist qualité et architecture. La génération audio reste désactivée tant que l’infra GPU n’est pas validée.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/creator-lab"><AdminButton variant="secondary">Retour Creator Lab</AdminButton></Link>
            <Link href="/creator-lab/system"><AdminButton variant="secondary"><Server className="h-4 w-4" /> Vérifier infra</AdminButton></Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {ENGINES.map((engine) => (
            <article key={engine.name} className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-matrice-or-fonce">{engine.license}</p>
              <h2 className="mt-3 font-serif text-2xl text-matrice-encre">{engine.name}</h2>
              <p className="mt-2 text-sm leading-6 text-matrice-encre/70">{engine.fit}</p>
              <span className="mt-4 inline-flex rounded-full bg-matrice-sable px-2.5 py-1 text-xs font-semibold text-matrice-encre">{engine.status}</span>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-matrice-success" />
            <h2 className="mt-3 font-serif text-2xl text-matrice-encre">Ce qui ne coûte rien maintenant</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-matrice-encre/72">
              {["Uploader un sample de consentement plus tard", "Préparer le texte livre audio par chapitres", "Choisir moteur MIT/Apache compatible commercial", "Documenter watermark et consentement explicite"].map((item) => (
                <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-matrice-success" /> {item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-matrice-warning/30 bg-matrice-warning/10 p-5 shadow-sm">
            <TriangleAlert className="h-5 w-5 text-matrice-or-fonce" />
            <h2 className="mt-3 font-serif text-2xl text-matrice-encre">Ce qui attend décision</h2>
            <p className="mt-3 text-sm leading-6 text-matrice-encre/72">
              Le modèle est gratuit, mais le rendu long audiobook demande du temps CPU/GPU. Sprint K ajoute donc le Voice Lab comme espace de décision gratuit, sans lancer de worker payant ni générer de fichiers.
            </p>
          </article>
        </section>
      </main>
    </AppLayout>
  );
}
