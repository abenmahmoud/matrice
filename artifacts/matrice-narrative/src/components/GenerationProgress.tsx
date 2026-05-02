import { Loader2, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  isGenerating: boolean;
  progress: number;
  step: string;
  error: string | null;
  onCancel?: () => void;
};

export function GenerationProgress({ isGenerating, progress, step, error, onCancel }: Props) {
  if (!isGenerating && !error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        {error ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Erreur de génération</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <Loader2 className="w-12 h-12 text-primary/30 absolute inset-0 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-semibold">L'IA génère votre contenu</h3>
                <p className="text-sm text-muted-foreground">Cette opération peut prendre 30–90 secondes</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>{step}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full bg-primary rounded-full transition-all duration-700 ease-out",
                    progress < 100 && "animate-pulse"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>

            {onCancel && (
              <button
                onClick={onCancel}
                className="mt-6 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
