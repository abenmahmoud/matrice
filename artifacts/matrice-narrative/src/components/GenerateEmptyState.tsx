import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

interface GenerateEmptyStateProps {
  title: string;
  description: string;
  buttonLabel: string;
  onGenerate: () => void;
  isLoading: boolean;
}

export function GenerateEmptyState({ title, description, buttonLabel, onGenerate, isLoading }: GenerateEmptyStateProps) {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/10">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-3">{title}</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">{description}</p>
        <Button size="lg" onClick={onGenerate} disabled={isLoading} className="h-12 px-8">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {isLoading ? "Génération en cours..." : buttonLabel}
        </Button>
      </div>
    </div>
  );
}
