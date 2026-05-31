import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, CreditCard, Download, ExternalLink, Loader2, WalletCards } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Interval = "monthly" | "yearly";
type PaidPlan = "studio" | "premium";
type CreditPack = "pack_100" | "pack_300" | "pack_1000";

type Balance = { monthly: number; extra: number; total: number };
type LedgerEntry = {
  id: string;
  delta: number;
  reason: string;
  balanceAfter: number;
  meta?: string | null;
  createdAt: string;
};
type Subscription = {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean | number;
};
type Invoice = {
  id: string;
  amount?: string;
  totalWithVat?: string;
  currency?: string;
  status?: string;
  description?: string;
  pdfUrl?: string;
  createdAt?: string;
};

const PLANS: Array<{ key: PaidPlan; label: string; monthly: string; yearly: string; credits: number }> = [
  { key: "studio", label: "Studio", monthly: "4,99 EUR / mois", yearly: "47,90 EUR / an", credits: 300 },
  { key: "premium", label: "Premium", monthly: "9,99 EUR / mois", yearly: "95,90 EUR / an", credits: 800 },
];

const PACKS: Array<{ key: CreditPack; label: string; credits: number; price: string }> = [
  { key: "pack_100", label: "100 credits", credits: 100, price: "3,99 EUR" },
  { key: "pack_300", label: "300 credits", credits: 300, price: "9,99 EUR" },
  { key: "pack_1000", label: "1000 credits", credits: 1000, price: "24,99 EUR" },
];

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  studio: "Studio",
  premium: "Premium",
  pro: "Plan historique",
  publish: "Plan historique",
  enterprise: "Plan historique",
};

async function jsonOrThrow<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Erreur serveur");
  }
  return payload as T;
}

