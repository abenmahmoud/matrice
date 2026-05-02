import { useParams } from "wouter";
import { useGetProject, useExportProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, FileJson, FileText, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ExportType = "matrix" | "emotional-core" | "hpsa" | "book-outline" | "manuscript" | "screenplay" | "pitch" | "complete";

const EXPORTS: Array<{
  type: ExportType;
  label: string;
  description: string;
  icon: typeof FileJson;
  format: string;
}> = [
  { type: "matrix", label: "Matrice Narrative", description: "La source de vérité complète de votre univers", icon: FileJson, format: "JSON" },
  { type: "emotional-core", label: "Noyau Émotionnel", description: "L'arc émotionnel et la transformation du protagoniste", icon: FileJson, format: "JSON" },
  { type: "hpsa", label: "Scores H.P.S.A.", description: "L'évaluation complète de l'impact narratif", icon: FileJson, format: "JSON" },
  { type: "book-outline", label: "Plan du livre", description: "Structure, chapitres et synopsis complets", icon: FileText, format: "Markdown" },
  { type: "screenplay", label: "Scénario Fountain", description: "Le scénario au format standard Fountain", icon: Code, format: ".fountain" },
  { type: "pitch", label: "Dossier Pitch", description: "Le dossier de présentation professionnel", icon: FileText, format: "Markdown" },
  { type: "complete", label: "Projet complet", description: "Toutes les données du projet en un fichier", icon: FileJson, format: "JSON" },
];

export default function ExportsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: project } = useGetProject(id!, {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id!) }
  });

  const handleExport = async (type: ExportType) => {
    try {
      const response = await fetch(`/api/projects/${id}/export/${type}`);
      if (!response.ok) throw new Error("Export failed");
      const data = await response.json();

      const blob = new Blob([data.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "Export réussi", description: `Fichier ${data.filename} téléchargé.` });
    } catch {
      toast({ variant: "destructive", title: "Erreur d'export", description: "Impossible d'exporter ce fichier." });
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Exports</h1>
          <p className="text-muted-foreground mt-1">Téléchargez vos documents créatifs en formats professionnels</p>
        </div>

        {project && (
          <div className="rounded-xl border border-border/50 bg-card/30 p-4">
            <p className="text-sm text-muted-foreground">Projet : <span className="text-foreground font-medium">{project.title}</span></p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPORTS.map((exp) => (
            <Card key={exp.type} className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <exp.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{exp.label}</CardTitle>
                      <span className="text-xs text-muted-foreground font-mono">.{exp.format.toLowerCase().replace(/^\./, "")}</span>
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
                  data-testid={`export-${exp.type}`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger {exp.format}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
