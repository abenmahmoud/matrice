import type { FormEvent } from "react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, ExternalLink, Link2, Plus, ReceiptText, ShieldCheck, Trash2, WalletCards } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type SalesChannel = {
  name: string;
  url: string;
  model: string;
  revenueType: string;
  note: string;
};

type ChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  done: boolean;
};

type PublishPlan = {
  project: { id: string; title: string; target_format: string };
  work_type: string;
  channels: SalesChannel[];
  checklist: ChecklistItem[];
  disclaimer: string;
};

type SalesSplit = {
  gross_amount: number;
  matrice_share: number;
  author_share: number;
  currency: string;
  matrice_percent: number;
  author_percent: number;
};

type SalesEntry = {
  id: string;
  channel: string;
  date: string;
  gross_amount: number;
  currency: string;
  note: string;
  split: SalesSplit;
};

type SalesResponse = {
  entries: SalesEntry[];
  totals: SalesSplit;
};

type PublishingFinance = {
  payout_account: null | {
    id: string;
    status: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    requirementsCurrentlyDue: string[];
  };
  channel_connections: Array<{ id: string; channel: string; externalAccount?: string | null; status: string }>;
  settlements: Array<{
    id: string;
    channel: string;
    grossAmountCents: number;
    applicationFeeAmountCents: number;
    netAmountCents: number;
    currency: string;
    status: string;
    kycStatus: string;
  }>;
};

