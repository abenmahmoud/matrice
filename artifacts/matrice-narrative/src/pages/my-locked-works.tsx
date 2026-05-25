import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Check, Copy, ExternalLink, Loader2, QrCode, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { VerifyBadge } from "@/components/VerifyBadge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type LockedWork = {
  id: string;
  projectId: string;
  title: string;
  author: string;
  workType: string;
  sealedAt: string;
  contentHash: string;
  otsStatus: string;
  otsBlockHeight: number | null;
  verifyUrl: string;
  qrUrl: string;
  badgeUrl: string;
  passportUrl: string;
};

type LockedWorksResponse = {
  works: LockedWork[];
};

export default function MyLockedWorksPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const { data, isLoading } = useQuery<LockedWorksResponse>({
    queryKey: ["locked-works"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/passport/locked-works`);
      if (!response.ok) throw new Error("Chargement impossible");
      return response.json() as Promise<LockedWorksResponse>;
    },
  });

  const works = data?.works ?? [];
  const confirmedCount = works.filter((work) => work.otsStatus === "confirmed").length;

  async function copy(value: string, label: string): Promise<void> {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    toast({ title: "Copié", description: "Le lien est prêt à être partagé." });
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#09090e]">
        <div className="border-b border-white/[0.05] bg-white/[0.01]">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/24">
                Publication Roman
              </p>
              <h1 className="text-3xl font-bold text-white/90">Œuvres verrouillées</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/36">
                Retrouvez les URLs publiques, QR codes et badges embarquables de vos passeports d'œuvre.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-[320px]">
              <Metric label="Verrouillées" value={String(works.length)} />
              <Metric label="Bitcoin" value={String(confirmedCount)} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-7 w-7 animate-spin text-primary/55" />
            </div>
          ) : works.length === 0 ? (
            <div className="mx-auto max-w-xl border border-dashed border-white/[0.09] bg-white/[0.018] p-8 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-white/25" />
              <h2 className="mt-5 text-xl font-serif font-bold text-white/72">Aucune œuvre verrouillée</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/34">
                Scellez un passeport d'œuvre depuis un projet pour générer son lien public de vérification.
              </p>
              <Link href="/dashboard">
                <Button className="mt-6 bg-primary/90 text-white hover:bg-primary">Retour au tableau de bord</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {works.map((work) => (
                <LockedWorkRow
                  key={work.id}
                  work={work}
                  copied={copied}
                  onCopy={copy}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function LockedWorkRow({
  work,
  copied,
  onCopy,
}: {
  work: LockedWork;
  copied: string | null;
  onCopy(value: string, label: string): Promise<void>;
}) {
  const snippet = useMemo(() => badgeSnippet(work), [work]);
  const confirmed = work.otsStatus === "confirmed";

  return (
    <article className="grid gap-5 border border-white/[0.07] bg-white/[0.018] p-5 lg:grid-cols-[1fr_220px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary/80">
                {labelWorkType(work.workType)}
              </span>
              <span className="border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/36">
                {formatDate(work.sealedAt)}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-serif font-bold leading-tight text-white/88">{work.title}</h2>
            <p className="mt-1 text-sm text-white/38">par {work.author || "Anonyme"}</p>
          </div>
          <div className="flex items-center gap-3">
            <VerifyBadge size="md" confirmed={confirmed} />
            <span className={confirmed ? "text-xs font-semibold text-emerald-300" : "text-xs font-semibold text-amber-300"}>
              {confirmed ? `Bitcoin${work.otsBlockHeight ? ` #${work.otsBlockHeight}` : ""}` : "En attente"}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="break-all border border-white/[0.06] bg-black/10 p-3 font-mono text-xs leading-relaxed text-white/45">
            {work.verifyUrl}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="bg-primary/90 text-white hover:bg-primary" onClick={() => void onCopy(work.verifyUrl, work.id)}>
              {copied === work.id ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copier l'URL
            </Button>
            <a href={work.verifyUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="border-white/[0.08] bg-white/[0.02] text-white/55 hover:bg-white/[0.05] hover:text-white/80">
                Ouvrir <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href={work.passportUrl}>
              <Button size="sm" variant="outline" className="border-white/[0.08] bg-white/[0.02] text-white/55 hover:bg-white/[0.05] hover:text-white/80">
                Passeport
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/25">Badge à embarquer</p>
          <div className="break-all border border-white/[0.06] bg-black/10 p-3 font-mono text-[11px] leading-relaxed text-white/42">
            {snippet}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 text-white/45 hover:bg-white/[0.04] hover:text-white/70"
            onClick={() => void onCopy(snippet, `${work.id}-snippet`)}
          >
            {copied === `${work.id}-snippet` ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            Copier le snippet
          </Button>
        </div>
      </div>

      <aside className="border border-white/[0.06] bg-black/10 p-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/28">
          <QrCode className="h-3.5 w-3.5" />
          QR code
        </div>
        <img
          src={`${BASE}${work.qrUrl}`}
          alt={`QR code de vérification pour ${work.title}`}
          className="mt-4 aspect-square w-full bg-white p-3"
        />
        <a href={`${BASE}${work.qrUrl}`} download={`qr-${work.contentHash.slice(0, 12)}.png`}>
          <Button size="sm" variant="outline" className="mt-4 w-full border-white/[0.08] bg-white/[0.02] text-white/55 hover:bg-white/[0.05] hover:text-white/80">
            Télécharger le QR
          </Button>
        </a>
      </aside>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/[0.06] bg-white/[0.018] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/24">{label}</p>
      <p className="mt-3 text-2xl font-serif font-bold text-white/82">{value}</p>
    </div>
  );
}

function badgeSnippet(work: LockedWork): string {
  return `<a href="${work.verifyUrl}"><img src="${work.verifyUrl.replace(`/verify/${work.contentHash}`, `/api/public/verify/${work.contentHash}/badge.svg?size=md`)}" alt="Matrice Certified" /></a>`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function labelWorkType(value: string): string {
  const labels: Record<string, string> = {
    roman: "Roman",
    scenario: "Scénario",
    film: "Film",
    serie: "Série",
    "court-metrage": "Court-métrage",
    autre: "Autre",
  };
  return labels[value] ?? value;
}
