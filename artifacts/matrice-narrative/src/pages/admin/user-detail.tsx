import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Ban, Coins, KeyRound, MailCheck, RefreshCcw, Send, ShieldCheck, Ticket } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton, KpiCard, PlanBadge, UserHealthBadge } from "@/components/admin/AdminBits";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type UserDetailPayload = {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    plan: string;
    status: string;
    isEmailVerified: boolean;
    generationsUsed: number;
    projectsCreated: number;
    creatorModeEnabled: boolean;
    isBetaTester: boolean;
    betaExpiresAt?: string | null;
    onboardingStep: string;
    createdAt: string;
  };
  stats: { projects_count: number; lentille_analyses: number; exports: number; mandates: number; active_mandates: number };
  projects: Array<{ id: string; title: string; genre: string; updatedAt: string }>;
  mandates: Array<{ id: string; status: string; verifyUrl?: string | null; createdAt: string }>;
  credits: {
    balance: { monthly: number; extra: number; total: number };
    renew_at?: string | null;
    history: Array<{ id: string; delta: number; reason: string; balanceAfter: number; meta?: string | null; createdAt: string }>;
  };
  recent_admin_actions: Array<{ id: string; actionType: string; metadata: Record<string, unknown>; createdAt: string }>;
  health_flags: Array<{ level: string; message: string }>;
};

