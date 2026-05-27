import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Send, Ticket, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminButton, KpiCard, PlanBadge } from "@/components/admin/AdminBits";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type InviteCode = {
  code: string;
  planGranted: string;
  durationMonths: number;
  maxUses: number;
  usesCount: number;
  expiresAt?: string | null;
  notes?: string | null;
  createdAt: string;
};

type InvitesPayload = {
  codes: InviteCode[];
  stats: { total: number; total_uses: number; active: number; expired: number };
};

export default function AdminInvitesPage() {
  const queryClient = useQueryClient();
  const [count, setCount] = useState(10);
  const [notes, setNotes] = useState("Beta publique BraveHeart");
  const [lastCodes, setLastCodes] = useState<string[]>([]);
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/invites"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/admin/invites`);
      if (!response.ok) throw new Error("Codes beta inaccessibles");
      return response.json() as Promise<InvitesPayload>;
    },
  });

  const generate = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/admin/invites/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, plan_granted: "premium", duration_months: 3, max_uses: 1, notes }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((payload as { error?: string }).error ?? "Generation impossible");
      return payload as { generated: number; codes: string[] };
    },
    onSuccess: async (payload) => {
      setLastCodes(payload.codes);
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/invites"] });
    },
  });

  const revoke = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiFetch(`${BASE}/api/admin/invites/${encodeURIComponent(code)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Revocation impossible");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/invites"] }),
  });

  return (
    <AdminShell title="Codes beta" subtitle="Generation et suivi des invitations premium 3 mois pour les premiers testeurs.">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Codes" value={data?.stats.total ?? 0} />
        <KpiCard label="Actifs" value={data?.stats.active ?? 0} tone="good" />
        <KpiCard label="Utilisations" value={data?.stats.total_uses ?? 0} />
        <KpiCard label="Expires" value={data?.stats.expired ?? 0} tone="warn" />
      </section>

      <section className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[140px_1fr_auto]">
          <Input type="number" min={1} max={50} value={count} onChange={(event) => setCount(Number(event.target.value))} aria-label="Nombre de codes" />
          <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Note interne" />
          <AdminButton disabled={generate.isPending} onClick={() => generate.mutate()}>
            <Ticket className="h-4 w-4" />
            Generer codes Premium 3 mois
          </AdminButton>
        </div>
        {lastCodes.length > 0 && (
          <div className="mt-4 rounded-xl border border-matrice-sable bg-matrice-ivoire p-4">
            <p className="text-sm font-semibold text-matrice-encre">Derniers codes generes</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {lastCodes.map((code) => <CodeChip key={code} code={code} />)}
            </div>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-matrice-sable bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-matrice-sable text-left text-xs uppercase tracking-[0.08em] text-matrice-encre">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Expiration</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-matrice-encre/65">Chargement...</td></tr>
              ) : data?.codes.length ? data.codes.map((code) => (
                <tr key={code.code} className="border-b border-matrice-sable/70 odd:bg-white even:bg-matrice-sable/20">
                  <td className="px-4 py-3 font-mono text-matrice-encre">{code.code}</td>
                  <td className="px-4 py-3"><PlanBadge plan={code.planGranted} /></td>
                  <td className="px-4 py-3 text-matrice-encre/75">{code.usesCount}/{code.maxUses}</td>
                  <td className="px-4 py-3 text-matrice-encre/65">{code.expiresAt ? new Date(code.expiresAt).toLocaleDateString("fr-FR") : "Sans limite"}</td>
                  <td className="px-4 py-3 text-matrice-encre/65">{code.notes ?? "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <CodeChip code={code.code} compact />
                      <AdminButton variant="secondary" className="px-3" onClick={() => shareCode(code.code)}><Send className="h-4 w-4" /></AdminButton>
                      <AdminButton variant="danger" className="px-3" disabled={revoke.isPending} onClick={() => revoke.mutate(code.code)}><Trash2 className="h-4 w-4" /></AdminButton>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-4 py-6 text-matrice-encre/65">Aucun code beta.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

function CodeChip({ code, compact = false }: { code: string; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => copyCode(code)}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-matrice-sable bg-white px-3 font-mono text-xs text-matrice-encre hover:bg-matrice-sable/45"
      title="Copier le code"
    >
      <Copy className="h-4 w-4 text-matrice-or-fonce" />
      {compact ? "Copier" : code}
    </button>
  );
}

function copyCode(code: string) {
  void navigator.clipboard?.writeText(code);
}

function shareCode(code: string) {
  const text = `Tu ecris un roman ? Matrice est en beta, voici un code premium 3 mois gratuit : ${code} -> https://matrice.essuf.fr/signup?invite=${encodeURIComponent(code)}`;
  if (navigator.share) {
    void navigator.share({ title: "Invitation beta Matrice", text });
  } else {
    void navigator.clipboard?.writeText(text);
  }
}
