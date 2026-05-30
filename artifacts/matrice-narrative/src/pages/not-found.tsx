import { Link } from "wouter";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-matrice-ivoire text-matrice-encre">
      <div className="text-center px-8 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-matrice-terracotta/10 border border-matrice-terracotta/20 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 text-matrice-terracotta" />
        </div>
        <p className="text-7xl font-serif font-black text-matrice-or-fonce/25 mb-4 tracking-tight">404</p>
        <h1 className="text-xl font-serif font-bold text-matrice-encre mb-3">
          Cette page n'existe pas
        </h1>
        <p className="text-sm text-matrice-encre/58 mb-8 leading-relaxed">
          La page que vous cherchez a peut-être été déplacée, supprimée, ou n'a jamais existé.
        </p>
        <Link href="/dashboard">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-matrice-terracotta/10 border border-matrice-terracotta/20 text-matrice-terracotta text-sm font-medium hover:bg-matrice-terracotta/15 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </button>
        </Link>
      </div>
    </div>
  );
}