export default function AdminUserDetailPage() {
  const [, params] = useRoute("/admin/users/:id");
  const userId = params?.id ?? "";
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [plan, setPlan] = useState("premium");
  const [betaMonths, setBetaMonths] = useState(3);
  const [betaPlan, setBetaPlan] = useState("premium");
  const [creditAmount, setCreditAmount] = useState(100);
  const [creditReason, setCreditReason] = useState("Ajustement support credits");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/users", userId],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/admin/users/${userId}`);
      if (!response.ok) throw new Error("Utilisateur introuvable");
      return response.json() as Promise<UserDetailPayload>;
    },
    enabled: Boolean(userId),
  });

  const refresh = async () => queryClient.invalidateQueries({ queryKey: ["/api/admin/users", userId] });
  const action = useMutation({
    mutationFn: async ({ path, body }: { path: string; body?: unknown }) => {
      const response = await apiFetch(`${BASE}/api/admin/users/${userId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((payload as { error?: string }).error ?? "Action impossible");
      return payload;
    },
    onSuccess: refresh,
  });

  function submitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    action.mutate({ path: "change-plan", body: { plan, reason: reason || "Ajustement support beta" } });
  }

  function submitCredits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    action.mutate({ path: "credits", body: { amount: creditAmount, reason: creditReason } });
  }

  return (
    <AdminShell title="Fiche utilisateur" subtitle="Vue support complete : usage, projets, mandats, sante du compte et actions tracees.">
      <Link href="/admin/users" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-matrice-or-fonce hover:text-matrice-encre">
        <ArrowLeft className="h-4 w-4" />
        Retour aux utilisateurs
      </Link>

      {isLoading ? (
        <div className="rounded-2xl border border-matrice-sable bg-white p-8 text-matrice-encre/65">Chargement...</div>
      ) : data ? (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-matrice-or-fonce">Compte</p>
                  <h2 className="mt-2 font-serif text-3xl text-matrice-encre">{data.user.displayName || "Sans nom"}</h2>
                  <p className="mobile-safe-wrap mt-1 text-matrice-encre/70">{data.user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PlanBadge plan={data.user.plan} />
                  <UserHealthBadge status={data.user.status} beta={data.user.isBetaTester} />
                  {data.user.creatorModeEnabled && <span className="rounded-full bg-essuf-or px-2.5 py-1 text-xs font-semibold text-matrice-encre">Creator</span>}
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Info label="Role" value={data.user.role} />
                <Info label="Email" value={data.user.isEmailVerified ? "Verifie" : "Non verifie"} />
                <Info label="Onboarding" value={data.user.onboardingStep} />
                <Info label="Inscription" value={new Date(data.user.createdAt).toLocaleDateString("fr-FR")} />
                <Info label="Beta expire" value={data.user.betaExpiresAt ? new Date(data.user.betaExpiresAt).toLocaleDateString("fr-FR") : "-"} />
              </div>
              {data.health_flags.length > 0 && (
                <div className="mt-5 space-y-2">
                  {data.health_flags.map((flag) => (
                    <div key={flag.message} className="rounded-xl border border-matrice-warning/35 bg-matrice-warning/10 px-4 py-3 text-sm text-matrice-encre">
                      {flag.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <KpiCard label="Projets" value={data.stats.projects_count} />
              <KpiCard label="Lentille" value={data.stats.lentille_analyses} tone="good" />
              <KpiCard label="Exports" value={data.stats.exports} />
              <KpiCard label="Mandats actifs" value={data.stats.active_mandates} detail={`${data.stats.mandates} total`} tone="warn" />
              <KpiCard label="Credits" value={data.credits.balance.total} detail={`${data.credits.balance.monthly} mensuels + ${data.credits.balance.extra} achetes`} tone="good" />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-matrice-sable bg-white p-5">
              <h3 className="font-serif text-2xl text-matrice-encre">Actions support</h3>
              <label className="mt-4 block text-sm font-medium text-matrice-encre">
                Raison obligatoire
                <Input className="mt-2" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motif visible dans audit" />
              </label>
              <div className="mt-4 grid gap-3">
                {data.user.status === "suspended" ? (
                  <AdminButton disabled={action.isPending} onClick={() => action.mutate({ path: "reactivate" })}><RefreshCcw className="h-4 w-4" /> Reactiver</AdminButton>
                ) : (
                  <AdminButton variant="danger" disabled={action.isPending || data.user.role === "owner" || reason.length < 5} onClick={() => action.mutate({ path: "suspend", body: { reason } })}><Ban className="h-4 w-4" /> Suspendre</AdminButton>
                )}
                <AdminButton variant="secondary" disabled={action.isPending} onClick={() => action.mutate({ path: "reset-password" })}><KeyRound className="h-4 w-4" /> Envoyer reset password</AdminButton>
                <AdminButton variant="secondary" disabled={action.isPending || data.user.isEmailVerified} onClick={() => action.mutate({ path: "resend-verification" })}><Send className="h-4 w-4" /> Renvoyer verification email</AdminButton>
                <AdminButton variant="secondary" disabled={action.isPending || data.user.isEmailVerified} onClick={() => action.mutate({ path: "mark-email-verified" })}><MailCheck className="h-4 w-4" /> Marquer email verifie</AdminButton>
              </div>
            </div>

            <form onSubmit={submitPlan} className="rounded-2xl border border-matrice-sable bg-white p-5">
              <h3 className="font-serif text-2xl text-matrice-encre">Changer le plan</h3>
              <select className="mt-4 w-full rounded-md border border-matrice-sable bg-white px-3 text-sm text-matrice-encre focus:outline-none focus:ring-2 focus:ring-matrice-or-fonce" value={plan} onChange={(event) => setPlan(event.target.value)}>
                <option value="free">Free</option>
                <option value="studio">Studio</option>
                <option value="premium">Premium</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <AdminButton className="mt-4 w-full" disabled={action.isPending || reason.length < 5 || data.user.role === "owner"}><ShieldCheck className="h-4 w-4" /> Appliquer</AdminButton>
            </form>

            <div className="rounded-2xl border border-matrice-sable bg-white p-5">
              <h3 className="font-serif text-2xl text-matrice-encre">Accorder beta</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Input type="number" min={1} max={12} value={betaMonths} onChange={(event) => setBetaMonths(Number(event.target.value))} />
                <select className="rounded-md border border-matrice-sable bg-white px-3 text-sm text-matrice-encre focus:outline-none focus:ring-2 focus:ring-matrice-or-fonce" value={betaPlan} onChange={(event) => setBetaPlan(event.target.value)}>
                  <option value="studio">Studio</option>
                  <option value="premium">Premium</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <AdminButton className="mt-4 w-full" disabled={action.isPending} onClick={() => action.mutate({ path: "grant-beta", body: { duration_months: betaMonths, plan_during_beta: betaPlan } })}><Ticket className="h-4 w-4" /> Accorder</AdminButton>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <form onSubmit={submitCredits} className="rounded-2xl border border-matrice-sable bg-white p-5">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-matrice-or-fonce" />
                <h3 className="font-serif text-2xl text-matrice-encre">Credits utilisateur</h3>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Info label="Total" value={`${data.credits.balance.total}`} />
                <Info label="Mensuels" value={`${data.credits.balance.monthly}`} />
                <Info label="Achetes" value={`${data.credits.balance.extra}`} />
              </div>
              <p className="mt-3 text-xs text-matrice-encre/55">
                Renouvellement : {data.credits.renew_at ? new Date(data.credits.renew_at).toLocaleDateString("fr-FR") : "-"}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-[140px_1fr]">
                <label className="text-sm font-medium text-matrice-encre">
                  Montant
                  <Input
                    className="mt-2"
                    type="number"
                    min={-10000}
                    max={10000}
                    value={creditAmount}
                    onChange={(event) => setCreditAmount(Number(event.target.value))}
                  />
                </label>
                <label className="text-sm font-medium text-matrice-encre">
                  Raison
                  <Input className="mt-2" value={creditReason} onChange={(event) => setCreditReason(event.target.value)} />
                </label>
              </div>
              <AdminButton className="mt-4 w-full" disabled={action.isPending || creditAmount === 0 || creditReason.length < 5}>
                <Coins className="h-4 w-4" />
                Ajuster les credits
              </AdminButton>
              <p className="mt-3 text-xs leading-5 text-matrice-encre/55">
                Montant positif = ajout de credits achetes. Montant negatif = debit, refuse si le solde est insuffisant.
              </p>
            </form>

            <ListPanel title="Historique credits">
              {data.credits.history.length ? data.credits.history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-4 rounded-xl border border-matrice-sable px-4 py-3">
                  <div>
                    <span className="font-medium text-matrice-encre">{entry.reason}</span>
                    <span className="block text-sm text-matrice-encre/60">{new Date(entry.createdAt).toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="text-right">
                    <span className={entry.delta >= 0 ? "font-semibold text-matrice-success" : "font-semibold text-matrice-error"}>
                      {entry.delta > 0 ? "+" : ""}{entry.delta}
                    </span>
                    <span className="block text-xs text-matrice-encre/55">Solde {entry.balanceAfter}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-matrice-encre/65">Aucun mouvement de credits.</p>}
            </ListPanel>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <ListPanel title="Projets">
              {data.projects.length ? data.projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} className="block rounded-xl border border-matrice-sable px-4 py-3 hover:bg-matrice-sable/35">
                  <span className="font-medium text-matrice-encre">{project.title}</span>
                  <span className="block text-sm text-matrice-encre/60">{project.genre} · {new Date(project.updatedAt).toLocaleDateString("fr-FR")}</span>
                </Link>
              )) : <p className="text-sm text-matrice-encre/65">Aucun projet.</p>}
            </ListPanel>
            <ListPanel title="Actions admin recentes">
              {data.recent_admin_actions.length ? data.recent_admin_actions.map((item) => (
                <div key={item.id} className="rounded-xl border border-matrice-sable px-4 py-3">
                  <span className="font-medium text-matrice-encre">{item.actionType}</span>
                  <span className="block text-sm text-matrice-encre/60">{new Date(item.createdAt).toLocaleString("fr-FR")}</span>
                </div>
              )) : <p className="text-sm text-matrice-encre/65">Aucune action tracee.</p>}
            </ListPanel>
          </section>

          {action.error instanceof Error && (
            <div className="rounded-xl border border-matrice-error/30 bg-matrice-error/10 px-4 py-3 text-sm text-matrice-error">{action.error.message}</div>
          )}
        </>
      ) : null}
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-matrice-ivoire px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-matrice-encre/55">{label}</p>
      <p className="mt-1 text-sm font-medium text-matrice-encre">{value}</p>
    </div>
  );
}

function ListPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-matrice-sable bg-white p-5">
      <h3 className="font-serif text-2xl text-matrice-encre">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}
