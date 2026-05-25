import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, Check, Copy, ExternalLink, Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifyBadge } from "@/components/VerifyBadge";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const HASH_RE = /^[a-f0-9]{64}$/i;

type VerifyResponse =
  | {
      found: true;
      title: string;
      author: string;
      workType: string;
      language: string;
      sealedAt: string;
      contentHash: string;
      otsStatus: string;
      otsBlockchain: string;
      otsBlockHeight: number | null;
      otsConfirmedAt: string | null;
      verifyUrl: string;
      proofProvider: string;
    }
  | {
      found: false;
      message: string;
    };

export default function VerifyWorkPage() {
  const { hash = "" } = useParams<{ hash: string }>();
  const normalizedHash = hash.toLowerCase();
  const validFormat = HASH_RE.test(normalizedHash);

  const { data, isLoading, isError } = useQuery<VerifyResponse>({
    queryKey: ["public-verify", normalizedHash],
    enabled: validFormat,
    retry: false,
    queryFn: async () => {
      const response = await fetch(`${BASE}/api/public/verify/${normalizedHash}`);
      if (response.status === 404) {
        return { found: false, message: "Aucun passeport d'oeuvre trouve pour ce hash" };
      }
      if (!response.ok) {
        throw new Error("Verification impossible");
      }
      return response.json() as Promise<VerifyResponse>;
    },
  });

  const pageUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const unknownHash = !validFormat || isError || data?.found === false;
  const title = data?.found ? data.title || "Oeuvre sans titre" : "";
  const confirmed = data?.found && data.otsStatus === "confirmed";

  return (
    <main className="min-h-screen bg-[#0B0B0D] text-[#EDEBE6]" style={{ fontFamily: "Manrope, Inter, sans-serif" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-[#C9A961]/20 pb-5">
          <Link href="/">
            <div className="text-lg font-bold uppercase tracking-[0.22em] text-[#C9A961]" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
              Matrice
            </div>
          </Link>
          <p className="hidden text-sm text-[#EDEBE6]/55 sm:block">Vérification d'oeuvre</p>
        </header>

        <section className="flex flex-1 items-center py-10 sm:py-14">
          {isLoading ? (
            <div className="mx-auto flex items-center gap-3 text-[#EDEBE6]/70">
              <Loader2 className="h-5 w-5 animate-spin text-[#C9A961]" />
              Vérification du passeport d'oeuvre...
            </div>
          ) : data?.found ? (
            <article className="mx-auto w-full max-w-2xl border border-[#C9A961]/30 bg-[#0B0B0D] p-5 shadow-[0_0_80px_rgba(201,169,97,0.08)] sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 border border-[#C9A961]/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A961]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Passeport d'oeuvre vérifié
                  </div>
                  <h1 className="mt-6 text-4xl font-semibold leading-tight text-[#EDEBE6] sm:text-5xl" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                    {title}
                  </h1>
                  <p className="mt-2 text-lg text-[#C9A961]">par {data.author || "Anonyme"}</p>
                </div>
                <VerifyBadge size="lg" confirmed={confirmed} className="shrink-0" />
              </div>

              <dl className="mt-8 grid gap-4 border-t border-[#C9A961]/15 pt-6 sm:grid-cols-2">
                <Fact label="Type d'oeuvre" value={labelWorkType(data.workType)} />
                <Fact label="Langue" value={labelLanguage(data.language)} />
                <Fact label="Verrouillée le" value={formatDate(data.sealedAt)} />
                <Fact label="Preuve" value={data.proofProvider || "Matrice Narrative"} />
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.16em] text-[#EDEBE6]/42">Empreinte cryptographique SHA-256</dt>
                  <dd className="mt-2 break-all border border-[#EDEBE6]/10 bg-[#EDEBE6]/[0.025] p-3 font-mono text-xs leading-relaxed text-[#EDEBE6]/74">
                    {data.contentHash}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.16em] text-[#EDEBE6]/42">Blockchain</dt>
                  <dd className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    {confirmed ? (
                      <span className="inline-flex items-center gap-2 bg-[#C9A961] px-2.5 py-1 font-bold text-[#0B0B0D]">
                        <Check className="h-3.5 w-3.5" />
                        Confirmé sur Bitcoin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 border border-[#C9A961]/30 px-2.5 py-1 text-[#C9A961]">
                        Confirmation Bitcoin en attente
                      </span>
                    )}
                    {data.otsBlockHeight ? <span className="text-[#EDEBE6]/60">Bloc #{data.otsBlockHeight}</span> : null}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 grid gap-5 border-t border-[#C9A961]/15 pt-6 sm:grid-cols-[128px_1fr]">
                <img
                  src={`${BASE}/api/public/verify/${data.contentHash}/qr.png?size=256`}
                  alt="QR code de vérification"
                  className="h-32 w-32 border border-[#C9A961]/25 bg-[#EDEBE6] p-2"
                />
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-[#EDEBE6]/62">
                    Scannez ou partagez ce QR code pour ouvrir cette page de vérification publique.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={() => void copyText(pageUrl)}
                      className="bg-[#C9A961] text-[#0B0B0D] hover:bg-[#d9bb79]"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copier le lien
                    </Button>
                    <a href={`https://opentimestamps.org/verify?hash=${data.contentHash}`} target="_blank" rel="noopener noreferrer">
                      <Button type="button" variant="outline" className="border-[#C9A961]/35 bg-transparent text-[#C9A961] hover:bg-[#C9A961]/10">
                        OpenTimestamps
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ) : unknownHash ? (
            <article className="mx-auto w-full max-w-2xl border border-[#C9A961]/25 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#C9A961]/35 text-[#C9A961]">
                <X className="h-5 w-5" />
              </div>
              <h1 className="mt-6 text-3xl font-semibold text-[#EDEBE6]" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                Aucun passeport trouvé
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#EDEBE6]/58">
                Le hash fourni ne correspond à aucune oeuvre verrouillée sur Matrice, ou son format est invalide.
              </p>
              <p className="mt-5 break-all font-mono text-xs text-[#EDEBE6]/38">{hash}</p>
              <Link href="/">
                <Button type="button" variant="outline" className="mt-8 border-[#C9A961]/35 bg-transparent text-[#C9A961] hover:bg-[#C9A961]/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à Matrice
                </Button>
              </Link>
            </article>
          ) : null}
        </section>

        <footer className="border-t border-[#C9A961]/15 py-5 text-center text-xs text-[#EDEBE6]/42">
          Matrice Narrative — Plateforme d'agent littéraire numérique
        </footer>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.16em] text-[#EDEBE6]/42">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#EDEBE6]/82">{value}</dd>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function labelLanguage(value: string): string {
  if (value === "francais") return "Français";
  return value || "Non renseignée";
}

async function copyText(value: string): Promise<void> {
  if (!value || !navigator.clipboard) return;
  await navigator.clipboard.writeText(value);
}
