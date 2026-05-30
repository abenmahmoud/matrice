import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Preferences = Record<string, boolean | string>;

const PREFS = [
  ["email_mandate_events", "Mandats"],
  ["email_export_ready", "Exports prêts"],
  ["email_lentille_done", "Lentille Marché"],
  ["email_beta_warnings", "Fin de beta"],
  ["email_support_reply", "Réponses support"],
  ["email_product_updates", "Nouveautés produit"],
  ["inapp_all", "Notifications in-app"],
] as const;

export default function NotificationPreferencesPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => (await apiFetch(`${BASE}/api/notifications/preferences`)).json() as Promise<{ preferences: Preferences }>,
  });
  const save = useMutation({
    mutationFn: (patch: Record<string, boolean | string>) => apiFetch(`${BASE}/api/notifications/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notification-preferences"] }),
  });
  const prefs = data?.preferences ?? {};

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matrice-or-fonce">Profil</p>
          <h1 className="mt-3 font-serif text-4xl text-matrice-encre">Préférences notifications</h1>
          <p className="mt-2 text-sm leading-6 text-matrice-encre/70">Tu gardes la main sur les emails et les alertes in-app.</p>
        </header>
        <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
          <div className="grid gap-3">
            {PREFS.map(([key, label]) => (
              <label key={key} className="flex min-h-[52px] items-center justify-between rounded-xl border border-matrice-sable px-4">
                <span className="text-sm font-medium text-matrice-encre">{label}</span>
                <input type="checkbox" checked={Boolean(prefs[key])} onChange={(event) => save.mutate({ [key]: event.target.checked })} className="h-5 w-5 accent-matrice-encre" />
              </label>
            ))}
            <label className="flex flex-col gap-2 rounded-xl border border-matrice-sable px-4 py-3">
              <span className="text-sm font-medium text-matrice-encre">Rythme digest</span>
              <select value={String(prefs.digestFrequency ?? prefs.digest_frequency ?? "realtime")} onChange={(event) => save.mutate({ digest_frequency: event.target.value })} className="h-11 rounded-lg border border-matrice-sable bg-white px-3 text-sm">
                <option value="realtime">Temps réel</option>
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="never">Jamais</option>
              </select>
            </label>
          </div>
          <Button className="mt-5 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit" onClick={() => save.mutate({})}>Enregistrer</Button>
        </section>
      </main>
    </AppLayout>
  );
}
