import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type AuditPayload = {
  actions: Array<{
    id: string;
    adminUserId: string;
    actionType: string;
    targetUserId?: string | null;
    metadata: Record<string, unknown>;
    ipAddress?: string | null;
    createdAt: string;
  }>;
};

export default function AdminAuditLogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/audit"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/admin/audit`);
      if (!response.ok) throw new Error("Audit admin inaccessible");
      return response.json() as Promise<AuditPayload>;
    },
  });

  return (
    <AdminShell title="Audit admin" subtitle="Journal append-only des actions support sensibles.">
      <section className="overflow-hidden rounded-2xl border border-matrice-sable bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-matrice-sable text-left text-xs uppercase tracking-[0.08em] text-matrice-encre">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Cible</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Meta</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-matrice-encre/65">Chargement...</td></tr>
              ) : data?.actions.length ? data.actions.map((action) => (
                <tr key={action.id} className="border-b border-matrice-sable/70 odd:bg-white even:bg-matrice-sable/20">
                  <td className="px-4 py-3 text-matrice-encre/70">{new Date(action.createdAt).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3 font-medium text-matrice-encre">{action.actionType}</td>
                  <td className="px-4 py-3 font-mono text-xs text-matrice-encre/65">{action.adminUserId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-matrice-encre/65">{action.targetUserId ?? "-"}</td>
                  <td className="px-4 py-3 text-matrice-encre/65">{action.ipAddress ?? "-"}</td>
                  <td className="px-4 py-3">
                    <code className="block max-w-sm overflow-hidden text-ellipsis rounded-md bg-matrice-ivoire px-2 py-1 text-xs text-matrice-encre">
                      {JSON.stringify(action.metadata)}
                    </code>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-4 py-6 text-matrice-encre/65">Aucune action admin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
