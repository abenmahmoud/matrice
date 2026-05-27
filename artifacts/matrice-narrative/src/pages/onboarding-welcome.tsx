import { Link } from "wouter";
import { ArrowRight, BookOpen, Bell, MessageCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

export default function OnboardingWelcomePage() {
  return (
    <AppLayout>
      <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Bienvenue</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl text-matrice-encre sm:text-5xl">On prépare ton premier vrai parcours Matrice.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-matrice-encre/72">
            Pas besoin d’avoir tout le roman prêt. Une idée, un synopsis ou une scène suffisent pour créer le projet, lancer une première analyse et savoir quoi travailler ensuite.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: BookOpen, title: "Projet", text: "Dépose l’idée brute et ouvre l’atelier." },
              { icon: Bell, title: "Notifications", text: "Reçois les bons signaux sans bruit inutile." },
              { icon: MessageCircle, title: "Support", text: "Un ticket direct si quelque chose bloque." },
            ].map((item) => (
              <article key={item.title} className="rounded-xl border border-matrice-sable bg-matrice-ivoire/60 p-4">
                <item.icon className="h-5 w-5 text-matrice-terracotta" />
                <h2 className="mt-3 font-serif text-xl text-matrice-encre">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-matrice-encre/70">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding">
              <Button className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                Voir les étapes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/projects/new">
              <Button variant="outline" className="rounded-xl">Créer mon projet</Button>
            </Link>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
