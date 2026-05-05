import { useState, useCallback, useRef } from "react";

const ADMIN_TOKEN_KEY = "matrice_admin_token";

export type GenerationEvent =
  | { type: "progress"; step: string; percent: number }
  | { type: "done"; data: unknown }
  | { type: "error"; message: string };

export type GenerationState = {
  isGenerating: boolean;
  progress: number;
  step: string;
  error: string | null;
};

export function useGenerateSSE(onDone?: (data: unknown) => void) {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    step: "",
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (url: string, method = "POST") => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setState({ isGenerating: true, progress: 5, step: "Connexion à l'IA...", error: null });

      try {
        const res = await fetch(url, {
          method,
          headers: {
            Accept: "text/event-stream",
            "Content-Type": "application/json",
            ...(localStorage.getItem(ADMIN_TOKEN_KEY) ? { "x-admin-token": localStorage.getItem(ADMIN_TOKEN_KEY)! } : {}),
          },
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Erreur HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event: GenerationEvent = JSON.parse(line.slice(6));
              if (event.type === "progress") {
                setState({ isGenerating: true, progress: event.percent, step: event.step, error: null });
              } else if (event.type === "done") {
                setState({ isGenerating: false, progress: 100, step: "Terminé", error: null });
                onDone?.(event.data);
                return event.data;
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            } catch {
              // skip malformed lines
            }
          }
        }
        return undefined;
      } catch (err) {
        if ((err as Error).name === "AbortError") return undefined;
        setState((s) => ({ ...s, isGenerating: false, error: (err as Error).message }));
        return undefined;
      }
    },
    [onDone]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState({ isGenerating: false, progress: 0, step: "", error: null });
  }, []);

  return { ...state, generate, cancel };
}
