import { useState, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, History, RotateCcw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type VersionMeta = {
  id: string;
  label: string;
  wordCount?: number | null;
  createdAt: string;
};

type VersionFull = VersionMeta & { data: Record<string, unknown> };

interface Props {
  projectId: string;
  contentType: string;
  contentKey: string;
  onRestore: (data: Record<string, unknown>) => void;
  triggerLabel?: string;
  triggerClassName?: string;
}

export function VersionHistoryDrawer({
  projectId,
  contentType,
  contentKey,
  onRestore,
  triggerLabel = "Historique",
  triggerClassName,
}: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<VersionMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${BASE}/api/projects/${projectId}/versions/${contentType}/${contentKey}`);
      const data = await res.json() as VersionMeta[];
      setVersions(Array.isArray(data) ? data : []);
    } catch {
      toast({ variant: "destructive", title: "Impossible de charger l'historique" });
    } finally {
      setLoading(false);
    }
  }, [projectId, contentType, contentKey, toast]);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) void loadVersions();
  };

  const restore = async (versionId: string) => {
    setRestoring(versionId);
    try {
      const res = await apiFetch(`${BASE}/api/projects/${projectId}/versions/single/${versionId}`);
      if (!res.ok) throw new Error("Not found");
      const version = await res.json() as VersionFull;
      onRestore(version.data);
      setOpen(false);
      toast({ title: "Version restaurée" });
    } catch {
      toast({ variant: "destructive", title: "Impossible de restaurer cette version" });
    } finally {
      setRestoring(null);
    }
  };

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="ghost"
          className={cn("text-xs gap-1.5 text-muted-foreground hover:text-foreground", triggerClassName)}>
          <History className="w-3.5 h-3.5" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-[#0d0b14] border-border/30">
        <SheetHeader className="pb-4 border-b border-border/30">
          <SheetTitle className="text-sm font-semibold flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Historique des versions
          </SheetTitle>
          <p className="text-[11px] text-muted-foreground mt-1">
            Les 20 dernières versions sauvegardées. Cliquez sur Restaurer pour revenir à une version précédente.
          </p>
        </SheetHeader>

        <div className="mt-4 overflow-y-auto max-h-[calc(100vh-160px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-primary/50" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground/50">Aucune version sauvegardée</p>
              <p className="text-[10px] text-muted-foreground/30 mt-1">
                Les versions se créent automatiquement avant chaque génération IA.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2 pr-1">
                {versions.map((v, i) => (
                  <motion.div key={v.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card/30 border border-border/30 hover:bg-card/50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground/80 truncate">{v.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatDate(v.createdAt)}
                        </span>
                        {v.wordCount && v.wordCount > 0 && (
                          <span className="text-[10px] text-green-400/60 font-medium">{v.wordCount} mots</span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost"
                      className="h-7 px-2 text-[10px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-primary hover:text-primary hover:bg-primary/10"
                      disabled={restoring === v.id}
                      onClick={() => void restore(v.id)}>
                      {restoring === v.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <RotateCcw className="w-3 h-3" />}
                      Restaurer
                    </Button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
