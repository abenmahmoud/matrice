import { useState } from "react";
import { useParams } from "wouter";
import { useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileJson, FileText, Code, BookOpen, Film, Tv, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ExportType = "matrix" | "emotional-core" | "hpsa" | "book-outline" | "screenplay" | "pitch" | "series-markdown" | "season-arc-json" | "complete";
type Category = "universel" | "roman" | "cinema" | "serie";

const CATEGORY_META: Record<Category, { label: string; icon: React.ElementType; color: string }> = {
  universel: { label: "Universel", icon: Globe, color: "text-violet-400" },
  roman: { label: "Roman", icon: BookOpen, color: "text-amber-400" },
  cinema: { label: "Cinéma", icon: Film, color: "text-blue-400" },
  serie: { label: "Série", icon: Tv, color: "text-emerald-400" },
};

const EXPORTS: Array<{
  type: ExportType;
  label: string;
  description: string;
  icon: React.ElementType;
  format: string;
  category: Category;
}> = [
  { type: "matrix", label: "Matrice Narrative", description: "La source de vérité complète de votre univers narratif", icon: FileJson, format: "JSON", category: "universel" },
  { type: "emotional-core", label: "Noyau Émotionnel", description: "L'arc émotionnel et la transformation du protagoniste", icon: FileJson, format: "JSON", category: "universel" },
  { type: "hpsa", label: "Scores H.P.S.A.", description: "L'évaluation complète de l'impact narratif (4 axes)", icon: FileJson, format: "JSON", category: "universel" },
  { type: "pitch", label: "Dossier Pitch", description: "Le dossier de présentation professionnel complet", icon: FileText, format: "Markdown", category: "universel" },
  { type: "complete", label: "Projet complet", description: "Toutes les données du projet en un seul fichier", icon: FileJson, format: "JSON", category: "universel" },
  { type: "book-outline", label: "Plan du livre", description: "Structure, chapitres enrichis (10 champs) et synopsis", icon: FileText, format: "Markdown", category: "roman" },
  { type: "screenplay", label: "Scénario Fountain", description: "Le scénario au format standard Fountain professionnel", icon: Code, format: ".fountain", category: "cinema" },
  { type: "series-markdown", label: "Bible Série", description: "Concept, arcs longs et tous les épisodes narratifs", icon: FileText, format: "Markdown", category: "serie" },
  { type: "season-arc-json", label: "Arc Saison JSON", description: "Arc saison structuré avec arcs émotionnels par épisode", icon: FileJson, format: "JSON", category: "serie" },
];

const CATEGORIES: Category[] = ["universel", "roman", "cinema", "serie"];

export default function ExportsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState<ExportType | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  const { data: project } = useGetProject(id!, {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id!) }
  });

  const handleExport = async (type: ExportType) => {
    setLoading(type);
    try {
      const response = await fetch(`/api/projects/${id}/export/${type}`);
      if (!response.ok) throw new Error("Export failed");
      const data = await response.json() as { content: string; filename: string };

      const blob = new Blob([data.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "Export réussi", description: `${data.filename} téléchargé.` });
    } catch {
      toast({ variant: "destructive", title: "Erreur d'export", description: "Impossible d'exporter ce fichier." });
    } finally {
      setLoading(null);
    }
  };

  const visible = EXPORTS.filter(e => activeCategory === "all" || e.category === activeCategory);

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Exports</h1>
          <p className="text-muted-foreground mt-1">Téléchargez vos documents créatifs en formats professionnels</p>
        </div>

        {project && (
          <div className="rounded-xl border border-border/50 bg-card/30 px-4 py-3">
            <p className="text-sm text-muted-foreground">Projet : <span className="text-foreground font-semibold">{project.title}</span></p>
          </div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              activeCategory === "all"
                ? "bg-primary/20 border-primary/40 text-primary"
                : "bg-card/30 border-border/40 text-muted-foreground hover:text-foreground"
            )}>
            Tous ({EXPORTS.length})
          </button>
          {CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat];
            const count = EXPORTS.filter(e => e.category === cat).length;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  activeCategory === cat
                    ? "bg-card/60 border-border/70 text-foreground"
                    : "bg-card/20 border-border/30 text-muted-foreground hover:text-foreground"
                )}>
                <meta.icon className={cn("w-3.5 h-3.5", meta.color)} />
                {meta.label}
                <span className="text-muted-foreground/60 ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Export grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((exp) => {
            const catMeta = CATEGORY_META[exp.category];
            const isLoading = loading === exp.type;
            return (
              <Card key={exp.type} className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <exp.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">{exp.label}</CardTitle>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground/50 font-mono">.{exp.format.toLowerCase().replace(/^\./, "")}</span>
                          <span className={cn("text-[10px] flex items-center gap-0.5", catMeta.color)}>
                            <catMeta.icon className="w-2.5 h-2.5" />
                            {catMeta.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-xs mt-2">{exp.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleExport(exp.type)}
                    disabled={isLoading}
                    data-testid={`export-${exp.type}`}
                  >
                    {isLoading
                      ? <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <Download className="w-4 h-4 mr-2" />}
                    {isLoading ? "Génération…" : `Télécharger ${exp.format}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