export default function BillingPage() {
  const [interval, setInterval] = useState<Interval>("yearly");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const balanceQuery = useQuery({
    queryKey: ["credits-balance"],
    queryFn: async () => jsonOrThrow<{ balance: Balance }>(await apiFetch(`${BASE}/api/credits/balance`)),
  });

  const historyQuery = useQuery({
    queryKey: ["credits-history"],
    queryFn: async () => jsonOrThrow<{ history: LedgerEntry[] }>(await apiFetch(`${BASE}/api/credits/history`)),
  });

  const subscriptionQuery = useQuery({
    queryKey: ["billing-subscription"],
    queryFn: async () => jsonOrThrow<{ subscription: Subscription | null }>(await apiFetch(`${BASE}/api/payments/subscription`)),
  });

  const invoicesQuery = useQuery({
    queryKey: ["billing-invoices"],
    queryFn: async () => jsonOrThrow<{ invoices: Invoice[] }>(await apiFetch(`${BASE}/api/payments/invoices`)),
  });

  const portalMutation = useMutation({
    mutationFn: async () => jsonOrThrow<{ url: string }>(await apiFetch(`${BASE}/api/payments/portal`)),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => toast({ title: "Portail indisponible", description: String(err), variant: "destructive" }),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => jsonOrThrow<unknown>(await apiFetch(`${BASE}/api/payments/cancel`, { method: "POST" })),
    onSuccess: async () => {
      toast({ title: "Annulation programmee" });
      await queryClient.invalidateQueries({ queryKey: ["billing-subscription"] });
    },
    onError: (err) => toast({ title: "Annulation impossible", description: String(err), variant: "destructive" }),
  });

  const reactivateMutation = useMutation({
    mutationFn: async () => jsonOrThrow<unknown>(await apiFetch(`${BASE}/api/payments/reactivate`, { method: "POST" })),
    onSuccess: async () => {
      toast({ title: "Abonnement reactive" });
      await queryClient.invalidateQueries({ queryKey: ["billing-subscription"] });
    },
    onError: (err) => toast({ title: "Reactivation impossible", description: String(err), variant: "destructive" }),
  });

  const balance = balanceQuery.data?.balance;
  const subscription = subscriptionQuery.data?.subscription;
  const invoices = invoicesQuery.data?.invoices ?? [];
  const history = historyQuery.data?.history ?? [];

  async function startCheckout(plan: PaidPlan) {
    setLoading(`${plan}:${interval}`);
    try {
      const response = await apiFetch(`${BASE}/api/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const payload = await jsonOrThrow<{ url: string }>(response);
      window.location.href = payload.url;
    } catch (err) {
      toast({ title: "Checkout indisponible", description: String(err), variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  async function startRecharge(pack: CreditPack) {
    setLoading(pack);
    try {
      const response = await apiFetch(`${BASE}/api/payments/recharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      const payload = await jsonOrThrow<{ url: string }>(response);
      window.location.href = payload.url;
    } catch (err) {
      toast({ title: "Recharge indisponible", description: String(err), variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Facturation</p>
            <h1 className="mt-2 text-3xl font-semibold">Credits, abonnement et factures</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-matrice-encre/70">
              Tu vois ici ton solde utilisable, tes recharges, ton abonnement Stripe et l'historique des mouvements.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/pricing">Voir tous les tarifs</Link>
          </Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <WalletCards className="h-5 w-5" />
                Solde credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {balanceQuery.isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <p className="text-4xl font-semibold">{balance?.total ?? 0}</p>
                  <p className="mt-2 text-sm text-matrice-encre/60">
                    {balance?.monthly ?? 0} mensuels + {balance?.extra ?? 0} achetes
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-5 w-5" />
                Abonnement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptionQuery.isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : subscription ? (
                <>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-semibold">{PLAN_LABELS[subscription.plan] ?? "Plan historique"}</p>
                    <Badge>{subscription.status}</Badge>
                  </div>
                  {subscription.currentPeriodEnd ? (
                    <p className="mt-2 text-sm text-matrice-encre/60">
                      Renouvellement : {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-matrice-encre/65">Aucun abonnement actif.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Couts actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-center text-sm">
              <div><p className="text-2xl font-semibold">1</p><p className="text-matrice-encre/60">IA</p></div>
              <div><p className="text-2xl font-semibold">5</p><p className="text-matrice-encre/60">Export</p></div>
              <div><p className="text-2xl font-semibold">10</p><p className="text-matrice-encre/60">Lentille</p></div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="credits">
          <TabsList className="mb-4">
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="subscription">Abonnement</TabsTrigger>
            <TabsTrigger value="invoices">Factures</TabsTrigger>
          </TabsList>

          <TabsContent value="credits" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {PACKS.map((pack) => (
                <Card key={pack.key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{pack.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-2xl font-semibold">{pack.price}</p>
                    <p className="text-sm text-matrice-encre/65">{pack.credits} credits permanents.</p>
                    <Button className="w-full" variant="outline" disabled={!!loading} onClick={() => startRecharge(pack.key)}>
                      {loading === pack.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Acheter
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historique credits</CardTitle>
              </CardHeader>
              <CardContent>
                {historyQuery.isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : history.length === 0 ? (
                  <p className="py-6 text-center text-sm text-matrice-encre/60">Aucun mouvement pour le moment.</p>
                ) : (
                  <div className="divide-y divide-matrice-sable">
                    {history.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                        <div>
                          <p className="font-medium">{entry.reason}</p>
                          <p className="text-matrice-encre/55">{new Date(entry.createdAt).toLocaleString("fr-FR")}</p>
                        </div>
                        <div className="text-right">
                          <p className={entry.delta >= 0 ? "font-semibold text-matrice-success" : "font-semibold text-matrice-error"}>
                            {entry.delta > 0 ? "+" : ""}{entry.delta}
                          </p>
                          <p className="text-xs text-matrice-encre/55">Solde {entry.balanceAfter}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            {subscription?.cancelAtPeriodEnd ? (
              <div className="flex items-start gap-3 rounded-lg border border-matrice-warning/40 bg-matrice-warning/10 p-4 text-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 text-matrice-warning" />
                <p>Ton abonnement est programme pour s'arreter en fin de periode.</p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending || !subscription}>
                {portalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                Portail Stripe
              </Button>
              {subscription?.cancelAtPeriodEnd ? (
                <Button onClick={() => reactivateMutation.mutate()} disabled={reactivateMutation.isPending}>
                  Reactiver
                </Button>
              ) : (
                <Button variant="outline" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending || !subscription}>
                  Annuler
                </Button>
              )}
            </div>

            <div className="rounded-lg border border-matrice-sable bg-white p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">Changer de formule</h2>
                <div className="inline-flex rounded-lg border border-matrice-sable bg-matrice-ivoire p-1">
                  {(["monthly", "yearly"] as Interval[]).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setInterval(value)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                        interval === value ? "bg-matrice-encre text-matrice-ivoire" : "text-matrice-encre/70"
                      }`}
                    >
                      {value === "monthly" ? "Mensuel" : "Annuel"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {PLANS.map((plan) => (
                  <Card key={plan.key} className={subscription?.plan === plan.key ? "border-matrice-success" : ""}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {plan.label}
                        {subscription?.plan === plan.key ? <Badge>Actif</Badge> : null}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-2xl font-semibold">{interval === "monthly" ? plan.monthly : plan.yearly}</p>
                      <p className="text-sm text-matrice-encre/65">{plan.credits} credits mensuels inclus.</p>
                      {subscription?.plan !== plan.key ? (
                        <Button className="w-full" onClick={() => startCheckout(plan.key)} disabled={!!loading}>
                          {loading === `${plan.key}:${interval}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                          Choisir {plan.label}
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Factures Stripe</CardTitle>
              </CardHeader>
              <CardContent>
                {invoicesQuery.isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : invoices.length === 0 ? (
                  <p className="py-6 text-center text-sm text-matrice-encre/60">Aucune facture pour le moment.</p>
                ) : (
                  <div className="divide-y divide-matrice-sable">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <p className="font-medium">{invoice.description || "Facture"}</p>
                          <p className="text-sm text-matrice-encre/55">
                            {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString("fr-FR") : invoice.status}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold">{invoice.totalWithVat || invoice.amount || ""} EUR</p>
                          {invoice.pdfUrl ? (
                            <a href={invoice.pdfUrl} target="_blank" rel="noreferrer">
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
