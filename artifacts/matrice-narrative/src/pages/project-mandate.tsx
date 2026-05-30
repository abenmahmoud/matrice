import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetProject } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { apiFetch } from "@/lib/apiFetch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileSignature,
  Loader2,
  LockKeyhole,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type MandateLevel = "simple" | "advanced" | "exclusive";
type MandateStatus = "draft" | "pending_signature" | "active" | "declined" | "expired" | "revoked";

type Mandate = {
  id: string;
  userId: string;
  projectId: string;
  essufSignEnvelopeId: string | null;
  authorSignUrl: string | null;
  finalPdfHash: string | null;
  otsHash: string | null;
  verifyUrl: string | null;
  signedAt: string | null;
  declinedAt: string | null;
  expiredAt: string | null;
  mandateLevel: MandateLevel;
  commissionPercent: number;
  durationMonths: number;
  territories: string[];
  exclusivity: boolean;
  status: MandateStatus;
  createdAt: string;
  updatedAt: string;
};

type DraftForm = {
  level: MandateLevel;
  commissionPercent: number;
  durationMonths: number;
  territories: string;
  exclusivity: boolean;
};

const LEVELS: Array<{ value: MandateLevel; label: string; description: string; commission: number; exclusive: boolean }> = [
  { value: "simple", label: "Simple", description: "Exploitation via les plateformes Essuf.", commission: 10, exclusive: false },
  { value: "advanced", label: "Avance", description: "Distribution et representation elargie.", commission: 15, exclusive: false },
  { value: "exclusive", label: "Exclusif", description: "Representation commerciale complete.", commission: 20, exclusive: true },
];

const STATUS_META: Record<MandateStatus, { label: string; icon: typeof Clock; className: string }> = {
  draft: { label: "Brouillon", icon: FileSignature, className: "bg-matrice-sable/60 text-matrice-encre" },
  pending_signature: { label: "En attente de signature", icon: Clock, className: "bg-matrice-warning/15 text-matrice-or-fonce" },
  active: { label: "Mandat actif", icon: ShieldCheck, className: "bg-matrice-success/15 text-matrice-success" },
  declined: { label: "Refuse", icon: XCircle, className: "bg-matrice-error/12 text-matrice-error" },
  expired: { label: "Expire", icon: XCircle, className: "bg-matrice-error/12 text-matrice-error" },
  revoked: { label: "Revoque", icon: XCircle, className: "bg-matrice-error/12 text-matrice-error" },
};

