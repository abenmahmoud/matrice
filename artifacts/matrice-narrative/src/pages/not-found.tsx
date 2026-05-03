import { Link } from "wouter";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090e]">
      <div className="text-center px-8 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 text-primary/60" />
        </div>
        <p className="text-7xl font-serif font-black text-primary/20 mb-4 tracking-tight">404</p>
        <h1 className="text-xl font-serif font-bold text-foreground mb-3">
          Cette page n'existe pas
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          La page que vous cherchez a peut-être été déplacée, supprimée, ou n'a jamais existé.
        </p>
        <Link href="/dashboard">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/15 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </button>
        </Link>
      </div>
    </div>
  );
}
