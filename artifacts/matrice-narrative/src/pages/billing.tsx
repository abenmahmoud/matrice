import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, FileText, Loader2, ExternalLink, Download, AlertCircle, CheckCircle } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/* Types */
interface Subscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: number;
}

interface Invoice {
  id: string;
  amount: string;
  currency: string;
  status: string;
  description: string;
  periodStart: string;
  periodEnd: string;
  pdfUrl: string;
  vatAmount: string;
  totalWithVat: string;
  createdAt: string;
}

/* API helpers */
function authHeaders(): HeadersInit {
  const token = localStorage.getItem("matrice_user_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchSubscription(): Promise<{ subscription: Subscription | null }> {
  const res = await fetch(`${BASE}/api/payments/subscription`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erreur");
  return res.json();
}

async function fetchInvoices(): Promise<{ invoices: Invoice[] }> {
  const res = await fetch(`${BASE}/api/payments/invoices`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erreur");
  return res.json();
}

async function fetchPortal(): Promise<{ url: string }> {
  const res = await fetch(`${BASE}/api/payments/portal`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erreur");
  return res.json();
}

async function cancelSub(): Promise<unknown> {
  const res = await fetch(`${BASE}/api/payments/cancel`, { method: "POST", headers: authHeaders() });
  if (!res.ok) throw new Error("Erreur");
  return res.json();
}

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit",
  pro: "Pro",
  studio: "Studio",
  publish: "Publish",
};

const PLAN_PRICES: Record<string, string> = {
  free: "0 EUR",
  pro: "9.90 EUR/mois",
  studio: "19.90 EUR/mois",
  publish: "29.90 EUR/mois",
};

export default function BillingPage() {
  const { toast } = useToast();

  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ["billing-sub"],
    queryFn: fetchSubscription,
  });

  const { data: invData, isLoading: invLoading } = useQuery({
    queryKey: ["billing-invoices"],
    queryFn: fetchInvoices,
  });

  const portalMut = useMutation({
    mutationFn: fetchPortal,
    onSuccess: (d) => { window.location.href = d.url; },
    onError: () => toast({ title: "Erreur", description: "Impossible d'ouvrir le portail", variant: "destructive" }),
  });

  const cancelMut = useMutation({
    mutationFn: cancelSub,
    onSuccess: () => { toast({ title: "Annulation programme" }); },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  const sub = subData?.subscription;
  const invoices = invData?.invoices || [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Facturation</h1>
        <p className="text-muted-foreground mb-6">Gerez votre abonnement et vos factures.</p>

        <Tabs defaultValue="subscription">
          <TabsList className="mb-4">
            <TabsTrigger value="subscription">Abonnement</TabsTrigger>
            <TabsTrigger value="invoices">Factures</TabsTrigger>
            <TabsTrigger value="upgrade">Changer de formule</TabsTrigger>
          </TabsList>

          {/* Abonnement */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Mon abonnement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : !sub ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Vous n'avez pas d'abonnement actif.</p>
                    <Link href={`${BASE}/pricing`}>
                      <Button>Choisir une formule</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Formule actuelle</p>
                        <p className="text-xl font-bold">{PLAN_LABELS[sub.plan] || sub.plan}</p>
                        <p className="text-sm text-muted-foreground">{PLAN_PRICES[sub.plan] || ""}</p>
                      </div>
                      <Badge className={sub.status === "active" ? "bg-green-500" : "bg-amber-500"}>
                        {sub.status === "active" ? "Actif" : sub.status}
                      </Badge>
                    </div>

                    {sub.currentPeriodEnd && (
                      <p className="text-sm text-muted-foreground">
                        Prochaine facturation : {new Date(sub.currentPeriodEnd).toLocaleDateString("fr-FR")}
                      </p>
                    )}

                    {sub.cancelAtPeriodEnd ? (
                      <div className="p-4 bg-amber-50 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <p className="text-sm text-amber-700">
                          Votre abonnement sera annule a la fin de la periode en cours.
                        </p>
                      </div>
                    ) : null}

                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" onClick={() => portalMut.mutate()} disabled={portalMut.isPending}>
                        {portalMut.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-1" />}
                        Gerer mon abonnement
                      </Button>
                      {!sub.cancelAtPeriodEnd && (
                        <Button variant="outline" onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending}>
                          Annuler
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Factures */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Mes factures
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : invoices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Aucune facture pour le moment.</p>
                ) : (
                  <div className="space-y-2">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                        <div>
                          <p className="font-medium">{inv.description || "Facture"}</p>
                          <p className="text-xs text-muted-foreground">
                            {inv.periodStart ? new Date(inv.periodStart).toLocaleDateString("fr-FR") : ""}
                            {inv.vatAmount ? ` — TVA: ${inv.vatAmount} EUR` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{inv.totalWithVat || inv.amount} EUR</span>
                          {inv.pdfUrl && (
                            <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upgrade */}
          <TabsContent value="upgrade">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "pro", label: "Pro", price: "9.90 EUR/mois", desc: "Pour les ecrivains amateurs. Projets illimites, export PDF." },
                { key: "studio", label: "Studio", price: "19.90 EUR/mois", desc: "Pour les ecrivains pros. Tout Pro + IA avancee, memoire creative." },
                { key: "publish", label: "Publish", price: "29.90 EUR/mois", desc: "Pour les auteurs qui publient. Tout Studio + certification + export KDP." },
              ].map((plan) => (
                <Card key={plan.key} className={sub?.plan === plan.key ? "border-green-400" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.label}
                      {sub?.plan === plan.key && <Badge className="bg-green-500">Actif</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-2xl font-bold">{plan.price}</p>
                    <p className="text-sm text-muted-foreground">{plan.desc}</p>
                    {sub?.plan !== plan.key && (
                      <CheckoutButton plan={plan.key} />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

/* Bouton Stripe Checkout */
function CheckoutButton({ plan }: { plan: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("matrice_user_token");
      const res = await fetch(`${BASE}/api/payments/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "Erreur", description: "Impossible de demarrer le paiement", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button className="w-full" onClick={handleCheckout} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
      Choisir {plan}
    </Button>
  );
}