async function fetchMandate(projectId: string): Promise<Mandate | null> {
  const response = await apiFetch(`${BASE}/api/projects/${projectId}/mandate`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Impossible de charger le mandat.");
  const payload = await response.json() as { mandate: Mandate };
  return payload.mandate;
}

async function createMandate(projectId: string, form: DraftForm): Promise<Mandate> {
  const response = await apiFetch(`${BASE}/api/projects/${projectId}/mandate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      level: form.level,
      commission_percent: form.commissionPercent,
      duration_months: form.durationMonths,
      territories: splitTerritories(form.territories),
      exclusivity: form.exclusivity,
    }),
  });
  const payload = await response.json().catch(() => ({})) as { mandate?: Mandate; error?: string };
  if (!response.ok || !payload.mandate) throw new Error(errorMessage(payload.error));
  return payload.mandate;
}

async function sendForSignature(mandateId: string): Promise<Mandate> {
  const response = await apiFetch(`${BASE}/api/mandates/${mandateId}/send-for-signature`, { method: "POST" });
  const payload = await response.json().catch(() => ({})) as { mandate?: Mandate; error?: string };
  if (!response.ok || !payload.mandate) throw new Error(errorMessage(payload.error));
  return payload.mandate;
}

export default function ProjectMandatePage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DraftForm>({
    level: "advanced",
    commissionPercent: 15,
    durationMonths: 12,
    territories: "monde",
    exclusivity: false,
  });

  const { data: project } = useGetProject(projectId!, {
    query: { enabled: !!projectId, queryKey: [`/api/projects/${projectId}`] },
  });

  const mandateQuery = useQuery({
    queryKey: [`/api/projects/${projectId}/mandate`],
    queryFn: () => fetchMandate(projectId!),
    enabled: !!projectId,
  });

  const mandate = mandateQuery.data ?? null;

  const createMutation = useMutation({
    mutationFn: () => createMandate(projectId!, form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/mandate`] });
      toast({ title: "Mandat cree", description: "Le brouillon est pret pour signature." });
    },
    onError: (error) => toast({ variant: "destructive", title: "Mandat impossible", description: (error as Error).message }),
  });

  const sendMutation = useMutation({
    mutationFn: (mandateId: string) => sendForSignature(mandateId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/mandate`] });
      toast({ title: "Envoye a Essuf-Sign", description: "Le lien de signature est pret." });
    },
    onError: (error) => toast({ variant: "destructive", title: "Envoi impossible", description: (error as Error).message }),
  });

  const preview = useMemo(() => {
    const level = LEVELS.find((item) => item.value === form.level) ?? LEVELS[1];
    return {
      level,
      territories: splitTerritories(form.territories),
      revenue: 1000 - (1000 * form.commissionPercent / 100),
    };
  }, [form]);

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-4">
          <Link href={`/projects/${projectId}`} className="inline-flex min-h-[44px] items-center gap-2 text-sm text-matrice-encre/60 transition hover:text-matrice-terracotta">
            <ArrowLeft className="h-4 w-4" />
            Retour au projet
          </Link>
          <div className="flex flex-col gap-4 rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Mandat editorial</p>
              <h1 className="mt-2 font-serif text-3xl text-matrice-encre sm:text-4xl">Mandat de representation</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-matrice-encre/64">
                Configurez le mandat, envoyez-le a Essuf-Sign, puis suivez la signature jusqu'au hash de verification public.
              </p>
            </div>
            {mandate && <StatusBadge status={mandate.status} />}
          </div>
        </header>

        {mandateQuery.isLoading ? (
          <LoadingPanel />
        ) : mandate?.status === "pending_signature" ? (
          <PendingPanel mandate={mandate} />
        ) : mandate?.status === "active" ? (
          <ActivePanel mandate={mandate} />
        ) : mandate?.status === "declined" || mandate?.status === "expired" || mandate?.status === "revoked" ? (
          <FinalizedPanel mandate={mandate} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="font-serif text-2xl text-matrice-encre">Parametres du mandat</h2>
                <p className="mt-1 text-sm text-matrice-encre/60">
                  Projet : <span className="font-medium text-matrice-encre">{project?.title ?? "Projet"}</span>
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-matrice-encre">Niveau</label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {LEVELS.map((level) => (
                      <button
                        type="button"
                        key={level.value}
                        onClick={() => setForm((current) => ({
                          ...current,
                          level: level.value,
                          commissionPercent: level.commission,
                          exclusivity: level.exclusive,
                        }))}
                        className={cn(
                          "min-h-[112px] rounded-xl border p-4 text-left transition",
                          form.level === level.value
                            ? "border-matrice-terracotta bg-matrice-terracotta/8 text-matrice-encre"
                            : "border-matrice-sable bg-matrice-ivoire/35 text-matrice-encre/68 hover:border-matrice-or-fonce/50",
                        )}
                      >
                        <span className="block font-medium">{level.label}</span>
                        <span className="mt-2 block text-sm leading-5">{level.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <NumberField
                  label="Commission Essuf-Group"
                  value={form.commissionPercent}
                  min={5}
                  max={30}
                  suffix="%"
                  onChange={(value) => setForm((current) => ({ ...current, commissionPercent: value }))}
                />

                <NumberField
                  label="Duree du mandat"
                  value={form.durationMonths}
                  min={6}
                  max={36}
                  suffix="mois"
                  onChange={(value) => setForm((current) => ({ ...current, durationMonths: value }))}
                />

                <div>
                  <label htmlFor="territories" className="mb-2 block text-sm font-medium text-matrice-encre">Territoires</label>
                  <input
                    id="territories"
                    value={form.territories}
                    onChange={(event) => setForm((current) => ({ ...current, territories: event.target.value }))}
                    className="min-h-[48px] w-full rounded-xl border border-matrice-sable bg-matrice-ivoire/35 px-4 text-base text-matrice-encre outline-none transition focus:border-matrice-terracotta focus:ring-2 focus:ring-matrice-terracotta/20"
                    placeholder="monde, Europe, francophonie"
                  />
                </div>

                <label className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border border-matrice-sable bg-matrice-ivoire/35 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.exclusivity}
                    onChange={(event) => setForm((current) => ({ ...current, exclusivity: event.target.checked }))}
                    className="h-5 w-5 rounded border-matrice-sable text-matrice-terracotta"
                  />
                  <span>
                    <span className="block text-sm font-medium text-matrice-encre">Exclusivite</span>
                    <span className="block text-sm text-matrice-encre/60">A activer seulement pour un mandat commercial exclusif.</span>
                  </span>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {!mandate ? (
                    <ActionButton onClick={() => createMutation.mutate()} loading={createMutation.isPending} icon={FileSignature}>
                      Creer le brouillon
                    </ActionButton>
                  ) : (
                    <ActionButton onClick={() => sendMutation.mutate(mandate.id)} loading={sendMutation.isPending} icon={Send}>
                      Envoyer pour signature
                    </ActionButton>
                  )}
                </div>
              </div>
            </section>

            <aside className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Apercu</p>
              <h2 className="mt-2 font-serif text-2xl text-matrice-encre">Conditions principales</h2>
              <div className="mt-5 space-y-4 text-sm text-matrice-encre/68">
                <PreviewRow label="Niveau" value={preview.level.label} />
                <PreviewRow label="Commission" value={`${form.commissionPercent}%`} />
                <PreviewRow label="Duree" value={`${form.durationMonths} mois`} />
                <PreviewRow label="Territoires" value={preview.territories.join(", ")} />
                <PreviewRow label="Exclusivite" value={form.exclusivity ? "Oui" : "Non"} />
              </div>
              <div className="mt-6 rounded-xl bg-matrice-ivoire p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-matrice-encre/45">Simulation sur 1 000 EUR nets</p>
                <p className="mt-2 text-2xl font-semibold text-matrice-encre">{formatEuro(preview.revenue)}</p>
                <p className="mt-1 text-sm text-matrice-encre/55">Reversement auteur estime apres commission.</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatusBadge({ status }: { status: MandateStatus }) {
  const meta = STATUS_META[status];
  return (
    <div className={cn("inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium", meta.className)}>
      <meta.icon className="h-4 w-4" />
      {meta.label}
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-matrice-sable bg-white">
      <Loader2 className="mr-2 h-5 w-5 animate-spin text-matrice-terracotta" />
      <span className="text-sm text-matrice-encre/62">Chargement du mandat...</span>
    </div>
  );
}

function PendingPanel({ mandate }: { mandate: Mandate }) {
  const { toast } = useToast();
  async function copyLink() {
    if (!mandate.authorSignUrl) return;
    await navigator.clipboard.writeText(mandate.authorSignUrl);
    toast({ title: "Lien copie", description: "Le lien Essuf-Sign est dans le presse-papiers." });
  }

  return (
    <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-matrice-encre">Signature en attente</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-matrice-encre/64">
            Le mandat a ete transmis a Essuf-Sign. L'auteur signe d'abord, puis le mandataire recoit son tour de signature.
          </p>
        </div>
        <Clock className="h-10 w-10 text-matrice-warning" />
      </div>

      <div className="mt-6 rounded-xl border border-matrice-sable bg-matrice-ivoire/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-matrice-or-fonce">Lien auteur</p>
        <p className="mt-2 break-all text-sm text-matrice-encre/70">{mandate.authorSignUrl ?? "Lien indisponible"}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void copyLink()}
            disabled={!mandate.authorSignUrl}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-matrice-sable bg-white px-4 text-sm font-medium text-matrice-encre transition hover:bg-matrice-sable/35 disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            Copier
          </button>
          {mandate.authorSignUrl && (
            <a
              href={mandate.authorSignUrl}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-matrice-terracotta px-4 text-sm font-medium text-white transition hover:bg-matrice-terracotta/90"
            >
              Aller signer
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function ActivePanel({ mandate }: { mandate: Mandate }) {
  return (
    <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-matrice-encre">Mandat actif</h2>
          <p className="mt-2 text-sm text-matrice-encre/64">
            Signature finalisee le {mandate.signedAt ? formatDate(mandate.signedAt) : "date non renseignee"}.
          </p>
        </div>
        <CheckCircle2 className="h-10 w-10 text-matrice-success" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <HashBlock label="Hash PDF signe" value={mandate.finalPdfHash} />
        <HashBlock label="Hash OpenTimestamps" value={mandate.otsHash} />
      </div>

      {mandate.verifyUrl && (
        <a
          href={mandate.verifyUrl}
          className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-matrice-terracotta px-4 text-sm font-medium text-white transition hover:bg-matrice-terracotta/90"
        >
          Verifier publiquement
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </section>
  );
}

function FinalizedPanel({ mandate }: { mandate: Mandate }) {
  return (
    <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <LockKeyhole className="mt-1 h-8 w-8 text-matrice-error" />
        <div>
          <h2 className="font-serif text-2xl text-matrice-encre">Mandat non actif</h2>
          <p className="mt-2 text-sm leading-6 text-matrice-encre/64">
            Statut actuel : {STATUS_META[mandate.status].label}. Creez un nouveau mandat apres verification des conditions commerciales.
          </p>
        </div>
      </div>
    </section>
  );
}

function NumberField({ label, value, min, max, suffix, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-matrice-encre">{label}</label>
        <span className="rounded-full bg-matrice-sable/55 px-3 py-1 text-sm font-medium text-matrice-encre">{value} {suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 w-full accent-matrice-terracotta"
      />
    </div>
  );
}

function ActionButton({ children, loading, icon: Icon, onClick }: {
  children: React.ReactNode;
  loading: boolean;
  icon: typeof FileSignature;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-matrice-terracotta px-5 text-sm font-medium text-white transition hover:bg-matrice-terracotta/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-matrice-sable/70 pb-3">
      <span className="text-matrice-encre/52">{label}</span>
      <span className="max-w-[190px] text-right font-medium text-matrice-encre">{value}</span>
    </div>
  );
}

function HashBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-matrice-sable bg-matrice-ivoire/45 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-matrice-or-fonce">{label}</p>
      <p className="mt-2 break-all font-mono text-xs leading-5 text-matrice-encre/70">{value ?? "Non renseigne"}</p>
    </div>
  );
}

function splitTerritories(value: string): string[] {
  const territories = value.split(",").map((item) => item.trim()).filter(Boolean);
  return territories.length > 0 ? territories : ["monde"];
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
}

function errorMessage(error?: string): string {
  if (error === "PLAN_UPGRADE_REQUIRED") return "Le mandat necessite le plan Studio minimum.";
  if (error === "MANDATE_ALREADY_EXISTS") return "Un mandat actif ou en cours existe deja pour ce projet.";
  if (error === "ESSUF_SIGN_NOT_CONFIGURED") return "Essuf-Sign n'est pas configure sur le serveur.";
  return "Operation impossible pour le moment.";
}
