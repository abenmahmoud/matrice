import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookMarked,
  CheckCircle2,
  CreditCard,
  FlaskConical,
  KeyRound,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiFetch";
import { clearUserToken, setUserToken } from "@/lib/userAuth";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type ProfileTab = "account" | "subscription" | "works" | "settings";

type User = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  plan: string;
  status: string;
  isEmailVerified: boolean;
  creatorModeEnabled?: boolean;
  isBetaTester?: boolean;
  betaExpiresAt?: string | null;
  generationsUsed: number;
  projectsCreated: number;
};

type MeResponse = { user: User; token?: string };
type LockedWorksResponse = { works: Array<{ id: string; otsStatus: string }> };
type ExportJobsResponse = { jobs: Array<{ jobId: string; status: string }> };
type SubscriptionResponse = {
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: number;
  } | null;
};

const TABS: Array<{ key: ProfileTab; label: string; icon: typeof UserRound }> = [
  { key: "account", label: "Compte", icon: UserRound },
  { key: "subscription", label: "Abonnement", icon: CreditCard },
  { key: "works", label: "Mes oeuvres", icon: BookMarked },
  { key: "settings", label: "Paramètres", icon: Bell },
];

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  studio: "Studio",
  premium: "Premium",
  pro: "Plan historique",
  publish: "Plan historique",
  enterprise: "Plan historique",
};

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");
  const { data, isLoading } = useQuery<MeResponse>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/auth/me`);
      if (!response.ok) throw new Error("Profil inaccessible");
      return response.json() as Promise<MeResponse>;
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!data?.user) return null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F1E8] px-4 py-8 text-[#2A2520] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6F2E]">
                Espace auteur
              </p>
              <h1 className="mt-2 font-serif text-3xl font-bold text-[#2A2520]">Mon profil</h1>
              <p className="mt-2 text-sm text-[#2A2520]/60">
                Gérez votre identité, votre abonnement et vos préférences Matrice.
              </p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>
              Tableau de bord
            </Button>
          </header>

          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-[#E8DFC9] bg-white p-2 shadow-sm md:grid-cols-4">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={active
                    ? "flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-matrice-encre px-3 py-2 text-sm font-medium text-matrice-ivoire"
                    : "flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#2A2520]/65 transition hover:bg-[#F5F1E8] hover:text-[#2A2520]"}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "account" && <AccountTab user={data.user} />}
          {activeTab === "subscription" && <SubscriptionTab plan={data.user.plan} />}
          {activeTab === "works" && <WorksTab />}
          {activeTab === "settings" && <SettingsTab email={data.user.email} />}
        </div>
      </div>
    </AppLayout>
  );
}

function AccountTab({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const updateName = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const payload = (await response.json().catch(() => ({}))) as MeResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Mise à jour impossible");
      if (payload.token) setUserToken(payload.token);
      return payload;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      toast({ title: "Profil mis à jour" });
    },
    onError: (error) => toast({ title: "Erreur", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = (await response.json().catch(() => ({}))) as MeResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Changement impossible");
      if (payload.token) setUserToken(payload.token);
      return payload;
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      toast({ title: "Mot de passe mis à jour" });
    },
    onError: (error) => toast({ title: "Erreur", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-[#E8DFC9] bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2A2520]">
            <UserRound className="h-5 w-5 text-[#8B6F2E]" />
            Identité du compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              updateName.mutate();
            }}
          >
            <label className="block text-sm font-medium text-[#2A2520]">
              Nom affiché
              <Input className="mt-2 border-[#E8DFC9]" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </label>
            <div>
              <p className="text-sm font-medium text-[#2A2520]">Email</p>
              <div className="mt-2 flex flex-col gap-2 rounded-lg border border-[#E8DFC9] bg-[#F5F1E8]/60 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="mobile-safe-wrap">{user.email}</span>
                {user.isEmailVerified ? (
                  <Badge className="bg-[#6B8E5A] text-white">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Vérifié
                  </Badge>
                ) : (
                  <Badge variant="outline">À confirmer</Badge>
                )}
              </div>
            </div>
            <Button type="submit" disabled={updateName.isPending}>
              {updateName.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-[#E8DFC9] bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2A2520]">
            <KeyRound className="h-5 w-5 text-[#8B6F2E]" />
            Mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              changePassword.mutate();
            }}
          >
            <Input
              type="password"
              minLength={8}
              required
              placeholder="Mot de passe actuel"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <Input
              type="password"
              minLength={8}
              required
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <Button type="submit" variant="outline" disabled={changePassword.isPending}>
              {changePassword.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Changer le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
      {user.role === "owner" && <CreatorModeCard user={user} />}
    </div>
  );
}

function CreatorModeCard({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const toggle = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/creator/toggle-mode`, { method: "POST" });
      const payload = (await response.json().catch(() => ({}))) as { creator_mode_enabled?: boolean; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Mode Createur indisponible");
      return payload;
    },
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      toast({ title: payload.creator_mode_enabled ? "Mode Createur active" : "Mode Createur desactive" });
    },
    onError: (error) => toast({ title: "Erreur", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
  });

  return (
    <Card className="border-essuf-or/60 bg-white lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#2A2520]">
          <FlaskConical className="h-5 w-5 text-[#8B6F2E]" />
          Creator Mode BraveHeart
          <Badge variant="creator">{user.creatorModeEnabled ? "Actif" : "Off"}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-[#2A2520]/70">
          Active le laboratoire prive pour voir les features WIP, inspecter le systeme et garder la main avant ouverture beta.
        </p>
        <div className="flex flex-wrap gap-3">
          {user.creatorModeEnabled && (
            <Link href="/creator-lab">
              <Button variant="secondary">Ouvrir le Lab</Button>
            </Link>
          )}
          <Button onClick={() => toggle.mutate()} disabled={toggle.isPending}>
            {toggle.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
            {user.creatorModeEnabled ? "Desactiver" : "Activer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionTab({ plan }: { plan: string }) {
  const { data, isLoading } = useQuery<SubscriptionResponse>({
    queryKey: ["profile-subscription"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/payments/subscription`);
      if (!response.ok) throw new Error("Abonnement inaccessible");
      return response.json() as Promise<SubscriptionResponse>;
    },
  });
  const subscription = data?.subscription;
  const displayPlan = subscription?.plan ?? plan;

  return (
    <Card className="border-[#E8DFC9] bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#2A2520]">
          <CreditCard className="h-5 w-5 text-[#8B6F2E]" />
          Abonnement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-[#8B6F2E]" />
        ) : (
          <div className="rounded-xl border border-[#E8DFC9] bg-[#F5F1E8]/60 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8B6F2E]">Plan actuel</p>
            <p className="mt-2 text-3xl font-serif font-bold text-[#2A2520]">{PLAN_LABELS[displayPlan] ?? displayPlan}</p>
            <p className="mt-2 text-sm text-[#2A2520]/60">
              {subscription?.currentPeriodEnd
                ? `Renouvellement : ${new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}`
                : "Aucun renouvellement programmé pour le plan gratuit."}
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <Link href="/billing">
            <Button>Gérer la facturation</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline">Voir les formules</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function WorksTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["profile-work-stats"],
    queryFn: async () => {
      const [locked, exportsResponse] = await Promise.allSettled([
        apiFetch(`${BASE}/api/passport/locked-works`).then((response) => response.ok ? response.json() as Promise<LockedWorksResponse> : { works: [] }),
        apiFetch(`${BASE}/api/exports/list`).then((response) => response.ok ? response.json() as Promise<ExportJobsResponse> : { jobs: [] }),
      ]);
      return {
        lockedWorks: locked.status === "fulfilled" ? locked.value.works.length : 0,
        confirmedWorks: locked.status === "fulfilled" ? locked.value.works.filter((work) => work.otsStatus === "confirmed").length : 0,
        exports: exportsResponse.status === "fulfilled" ? exportsResponse.value.jobs.length : 0,
      };
    },
  });

  const stats = useMemo(() => [
    { label: "Oeuvres verrouillées", value: data?.lockedWorks ?? 0, icon: ShieldCheck },
    { label: "Confirmées Bitcoin", value: data?.confirmedWorks ?? 0, icon: CheckCircle2 },
    { label: "Exports générés", value: data?.exports ?? 0, icon: BookMarked },
    { label: "Mandats signés", value: 0, icon: CreditCard },
  ], [data]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-[#E8DFC9] bg-white">
              <CardContent className="p-5">
                <Icon className="h-5 w-5 text-[#8B6F2E]" />
                <p className="mt-4 text-3xl font-serif font-bold text-[#2A2520]">
                  {isLoading ? "..." : stat.value}
                </p>
                <p className="mt-1 text-sm text-[#2A2520]/60">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Link href="/locked-works">
        <Button>Voir mes oeuvres verrouillées</Button>
      </Link>
    </div>
  );
}

function SettingsTab({ email }: { email: string }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [confirmText, setConfirmText] = useState("");

  const deleteAccount = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/auth/me`, { method: "DELETE" });
      if (!response.ok) throw new Error("Suppression impossible");
      return response.json() as Promise<{ ok: true }>;
    },
    onSuccess: () => {
      clearUserToken();
      toast({ title: "Compte supprimé", description: "Votre session locale a été fermée." });
      setLocation("/signup");
    },
    onError: (error) => toast({ title: "Erreur", description: error instanceof Error ? error.message : undefined, variant: "destructive" }),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-[#E8DFC9] bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#2A2520]">
            <Bell className="h-5 w-5 text-[#8B6F2E]" />
            Préférences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-start gap-3 rounded-xl border border-[#E8DFC9] bg-[#F5F1E8]/60 p-4">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(event) => setNotifications(event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium">Recevoir les notifications importantes</span>
              <span className="mt-1 block text-sm text-[#2A2520]/60">Exports prêts, verrouillage, facturation et sécurité.</span>
            </span>
          </label>
        </CardContent>
      </Card>

      <Card className="border-[#B85450]/25 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#B85450]">
            <Trash2 className="h-5 w-5" />
            Suppression RGPD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-[#2A2520]/65">
            Cette action désactive votre compte. Les obligations légales liées aux factures et preuves d'antériorité peuvent imposer une conservation minimale.
          </p>
          <Input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={`Tapez ${email} pour confirmer`}
          />
          <Button
            variant="destructive"
            disabled={confirmText !== email || deleteAccount.isPending}
            onClick={() => deleteAccount.mutate()}
          >
            {deleteAccount.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Supprimer mon compte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
