import { Clapperboard } from "lucide-react";

export function HookProposal({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-matrice-sable bg-white p-5">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-matrice-terracotta/12 text-matrice-terracotta">
        <Clapperboard className="h-5 w-5" />
      </div>
      <p className="text-base leading-relaxed text-matrice-encre">{text || "Hook non disponible."}</p>
    </div>
  );
}
