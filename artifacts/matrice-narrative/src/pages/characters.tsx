import { useState } from "react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListCharacters, useCreateCharacter, useUpdateCharacter, useDeleteCharacter,
  useGenerateCharacters, getListCharactersQueryKey
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Sparkles, Trash2, Edit2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type CharFormData = {
  name: string; role: string; nature: string; externalObjective: string;
  innerNeed: string; wound: string; fear: string; secret: string;
  contradiction: string; transformationArc: string; visualIdentity: string;
  voiceStyle: string; linkToConflict: string;
};

const emptyChar: CharFormData = {
  name: "", role: "", nature: "humain", externalObjective: "", innerNeed: "",
  wound: "", fear: "", secret: "", contradiction: "", transformationArc: "",
  visualIdentity: "", voiceStyle: "", linkToConflict: ""
};

export default function CharactersPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editChar, setEditChar] = useState<(CharFormData & { id?: string }) | null>(null);
  const [form, setForm] = useState<CharFormData>(emptyChar);

  const { data: characters, isLoading } = useListCharacters(id!, {
    query: { enabled: !!id, queryKey: getListCharactersQueryKey(id!) }
  });
  const generate = useGenerateCharacters();
  const createChar = useCreateCharacter();
  const updateChar = useUpdateCharacter();
  const deleteChar = useDeleteCharacter();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListCharactersQueryKey(id!) });

  const handleGenerate = () => {
    generate.mutate({ id: id! }, {
      onSuccess: () => { invalidate(); toast({ title: "Personnages générés" }); },
      onError: () => toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer les personnages." })
    });
  };

  const openCreate = () => { setEditChar(null); setForm(emptyChar); setOpen(true); };
  const openEdit = (c: { id: string; name: string; role: string; nature?: string | null; externalObjective?: string | null; innerNeed?: string | null; wound?: string | null; fear?: string | null; secret?: string | null; contradiction?: string | null; transformationArc?: string | null; visualIdentity?: string | null; voiceStyle?: string | null; linkToConflict?: string | null }) => {
    setEditChar({ ...c, id: c.id, nature: c.nature ?? "humain", externalObjective: c.externalObjective ?? "", innerNeed: c.innerNeed ?? "", wound: c.wound ?? "", fear: c.fear ?? "", secret: c.secret ?? "", contradiction: c.contradiction ?? "", transformationArc: c.transformationArc ?? "", visualIdentity: c.visualIdentity ?? "", voiceStyle: c.voiceStyle ?? "", linkToConflict: c.linkToConflict ?? "" });
    setForm({ name: c.name, role: c.role, nature: c.nature ?? "humain", externalObjective: c.externalObjective ?? "", innerNeed: c.innerNeed ?? "", wound: c.wound ?? "", fear: c.fear ?? "", secret: c.secret ?? "", contradiction: c.contradiction ?? "", transformationArc: c.transformationArc ?? "", visualIdentity: c.visualIdentity ?? "", voiceStyle: c.voiceStyle ?? "", linkToConflict: c.linkToConflict ?? "" });
    setOpen(true);
  };

  const handleSave = () => {
    if (editChar?.id) {
      updateChar.mutate({ id: id!, charId: editChar.id, data: form as Parameters<typeof updateChar.mutate>[0]["data"] }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Personnage mis à jour" }); }
      });
    } else {
      createChar.mutate({ id: id!, data: form as Parameters<typeof createChar.mutate>[0]["data"] }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Personnage créé" }); }
      });
    }
  };

  const handleDelete = (charId: string) => {
    deleteChar.mutate({ id: id!, charId }, {
      onSuccess: () => { invalidate(); toast({ title: "Personnage supprimé" }); }
    });
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Personnages</h1>
            <p className="text-muted-foreground mt-1">Les acteurs de votre univers narratif</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleGenerate} disabled={generate.isPending}>
              {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Générer depuis la Matrice
            </Button>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Créer un personnage</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : characters?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun personnage</h3>
            <p className="text-muted-foreground mb-6">Générez vos personnages depuis la Matrice ou créez-en manuellement.</p>
            <Button onClick={handleGenerate} disabled={generate.isPending}>
              {generate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Générer les personnages
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {characters?.map((char, i) => (
              <motion.div key={char.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full flex flex-col hover:bg-card/70 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-serif">{char.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{char.role}</span>
                          {char.nature && <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{char.nature}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => openEdit(char)}><Edit2 className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(char.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    {char.externalObjective && <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Objectif externe</p><p className="text-sm text-foreground/80 line-clamp-2">{char.externalObjective}</p></div>}
                    {char.wound && <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Blessure</p><p className="text-sm text-foreground/80 line-clamp-2">{char.wound}</p></div>}
                    {char.fear && <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Peur</p><p className="text-sm text-foreground/80 line-clamp-1">{char.fear}</p></div>}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editChar?.id ? "Modifier le personnage" : "Nouveau personnage"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {([
              { key: "name", label: "Nom", col: 1 }, { key: "role", label: "Rôle", col: 1 },
            ] as const).map(({ key, label }) => (
              <div key={key}><Label>{label}</Label><Input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></div>
            ))}
            <div><Label>Nature</Label>
              <Select value={form.nature} onValueChange={v => setForm(f => ({ ...f, nature: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["humain", "mémoire", "force", "voix", "double", "ombre", "entité", "inconnu"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {(["externalObjective", "innerNeed", "wound", "fear", "secret", "contradiction", "transformationArc", "visualIdentity", "voiceStyle", "linkToConflict"] as const).map((key) => {
              const labels: Record<string, string> = { externalObjective: "Objectif externe", innerNeed: "Besoin intérieur", wound: "Blessure", fear: "Peur", secret: "Secret", contradiction: "Contradiction", transformationArc: "Arc de transformation", visualIdentity: "Identité visuelle", voiceStyle: "Style de voix", linkToConflict: "Lien avec le conflit" };
              return (
                <div key={key} className="col-span-2">
                  <Label>{labels[key]}</Label>
                  <Textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="h-16" />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={createChar.isPending || updateChar.isPending}>
              {(createChar.isPending || updateChar.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
