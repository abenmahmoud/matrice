import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { useListCharacters, getListCharactersQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Users, MessageCircle, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Message = { role: "user" | "assistant"; content: string };
type Character = { id: string; name: string; role: string; wound?: string | null };

export default function DialoguePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Character | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chars, isLoading } = useListCharacters(id!, {
    query: { enabled: !!id, queryKey: getListCharactersQueryKey(id!) }
  });
  const characters = (chars ?? []) as Character[];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, sending]);

  function selectCharacter(char: Character) {
    setSelected(char);
    setHistory([]);
    setInput("");
  }

  async function send() {
    if (!input.trim() || !selected || sending) return;
    const msg = input.trim();
    setInput("");
    setSending(true);
    const newHistory: Message[] = [...history, { role: "user", content: msg }];
    setHistory(newHistory);
    try {
      const res = await fetch(`${BASE}/api/projects/${id}/characters/${selected.id}/dialogue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json() as { response: string };
      setHistory([...newHistory, { role: "assistant", content: data.response }]);
    } catch {
      toast({ variant: "destructive", title: "Erreur de connexion", description: "Impossible de contacter le personnage." });
      setHistory(history);
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
  }

  if (isLoading) return (
    <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>
  );

  if (!characters.length) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold mb-3">Dialogue des Personnages</h1>
          <p className="text-muted-foreground max-w-sm">
            Créez d'abord vos personnages pour pouvoir leur parler directement.
          </p>
        </div>
        <Link href={`/projects/${id}/characters`}>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
            Créer des personnages
          </Button>
        </Link>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-0px)] overflow-hidden">

        {/* Sidebar: character list */}
        <div className="w-56 flex-shrink-0 border-r border-white/[0.05] bg-[#09090e] overflow-y-auto">
          <div className="p-4 border-b border-white/[0.05]">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">Personnages</h2>
          </div>
          <div className="p-2 space-y-1">
            {characters.map(char => (
              <button key={char.id} onClick={() => selectCharacter(char)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                  selected?.id === char.id ? "bg-violet-600/20 border border-violet-500/30" : "hover:bg-white/[0.04] border border-transparent"
                )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif font-bold flex-shrink-0",
                  selected?.id === char.id ? "bg-violet-600/40 text-violet-200" : "bg-white/[0.07] text-white/50"
                )}>
                  {char.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-xs font-semibold truncate", selected?.id === char.id ? "text-violet-200" : "text-white/60")}>{char.name}</p>
                  <p className="text-[10px] text-white/25 truncate">{char.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#09090e]">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-8">
              <Users className="w-10 h-10 text-white/10" />
              <p className="text-white/25 text-sm">Sélectionnez un personnage pour commencer la conversation</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.05]">
                <div className="w-10 h-10 rounded-full bg-violet-600/25 border border-violet-500/30 flex items-center justify-center">
                  <span className="text-base font-serif font-bold text-violet-300">{selected.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-bold text-white/80">{selected.name}</p>
                  <p className="text-xs text-white/30 italic">{selected.role}</p>
                </div>
                {history.length > 0 && (
                  <Button size="sm" variant="ghost" className="ml-auto text-xs text-white/25 hover:text-white/50"
                    onClick={() => setHistory([])}>Réinitialiser</Button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                {history.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                    <p className="text-xs text-white/20 mb-4">Vous parlez maintenant avec {selected.name}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        `${selected.name}, qu'est-ce qui vous a le plus marqué dans votre enfance ?`,
                        "Quelle est votre plus grande peur ?",
                        "Qu'est-ce que vous ne diriez jamais à personne ?",
                        "Comment voyez-vous la fin de cette histoire ?",
                      ].map(q => (
                        <button key={q} onClick={() => setInput(q)}
                          className="text-xs px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/40 hover:bg-white/[0.07] hover:text-white/60 transition-all text-left max-w-xs">
                          {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <AnimatePresence initial={false}>
                  {history.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-serif font-bold text-violet-300">{selected.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className={cn(
                        "max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-violet-600/20 text-violet-100 border border-violet-500/25 rounded-tr-sm"
                          : "bg-[#12101a] text-white/75 border border-white/[0.07] rounded-tl-sm"
                      )}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {sending && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-serif font-bold text-violet-300">{selected.name.charAt(0)}</span>
                    </div>
                    <div className="bg-[#12101a] border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-white/[0.05]">
                <div className="flex gap-3">
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={`Parlez à ${selected.name}…`}
                    rows={1}
                    className="flex-1 resize-none bg-[#12101a] border-white/[0.08] text-sm text-white/80 placeholder:text-white/20 focus:border-violet-500/40 rounded-xl min-h-[44px] max-h-32"
                  />
                  <Button onClick={() => void send()} disabled={sending || !input.trim()} size="icon"
                    className="h-11 w-11 rounded-xl bg-violet-600 hover:bg-violet-500 flex-shrink-0">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-white/15 mt-2 text-center">Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne</p>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
