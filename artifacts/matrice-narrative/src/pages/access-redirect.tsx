import { Link, useLocation } from "wouter";
import { ArrowRight, LockKeyhole, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const CONTENT = {
  "/auth-required": {
    icon: LockKeyhole,
    title: "Connexion requise",
    text: "Cree ou confirme ton compte pour continuer dans Matrice.",
    primary: "Creer un compte",
    href: "/signup",
  },
  "/upgrade": {
    icon: Sparkles,
    title: "Palier requis",
    text: "Cette action est reservee aux plans payants ou a l'owner prive.",
    primary: "Voir les paliers",
    href: "/pricing",
  },
  "/forbidden": {
    icon: ShieldAlert,
    title: "Acces protege",
    text: "Cette zone est reservee a son proprietaire ou a un role autorise.",
    primary: "Retour dashboard",
    href: "/dashboard",
  },
};

export default function AccessRedirectPage() {
  const [location] = useLocation();
  const content = CONTENT[location as keyof typeof CONTENT] ?? CONTENT["/forbidden"];
  const Icon = content.icon;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#09090e] px-5 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#10101a] p-7 text-center shadow-2xl shadow-black/35">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
          <Icon className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">{content.title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">{content.text}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="bg-violet-500 text-white hover:bg-violet-400">
            <Link href={`${BASE}${content.href}`}>
              {content.primary}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`${BASE}/`}>Accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
