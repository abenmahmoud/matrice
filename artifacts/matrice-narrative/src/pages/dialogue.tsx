import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { useListCharacters, getListCharactersQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Users, MessageCircle, Clapperboard, Copy, Check, RefreshCw, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Message = { role: "user" | "assistant"; content: string };
type Character = { id: string; name: string; role: string; wound?: string | null };
type FountainResult = { heading: string; fountain: string; subtext: string; dramaticNote: string };

type Mode = "chat" | "fountain";

export default function DialoguePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("chat");

  // Chat mode state
  const [selected, setSelected] = useState<Character | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fountain mode state
  const [char1, setChar1] = useState<Character | null>(null);
  const [char2, setChar2] = useState<Character | null>(null);
  const [sceneContext, setSceneContext] = useState("");
  const [emotionalObjective, setEmotionalObjective] = useState("");
  const [conflictType, setConflictType] = useState("");
  const [toneFountain, setToneFountain] = useState("");
  const [generatingFountain, setGeneratingFountain] = useState(false);
  const [fountainResult, setFountainResult] = useState<FountainResult | null>(null);
  const [copied, setCopied] = useState(false);

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
      const res = await apiFetch(`${BASE}/api/projects/${id}/characters/${selected.id}/dialogue`, {
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

  async function generateFountain() {
    if (!char1 || !char2 || !sceneContext.trim()) return;
    setGeneratingFountain(true);
    setFountainResult(null);
    try {
      const res = await apiFetch(`${BASE}/api/projects/${id}/generate-fountain-dialogue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          char1Id: char1.id, char2Id: char2.id,
          sceneContext: sceneContext.trim(),
          emotionalObjective: emotionalObjective.trim() || undefined,
          conflictType: conflictType.trim() || undefined,
          tone: toneFountain.trim() || undefined,
        }),
      });
      const data = await res.json() as FountainResult;
      setFountainResult(data);
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer la scène." });
    } finally {
      setGeneratingFountain(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
  }

  function copyFountain() {
    if (!fountainResult) return;
    void navigator.clipboard.writeText(fountainResult.fountain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="flex flex-col h-[calc(100vh-0px)] overflow-hidden">

        {/* Mode switcher */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-white/[0.05] shrink-0">
          <button
            onClick={() => setMode("chat")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2",
              mode === "chat"
                ? "text-violet-300 border-violet-500 bg-violet-500/5"
                : "text-white/30 border-transparent hover:text-white/50"
            )}>
            <MessageCircle className="w-3.5 h-3.5" />
            Conversation
          </button>
          <button
            onClick={() => setMode("fountain")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2",
              mode === "fountain"
                ? "text-violet-300 border-violet-500 bg-violet-500/5"
                : "text-white/30 border-transparent hover:text-white/50"
            )}>
            <Clapperboard className="w-3.5 h-3.5" />
            Scène Fountain
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "chat" ? (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-1 overflow-hidden">

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
                    <button onClick={() => setMode("fountain")}
                      className="flex items-center gap-2 text-xs text-violet-400/60 hover:text-violet-400 transition-colors">
                      <Clapperboard className="w-3.5 h-3.5" />
                      Ou générez une scène Fountain entre deux personnages
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
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
            </motion.div>
          ) : (
            /* Fountain Dialogue Mode */
            <motion.div key="fountain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-1 overflow-hidden bg-[#09090e]">

              {/* Left panel: config */}
              <div className="w-80 flex-shrink-0 border-r border-white/[0.05] overflow-y-auto p-5 space-y-5">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">Scène Fountain</h2>
                  <p className="text-[11px] text-white/25 leading-relaxed">
                    Générez une scène de dialogue construite depuis les profils psychologiques de deux personnages.
                  </p>
                </div>

                {/* Character 1 */}
                <div>
                  <p className="text-[10px] font-bold text-violet-400/70 uppercase tracking-wider mb-2">Personnage 1</p>
                  <div className="space-y-1">
                    {characters.map(c => (
                      <button key={c.id} onClick={() => setChar1(char1?.id === c.id ? null : c)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all text-xs",
                          char1?.id === c.id ? "bg-violet-600/20 border border-violet-500/30 text-violet-200" : "hover:bg-white/[0.04] border border-transparent text-white/50",
                          char2?.id === c.id && "opacity-30 pointer-events-none"
                        )}>
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif font-bold flex-shrink-0",
                          char1?.id === c.id ? "bg-violet-600/40 text-violet-200" : "bg-white/[0.07] text-white/40"
                        )}>
                          {c.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{c.name}</p>
                          <p className="text-[10px] text-white/25 truncate">{c.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Character 2 */}
                <div>
                  <p className="text-[10px] font-bold text-blue-400/70 uppercase tracking-wider mb-2">Personnage 2</p>
                  <div className="space-y-1">
                    {characters.map(c => (
                      <button key={c.id} onClick={() => setChar2(char2?.id === c.id ? null : c)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all text-xs",
                          char2?.id === c.id ? "bg-blue-600/20 border border-blue-500/30 text-blue-200" : "hover:bg-white/[0.04] border border-transparent text-white/50",
                          char1?.id === c.id && "opacity-30 pointer-events-none"
                        )}>
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif font-bold flex-shrink-0",
                          char2?.id === c.id ? "bg-blue-600/40 text-blue-200" : "bg-white/[0.07] text-white/40"
                        )}>
                          {c.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{c.name}</p>
                          <p className="text-[10px] text-white/25 truncate">{c.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scene inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1.5">
                      Contexte de la scène <span className="text-red-400">*</span>
                    </label>
                    <Textarea
                      value={sceneContext}
                      onChange={e => setSceneContext(e.target.value)}
                      placeholder="Où, quand, quelle situation dramatique les réunit dans cette scène…"
                      rows={3}
                      className="bg-white/[0.03] border-white/[0.08] text-xs text-white/70 placeholder:text-white/15 resize-none rounded-xl focus:border-violet-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1.5">Objectif émotionnel</label>
                    <input
                      value={emotionalObjective}
                      onChange={e => setEmotionalObjective(e.target.value)}
                      placeholder="Ce que cette scène doit accomplir émotionnellement…"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 placeholder:text-white/15 focus:outline-none focus:border-violet-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1.5">Type de conflit</label>
                    <input
                      value={conflictType}
                      onChange={e => setConflictType(e.target.value)}
                      placeholder="Ex: désir vs loyauté, vérité vs protection…"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 placeholder:text-white/15 focus:outline-none focus:border-violet-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1.5">Ton de la scène</label>
                    <input
                      value={toneFountain}
                      onChange={e => setToneFountain(e.target.value)}
                      placeholder="Ex: tendu, doux-amer, ironique, désespéré…"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 placeholder:text-white/15 focus:outline-none focus:border-violet-500/30"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => void generateFountain()}
                  disabled={!char1 || !char2 || !sceneContext.trim() || generatingFountain}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl h-10 text-xs font-semibold gap-2">
                  {generatingFountain ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Écriture en cours…</>
                  ) : (
                    <><Clapperboard className="w-4 h-4" /> Générer la scène</>
                  )}
                </Button>
              </div>

              {/* Right panel: result */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {generatingFountain ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center h-full gap-4 text-center">
                      <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                      </div>
                      <div>
                        <p className="text-white/50 text-sm font-medium">
                          Écriture de la scène entre {char1?.name} et {char2?.name}…
                        </p>
                        <p className="text-white/20 text-xs mt-1">Construction depuis les profils psychologiques</p>
                      </div>
                    </motion.div>
                  ) : fountainResult ? (
                    <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      {/* Heading + actions */}
                      <div className="flex items-center justify-between mb-4 gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-xs text-violet-300/80 bg-violet-500/5 px-3 py-1 rounded-lg border border-violet-500/15">
                            {fountainResult.heading}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                            <span className="w-4 h-4 rounded-full bg-violet-600/20 border border-violet-500/25 inline-flex items-center justify-center text-[9px] font-bold text-violet-300">
                              {char1?.name.charAt(0)}
                            </span>
                            {char1?.name}
                            <span className="text-white/15">×</span>
                            <span className="w-4 h-4 rounded-full bg-blue-600/20 border border-blue-500/25 inline-flex items-center justify-center text-[9px] font-bold text-blue-300">
                              {char2?.name.charAt(0)}
                            </span>
                            {char2?.name}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[11px] gap-1.5 text-white/30 hover:text-white/60"
                            onClick={() => void generateFountain()}>
                            <RefreshCw className="w-3 h-3" /> Réécrire
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[11px] gap-1.5 text-white/30 hover:text-white/60"
                            onClick={copyFountain}>
                            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            {copied ? "Copié" : "Copier"}
                          </Button>
                        </div>
                      </div>

                      {/* Fountain script */}
                      <pre className="font-mono text-sm text-white/80 bg-white/[0.02] rounded-xl p-6 whitespace-pre-wrap leading-relaxed border border-white/[0.06] mb-4">
                        {fountainResult.fountain}
                      </pre>

                      {/* Subtext + Note */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {fountainResult.subtext && (
                          <div className="px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/15">
                            <p className="text-[10px] font-bold text-violet-400/60 uppercase tracking-wider mb-1.5">Sous-texte</p>
                            <p className="text-xs text-white/55 leading-relaxed italic">{fountainResult.subtext}</p>
                          </div>
                        )}
                        {fountainResult.dramaticNote && (
                          <div className="px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                            <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-wider mb-1.5">Note du scénariste</p>
                            <p className="text-xs text-white/55 leading-relaxed">{fountainResult.dramaticNote}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full gap-4 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-violet-600/5 border border-violet-500/10 flex items-center justify-center">
                        <Clapperboard className="w-7 h-7 text-violet-400/30" />
                      </div>
                      <div>
                        <p className="text-white/30 text-sm font-medium mb-1">Aucune scène générée</p>
                        <p className="text-white/15 text-xs max-w-xs">
                          Sélectionnez deux personnages, décrivez le contexte de la scène, puis cliquez sur Générer.
                        </p>
                      </div>
                      {(!char1 || !char2) && (
                        <p className="text-violet-400/40 text-[11px]">
                          {!char1 && !char2 ? "← Choisissez deux personnages" : !char1 ? "← Choisissez le personnage 1" : "← Choisissez le personnage 2"}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