export default function ProjectPublishPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    channel: "",
    date: new Date().toISOString().slice(0, 10),
    gross_amount: "",
    currency: "EUR",
    note: "",
  });
  const [channelForm, setChannelForm] = useState({ channel: "", external_account: "" });
  const [checkoutForm, setCheckoutForm] = useState({ channel: "Matrice", amount_cents: "990", currency: "EUR" });

  const planQuery = useQuery({
    queryKey: ["publish-plan", id],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/projects/${id}/publish-plan`);
      if (!response.ok) throw new Error("Plan indisponible");
      return response.json() as Promise<PublishPlan>;
    },
    enabled: !!id,
  });

  const salesQuery = useQuery({
    queryKey: ["sales", id],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/projects/${id}/sales`);
      if (!response.ok) throw new Error("Ventes indisponibles");
      return response.json() as Promise<SalesResponse>;
    },
    enabled: !!id,
  });

  const financeQuery = useQuery({
    queryKey: ["publishing-finance", id],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/projects/${id}/publishing/finance`);
      if (!response.ok) throw new Error("Finance publication indisponible");
      return response.json() as Promise<PublishingFinance>;
    },
    enabled: !!id,
  });

  const createSale = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/projects/${id}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: form.channel.trim() || defaultChannel,
          date: form.date,
          gross_amount: Number(form.gross_amount),
          currency: form.currency.trim().toUpperCase(),
          note: form.note.trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((payload as { error?: string }).error ?? "Saisie impossible");
      return payload;
    },
    onSuccess: () => {
      setForm((current) => ({ ...current, channel: "", gross_amount: "", note: "" }));
      toast({ title: "Vente ajoutee", description: "La repartition 10/90 a ete recalculee." });
      queryClient.invalidateQueries({ queryKey: ["sales", id] });
    },
    onError: (err) => {
      toast({
        title: "Vente non ajoutee",
        description: err instanceof Error ? err.message : "Une erreur est survenue.",
        variant: "destructive",
      });
    },
  });

  const deleteSale = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await apiFetch(`${BASE}/api/projects/${id}/sales/${entryId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Suppression impossible");
    },
    onSuccess: () => {
      toast({ title: "Vente supprimee" });
      queryClient.invalidateQueries({ queryKey: ["sales", id] });
    },
  });

  const onboarding = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/connect/payout-account/onboarding`, { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((payload as { error?: string }).error ?? "Onboarding indisponible");
      return payload as { url: string };
    },
    onSuccess: (payload) => {
      window.location.href = payload.url;
    },
    onError: (err) => toast({ title: "Stripe Connect indisponible", description: err instanceof Error ? err.message : undefined, variant: "destructive" }),
  });

  const connectChannel = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/projects/${id}/publishing/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(channelForm),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((payload as { error?: string }).error ?? "Canal impossible");
      return payload;
    },
    onSuccess: () => {
      setChannelForm({ channel: "", external_account: "" });
      toast({ title: "Canal ajoute" });
      queryClient.invalidateQueries({ queryKey: ["publishing-finance", id] });
    },
  });

  const connectCheckout = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/projects/${id}/publishing/connect-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: checkoutForm.channel,
          amount_cents: Number(checkoutForm.amount_cents),
          currency: checkoutForm.currency,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((payload as { error?: string }).error ?? "Checkout impossible");
      return payload as { url: string };
    },
    onSuccess: (payload) => {
      window.location.href = payload.url;
    },
    onError: (err) => toast({ title: "Paiement test indisponible", description: err instanceof Error ? err.message : undefined, variant: "destructive" }),
  });

  const plan = planQuery.data;
  const sales = salesQuery.data;
  const defaultChannel = useMemo(() => plan?.channels[0]?.name ?? "", [plan?.channels]);
  const canSubmit = (form.channel.trim() || defaultChannel) && Number(form.gross_amount) > 0 && form.currency.trim().length === 3;

  function submit(event: FormEvent) {
    event.preventDefault();
    createSale.mutate();
  }

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Link href={`/projects/${id}`} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-matrice-or-fonce hover:text-matrice-encre">
          <ArrowLeft className="h-4 w-4" />
          Retour au projet
        </Link>

        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Publier & vendre</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-serif text-4xl text-matrice-encre">{plan?.project.title ?? "Plan de publication"}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-matrice-encre/70">
                Prepare les canaux adaptes, garde la checklist sous les yeux et saisis les ventes externes pour suivre la repartition 10% Matrice / 90% auteur.
              </p>
            </div>
            {plan ? <TypeBadge label={plan.work_type} /> : null}
          </div>
        </header>

        {planQuery.isLoading ? <p className="rounded-2xl border border-matrice-sable bg-white p-6 text-sm text-matrice-encre/60">Chargement du plan...</p> : null}
        {planQuery.error ? <p className="rounded-2xl border border-matrice-error/30 bg-matrice-error/10 p-6 text-sm text-matrice-error">Plan indisponible.</p> : null}

        {plan ? (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
                <h2 className="font-serif text-2xl text-matrice-encre">Canaux suggeres</h2>
                {plan.channels.length ? (
                  <div className="mt-4 grid gap-3">
                    {plan.channels.map((channel) => (
                      <a key={channel.name} href={channel.url} target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-matrice-sable p-4 transition hover:border-matrice-encre/25 hover:bg-matrice-sable/25">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-matrice-encre">{channel.name}</h3>
                            <p className="mt-1 text-sm leading-6 text-matrice-encre/65">{channel.note}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <SmallBadge>{channel.model}</SmallBadge>
                              <SmallBadge>{channel.revenueType}</SmallBadge>
                            </div>
                          </div>
                          <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-matrice-or-fonce transition group-hover:text-matrice-encre" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-matrice-sable bg-matrice-sable/25 p-4 text-sm leading-6 text-matrice-encre/70">
                    Aucun canal de vente direct pour un concept. La bonne action ici : protection, pitch, puis developpement vers un format vendable.
                  </div>
                )}
              </div>

              <aside className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
                <h2 className="font-serif text-2xl text-matrice-encre">Checklist</h2>
                <div className="mt-4 grid gap-3">
                  {plan.checklist.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-xl border border-matrice-sable p-3">
                      <span className={`mt-0.5 h-4 w-4 rounded-full border ${item.done ? "border-matrice-success bg-matrice-success" : "border-matrice-encre/30"}`} />
                      <div>
                        <p className="text-sm font-medium text-matrice-encre">{item.label}</p>
                        <p className="mt-0.5 text-xs text-matrice-encre/55">{item.required ? "Requis" : "Recommande"}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-matrice-encre/55">{plan.disclaimer}</p>
              </aside>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <article className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-matrice-success" />
                  <h2 className="font-serif text-2xl text-matrice-encre">Stripe Connect auteur</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-matrice-encre/65">
                  Phase B en mode test : compte auteur connecté, destination charges, commission 10% via application_fee_amount. Aucun encaissement live tant que connect_live reste désactivé.
                </p>
                <div className="mt-4 rounded-xl border border-matrice-sable bg-matrice-ivoire/60 p-4 text-sm">
                  {financeQuery.isLoading ? "Chargement..." : financeQuery.data?.payout_account ? (
                    <div className="grid gap-1 text-matrice-encre/75">
                      <span>Statut : <strong>{financeQuery.data.payout_account.status}</strong></span>
                      <span>KYC : <strong>{financeQuery.data.payout_account.detailsSubmitted && financeQuery.data.payout_account.payoutsEnabled ? "complet" : "incomplet"}</strong></span>
                      <span>Paiements : {financeQuery.data.payout_account.chargesEnabled ? "actifs" : "bloques"} · Payouts : {financeQuery.data.payout_account.payoutsEnabled ? "actifs" : "bloques"}</span>
                    </div>
                  ) : "Aucun compte auteur connecté."}
                </div>
                <Button onClick={() => onboarding.mutate()} disabled={onboarding.isPending} className="mt-4 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                  <Link2 className="h-4 w-4" />
                  {financeQuery.data?.payout_account ? "Mettre a jour le KYC" : "Connecter Stripe Express"}
                </Button>
                <p className="mt-3 text-xs leading-5 text-matrice-encre/55">TODO : vérifier DAC7 + TVA commission avec comptable avant activation live.</p>
              </article>

              <article className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
                <h2 className="font-serif text-2xl text-matrice-encre">Vente test Connect</h2>
                <p className="mt-2 text-sm leading-6 text-matrice-encre/65">Crée une Checkout Session Stripe test avec transfert destination auteur et fee native Matrice 10%.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Input value={checkoutForm.channel} onChange={(event) => setCheckoutForm((current) => ({ ...current, channel: event.target.value }))} placeholder="Canal" />
                  <Input value={checkoutForm.amount_cents} onChange={(event) => setCheckoutForm((current) => ({ ...current, amount_cents: event.target.value }))} placeholder="990" />
                  <Input value={checkoutForm.currency} maxLength={3} onChange={(event) => setCheckoutForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))} />
                </div>
                <Button onClick={() => connectCheckout.mutate()} disabled={connectCheckout.isPending} className="mt-4 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                  Lancer paiement test
                </Button>
                {financeQuery.data?.settlements.length ? (
                  <div className="mt-4 grid gap-2 text-xs text-matrice-encre/65">
                    {financeQuery.data.settlements.slice(0, 5).map((settlement) => (
                      <div key={settlement.id} className="rounded-lg border border-matrice-sable p-2">
                        {settlement.channel} · {settlement.status} · fee {formatMoney(settlement.applicationFeeAmountCents / 100, settlement.currency)}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            </section>

            <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
              <h2 className="font-serif text-2xl text-matrice-encre">Canaux connectes</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <Input value={channelForm.channel} onChange={(event) => setChannelForm((current) => ({ ...current, channel: event.target.value }))} placeholder="Amazon KDP, Filmhub..." />
                <Input value={channelForm.external_account} onChange={(event) => setChannelForm((current) => ({ ...current, external_account: event.target.value }))} placeholder="Identifiant externe optionnel" />
                <Button onClick={() => connectChannel.mutate()} disabled={connectChannel.isPending || channelForm.channel.trim().length < 2} className="rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                  Ajouter
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {financeQuery.data?.channel_connections.map((connection) => <SmallBadge key={connection.id}>{connection.channel} · {connection.status}</SmallBadge>)}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
              <form onSubmit={(event) => void submit(event)} className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
                <h2 className="font-serif text-2xl text-matrice-encre">Ajouter une vente</h2>
                <div className="mt-4 grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-matrice-encre">
                    Canal
                    <Input value={form.channel} onChange={(event) => setForm((current) => ({ ...current, channel: event.target.value }))} placeholder={defaultChannel || "Ex : Amazon KDP"} list="publish-channels" />
                    <datalist id="publish-channels">
                      {plan.channels.map((channel) => <option key={channel.name} value={channel.name} />)}
                    </datalist>
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-matrice-encre">
                      Date
                      <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-matrice-encre">
                      Devise
                      <Input value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))} maxLength={3} />
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-medium text-matrice-encre">
                    Montant brut
                    <Input type="number" min="0" step="0.01" value={form.gross_amount} onChange={(event) => setForm((current) => ({ ...current, gross_amount: event.target.value }))} placeholder="49.90" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-matrice-encre">
                    Note
                    <Textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} rows={3} placeholder="Periode, reference externe, commentaire..." />
                  </label>
                </div>
                <Button disabled={!canSubmit || createSale.isPending} className="mt-5 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
                  <Plus className="h-4 w-4" />
                  {createSale.isPending ? "Ajout..." : "Ajouter"}
                </Button>
              </form>

              <div className="rounded-2xl border border-matrice-sable bg-white shadow-sm">
                <div className="border-b border-matrice-sable p-5">
                  <div className="flex items-center gap-2">
                    <WalletCards className="h-5 w-5 text-matrice-or-fonce" />
                    <h2 className="font-serif text-2xl text-matrice-encre">Suivi des ventes</h2>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <TotalBox label="Brut" value={sales?.totals.gross_amount ?? 0} currency={sales?.totals.currency ?? "EUR"} />
                    <TotalBox label="Auteur 90%" value={sales?.totals.author_share ?? 0} currency={sales?.totals.currency ?? "EUR"} />
                    <TotalBox label="Matrice 10%" value={sales?.totals.matrice_share ?? 0} currency={sales?.totals.currency ?? "EUR"} />
                  </div>
                </div>

                {salesQuery.isLoading ? (
                  <p className="p-6 text-sm text-matrice-encre/60">Chargement des ventes...</p>
                ) : sales?.entries.length ? (
                  <div className="divide-y divide-matrice-sable">
                    {sales.entries.map((entry) => (
                      <article key={entry.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <ReceiptText className="h-4 w-4 text-matrice-or-fonce" />
                            <h3 className="font-semibold text-matrice-encre">{entry.channel}</h3>
                            <SmallBadge>{new Date(entry.date).toLocaleDateString("fr-FR")}</SmallBadge>
                          </div>
                          {entry.note ? <p className="mt-1 text-sm text-matrice-encre/60">{entry.note}</p> : null}
                          <p className="mt-1 text-xs text-matrice-encre/50">Auteur {formatMoney(entry.split.author_share, entry.currency)} · Matrice {formatMoney(entry.split.matrice_share, entry.currency)}</p>
                        </div>
                        <div className="flex items-center gap-3 sm:justify-end">
                          <p className="font-semibold text-matrice-encre">{formatMoney(entry.gross_amount, entry.currency)}</p>
                          <button type="button" onClick={() => deleteSale.mutate(entry.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-matrice-error hover:bg-matrice-error/10" aria-label="Supprimer la vente">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="p-8 text-center text-sm text-matrice-encre/55">Aucune vente saisie pour ce projet.</p>
                )}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </AppLayout>
  );
}

function TypeBadge({ label }: { label: string }) {
  return <span className="rounded-full bg-matrice-bleu-nuit px-3 py-1 text-sm font-semibold text-matrice-ivoire">{label}</span>;
}

function SmallBadge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-matrice-ivoire px-2 py-0.5 text-xs font-medium text-matrice-encre/70">{children}</span>;
}

function TotalBox({ label, value, currency }: { label: string; value: number; currency: string }) {
  return (
    <div className="rounded-xl border border-matrice-sable bg-matrice-ivoire/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-matrice-encre/55">{label}</p>
      <p className="mt-1 text-lg font-semibold text-matrice-encre">{formatMoney(value, currency)}</p>
    </div>
  );
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount);
}
