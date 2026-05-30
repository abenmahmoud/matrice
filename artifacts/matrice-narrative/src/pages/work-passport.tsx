import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Download, Shield, ChevronLeft, Loader2,
  BookMarked, Globe, ShieldAlert, CheckCircle2, Circle, Lock, ExternalLink
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface WorkPassport {
  id: string;
  projectId: string;
  ownerUserId: string;
  officialTitle: string;
  workType: string;
  displayedAuthor: string;
  pseudonym: string;
  language: string;
  countryCulture: string;
  genre: string;
  targetAudience: string;
  status: string;
  logline: string;
  shortPitch: string;
  shortSynopsis: string;
  mainThemes: string[];
  artisticIntention: string;
  declaredOriginality: string;
  clichRisks: string[];
  version: number;
  sealedAt: string | null;
  contentHash: string | null;
  legalDisclaimer: string;
  proofMode: string;
  proofProvider: string;
  proofExternalReference: string;
  proofRegisteredAt: string | null;
  proofNotes: string;
  depositTargets: string[];
  depositChecklist: Record<string, boolean>;
  markdownContent: string;
  createdAt: string;
  updatedAt: string;
}

type ExportFormat = "epub" | "docx" | "kdp-pdf";

interface ExportJob {
  jobId: string;
  workPassportId: string;
  format: string;
  status: "pending" | "processing" | "completed" | "failed";
  progressPct: number;
  errorMessage?: string | null;
  downloadUrl?: string | null;
  fileSizeBytes?: number | null;
  createdAt?: string;
  completedAt?: string | null;
}

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */
const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  en_developpement: "En développement",
  pret_depot: "Prêt pour dépôt",
  depose: "Déposé",
  soumis: "Soumis",
  publie: "Publié",
};

const STATUS_COLORS: Record<string, string> = {
  brouillon: "bg-gray-500",
  en_developpement: "bg-blue-500",
  pret_depot: "bg-amber-500",
  depose: "bg-purple-500",
  soumis: "bg-orange-500",
  publie: "bg-green-500",
};

const TYPE_LABELS: Record<string, string> = {
  roman: "Roman", scenario: "Scénario", film: "Film", serie: "Série",
  "court-metrage": "Court-métrage", autre: "Autre",
};

const DEPOSIT_LINKS: Record<string, { label: string; url: string }> = {
  sgdl: { label: "SGDL", url: "https://www.sgdl.org" },
  inpi_esoleau: { label: "INPI e-Soleau", url: "https://www.inpi.fr" },
  sacd: { label: "SACD", url: "https://www.sacd.fr" },
  isbn_afnil: { label: "ISBN / AFNIL", url: "https://www.afnil.org" },
  cnc: { label: "CNC", url: "https://www.cnc.fr" },
  festival: { label: "Festivals", url: "https://www.festival-cannes.com/fr/" },
  producteur: { label: "Producteurs", url: "#" },
  diffuseur: { label: "Diffuseurs", url: "#" },
  isan_eidr: { label: "ISAN / EIDR", url: "https://www.isan.org" },
  autre: { label: "Autre", url: "#" },
};

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */
function authHeaders(): HeadersInit {
  const token = localStorage.getItem("matrice_user_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGet(projectId: string) {
  const res = await fetch(`${BASE}/api/projects/${projectId}/passport`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erreur chargement");
  return res.json() as Promise<{ passport: WorkPassport | null }>;
}

async function apiGenerate(projectId: string) {
  const res = await fetch(`${BASE}/api/projects/${projectId}/passport/generate`, {
    method: "POST", headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erreur generation");
  return res.json() as Promise<{ passport: WorkPassport }>;
}

async function apiUpdate(projectId: string, data: Partial<WorkPassport>) {
  const res = await fetch(`${BASE}/api/projects/${projectId}/passport`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur mise a jour");
  return res.json() as Promise<{ passport: WorkPassport }>;
}

async function apiSeal(projectId: string) {
  const res = await fetch(`${BASE}/api/projects/${projectId}/passport/seal`, {
    method: "POST", headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erreur scellement");
  return res.json() as Promise<{ passport: WorkPassport }>;
}

async function apiExportHistory() {
  const res = await fetch(`${BASE}/api/exports/list`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erreur chargement exports");
  return res.json() as Promise<{ jobs: ExportJob[] }>;
}

async function apiStartExport(projectId: string, format: ExportFormat) {
  const res = await fetch(`${BASE}/api/projects/${projectId}/passport/export/${format}`, {
    method: "POST",
    headers: authHeaders(),
  });
  const body = await res.json().catch(() => ({})) as { jobId?: string; status?: string; error?: string; needed?: number; balance?: number };
  if (res.status === 402 && body.error === "INSUFFICIENT_CREDITS") {
    window.dispatchEvent(new CustomEvent("matrice:insufficient-credits", { detail: body }));
  }
  if (!res.ok || !body.jobId) throw new Error(body.error || "Export impossible");
  return body as { jobId: string; status: string };
}

async function apiExportJob(jobId: string) {
  const res = await fetch(`${BASE}/api/exports/${jobId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Export introuvable");
  return res.json() as Promise<ExportJob>;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function WorkPassportPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<WorkPassport>>({});

  const { data, isLoading } = useQuery({ queryKey: ["work-passport", projectId], queryFn: () => apiGet(projectId) });
  const passport = data?.passport;

  const genMut = useMutation({
    mutationFn: () => apiGenerate(projectId),
    onSuccess: (d) => { queryClient.setQueryData(["work-passport", projectId], d); toast({ title: "Passeport genere" }); },
    onError: () => toast({ title: "Erreur", description: "Generation echouee", variant: "destructive" }),
  });

  const updMut = useMutation({
    mutationFn: (vals: Partial<WorkPassport>) => apiUpdate(projectId, vals),
    onSuccess: (d) => { queryClient.setQueryData(["work-passport", projectId], d); setEditing(false); toast({ title: "Mis a jour" }); },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  const sealMut = useMutation({
    mutationFn: () => apiSeal(projectId),
    onSuccess: (d) => { queryClient.setQueryData(["work-passport", projectId], d); toast({ title: "Passeport scelle" }); },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  /* --------------------------- Empty state -------------------------- */
  if (!passport) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-8">
          <Link href={`${BASE}/projects/${projectId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-1" /> Retour au projet
            </Button>
          </Link>
          <Card>
            <CardContent className="p-12 text-center">
              <BookMarked className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Passeport d'Œuvre</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Documente l&apos;identite, l&apos;ADN narratif et la tracabilite de votre creation.
              </p>
              <Button size="lg" onClick={() => genMut.mutate()} disabled={genMut.isPending}>
                {genMut.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookMarked className="h-4 w-4 mr-2" />}
                Generer le Passeport
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                <ShieldAlert className="h-3 w-3 inline mr-1" />
                Ce document ne remplace pas un depot officiel.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  /* --------------------------- Full view ---------------------------- */
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href={`${BASE}/projects/${projectId}`}>
              <Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4 mr-1" /> Retour</Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{passport.officialTitle || "Passeport d'Œuvre"}</h1>
              <p className="text-sm text-muted-foreground">
                Version {passport.version}
                {passport.sealedAt && <span className="ml-2 text-green-600 inline-flex items-center"><Shield className="h-3 w-3 mr-1" /> Scelle</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => downloadMd(passport)}><Download className="h-4 w-4 mr-1" /> Markdown</Button>
            <Button variant="outline" size="sm" onClick={() => downloadJson(passport)}><Download className="h-4 w-4 mr-1" /> JSON</Button>
            <Button variant="outline" size="sm" onClick={() => { setForm({ officialTitle: passport.officialTitle, pseudonym: passport.pseudonym, language: passport.language, countryCulture: passport.countryCulture, genre: passport.genre, targetAudience: passport.targetAudience, status: passport.status, logline: passport.logline, shortPitch: passport.shortPitch, shortSynopsis: passport.shortSynopsis, artisticIntention: passport.artisticIntention, declaredOriginality: passport.declaredOriginality }); setEditing(true); }}><FileText className="h-4 w-4 mr-1" /> Modifier</Button>
            <Button size="sm" onClick={() => sealMut.mutate()} disabled={sealMut.isPending || !!passport.sealedAt}>{sealMut.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Shield className="h-4 w-4 mr-1" />} Sceller</Button>
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="mb-6 border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 text-sm text-amber-800 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{passport.legalDisclaimer}</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="identite" className="space-y-6">
          <TabsList>
            <TabsTrigger value="identite">Identite</TabsTrigger>
            <TabsTrigger value="adn">ADN narratif</TabsTrigger>
            <TabsTrigger value="depot">Depot</TabsTrigger>
            <TabsTrigger value="trace">Tracabilite</TabsTrigger>
          </TabsList>

          <TabsContent value="identite">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BookMarked className="h-5 w-5" /> Identite de l&apos;oeuvre</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <F label="Titre officiel" v={passport.officialTitle} />
                  <F label="Type"><Badge variant="outline">{TYPE_LABELS[passport.workType] || passport.workType}</Badge></F>
                  <F label="Auteur" v={passport.displayedAuthor} />
                  <F label="Pseudonyme" v={passport.pseudonym} />
                  <F label="Langue" v={passport.language} />
                  <F label="Pays / Culture" v={passport.countryCulture} />
                  <F label="Genre" v={passport.genre} />
                  <F label="Public cible" v={passport.targetAudience} />
                  <F label="Statut"><Badge className={STATUS_COLORS[passport.status] || "bg-gray-500"}>{STATUS_LABELS[passport.status] || passport.status}</Badge></F>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adn">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> ADN narratif</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <TF label="Logline" v={passport.logline} />
                <TF label="Pitch court" v={passport.shortPitch} />
                <TF label="Synopsis court" v={passport.shortSynopsis} />
                <LF label="Themes principaux" items={passport.mainThemes} />
                <TF label="Intention artistique" v={passport.artisticIntention} />
                <TF label="Originalite declaree" v={passport.declaredOriginality} />
                <LF label="Risques de cliches" items={passport.clichRisks} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="depot">
            <Card className="mb-6">
              <CardHeader><CardTitle className="flex items-center gap-2"><ExternalLink className="h-5 w-5" /> Depots recommandes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {passport.depositTargets.map((t) => {
                    const info = DEPOSIT_LINKS[t] || { label: t, url: "#" };
                    return (
                      <div key={t} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <span className="font-medium">{info.label}</span>
                        <a href={info.url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button></a>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Checklist</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(passport.depositChecklist).map(([key, checked]) => (
                    <div key={key} className="flex items-center gap-3">
                      {checked ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                      <span className={checked ? "line-through text-muted-foreground" : ""}>{key}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trace">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Tracabilite</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <F label="Version" v={`${passport.version}`} />
                  <F label="Cree le" v={new Date(passport.createdAt).toLocaleDateString("fr-FR")} />
                  <F label="Mis a jour" v={new Date(passport.updatedAt).toLocaleDateString("fr-FR")} />
                  <F label="Scelle le" v={passport.sealedAt ? new Date(passport.sealedAt).toLocaleDateString("fr-FR") : "Non scelle"} />
                </div>
                {passport.contentHash && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Empreinte SHA-256</p>
                    <p className="text-xs font-mono break-all">{passport.contentHash}</p>
                  </div>
                )}
                <div className="mt-4 rounded-lg border border-border/50 bg-card/40 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-semibold">Preuve d'antériorité</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <F label="Mode" v={passport.proofMode || "internal_hash"} />
                    <F label="Fournisseur" v={passport.proofProvider || "Matrice Narrative"} />
                    <F label="Référence externe" v={passport.proofExternalReference || "Non définie"} />
                    <F label="Enregistré le" v={passport.proofRegisteredAt ? new Date(passport.proofRegisteredAt).toLocaleDateString("fr-FR") : "Non enregistré"} />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{passport.proofNotes}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <ExportSection projectId={projectId} workPassportId={passport.id} sealed={Boolean(passport.sealedAt)} />
        </div>

        {/* Edit overlay */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <CardHeader><CardTitle>Modifier le Passeport</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { k: "officialTitle", l: "Titre officiel" },
                  { k: "pseudonym", l: "Pseudonyme" },
                  { k: "language", l: "Langue" },
                  { k: "countryCulture", l: "Pays / Culture" },
                  { k: "genre", l: "Genre" },
                  { k: "targetAudience", l: "Public cible" },
                ].map((f) => (
                  <div key={f.k}>
                    <label className="text-sm font-medium">{f.l}</label>
                    <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={(form as Record<string, string>)[f.k] || ""} onChange={(e) => setForm((p) => ({ ...p, [f.k]: e.target.value }))} />
                  </div>
                ))}
                {[
                  { k: "logline", l: "Logline" },
                  { k: "shortPitch", l: "Pitch court" },
                  { k: "shortSynopsis", l: "Synopsis court" },
                  { k: "artisticIntention", l: "Intention artistique" },
                  { k: "declaredOriginality", l: "Originalite declaree" },
                ].map((f) => (
                  <div key={f.k}>
                    <label className="text-sm font-medium">{f.l}</label>
                    <textarea className="w-full mt-1 px-3 py-2 border rounded-md text-sm min-h-[60px]" value={(form as Record<string, string>)[f.k] || ""} onChange={(e) => setForm((p) => ({ ...p, [f.k]: e.target.value }))} />
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
                  <Button onClick={() => updMut.mutate(form)} disabled={updMut.isPending}>
                    {updMut.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ExportSection({ projectId, workPassportId, sealed }: { projectId: string; workPassportId: string; sealed: boolean }) {
  const { toast } = useToast();
  const [activeJobs, setActiveJobs] = useState<Record<string, ExportJob>>({});
  const [history, setHistory] = useState<ExportJob[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const pollingIntervals = useRef<Record<string, number>>({});

  useEffect(() => {
    void loadHistory();
  }, [workPassportId]);

  useEffect(() => {
    return () => {
      Object.values(pollingIntervals.current).forEach((interval) => window.clearInterval(interval));
      pollingIntervals.current = {};
    };
  }, []);

  async function loadHistory() {
    try {
      setLoadingHistory(true);
      const data = await apiExportHistory();
      setHistory(data.jobs.filter((job) => job.workPassportId === workPassportId).slice(0, 5));
    } catch {
      toast({ title: "Exports indisponibles", description: "Impossible de charger l'historique.", variant: "destructive" });
    } finally {
      setLoadingHistory(false);
    }
  }

  async function startExport(format: ExportFormat) {
    try {
      const { jobId } = await apiStartExport(projectId, format);
      setActiveJobs((current) => ({
        ...current,
        [jobId]: { jobId, workPassportId, format, status: "processing", progressPct: 0 },
      }));
      toast({ title: "Export lance", description: "La generation commence en arriere-plan." });
      pollJob(jobId);
    } catch (err) {
      toast({
        title: "Export impossible",
        description: err instanceof Error ? err.message : "Une erreur est survenue.",
        variant: "destructive",
      });
    }
  }

  function pollJob(jobId: string) {
    const existing = pollingIntervals.current[jobId];
    if (existing) window.clearInterval(existing);

    const interval = window.setInterval(async () => {
      try {
        const job = await apiExportJob(jobId);
        setActiveJobs((current) => ({ ...current, [jobId]: job }));

        if (job.status === "completed" || job.status === "failed") {
          window.clearInterval(interval);
          delete pollingIntervals.current[jobId];
          if (job.status === "completed") {
            toast({ title: "Export pret", description: "Le fichier est disponible au telechargement pendant 1 heure." });
            await loadHistory();
          } else {
            toast({
              title: "Export echoue",
              description: job.errorMessage || "La generation n'a pas pu aboutir.",
              variant: "destructive",
            });
          }
        }
      } catch {
        window.clearInterval(interval);
        delete pollingIntervals.current[jobId];
      }
    }, 3000);

    pollingIntervals.current[jobId] = interval;
  }

  const runningJobs = Object.values(activeJobs).filter((job) => job.status !== "completed" && job.status !== "failed");

  if (!sealed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Exporter cette oeuvre</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vous devez d'abord verrouiller votre oeuvre pour generer les formats de publication.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Exporter cette oeuvre</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <ExportButton
            title="EPUB3"
            subtitle="Kindle, Apple, Kobo"
            disabled={hasRunningFormat(runningJobs, "epub")}
            onClick={() => startExport("epub")}
          />
          <ExportButton
            title="DOCX manuscrit"
            subtitle="Format editeur FR"
            disabled={hasRunningFormat(runningJobs, "docx")}
            onClick={() => startExport("docx")}
          />
          <ExportButton
            title="PDF KDP"
            subtitle="Amazon broche 6x9"
            disabled={hasRunningFormat(runningJobs, "kdp-pdf")}
            onClick={() => startExport("kdp-pdf")}
          />
        </div>

        {runningJobs.length > 0 && (
          <div className="space-y-3">
            {runningJobs.map((job) => (
              <div key={job.jobId} className="rounded-lg border bg-muted/40 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{formatExportLabel(job.format)} - {formatExportStatus(job.status)}</span>
                  <span>{job.progressPct ?? 0}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-background">
                  <div className="h-full bg-primary transition-all" style={{ width: `${job.progressPct ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium">Historique recent</h4>
            <Button variant="ghost" size="sm" onClick={() => loadHistory()} disabled={loadingHistory}>
              {loadingHistory ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              Actualiser
            </Button>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun export recent pour cette oeuvre.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((job) => (
                <li key={job.jobId} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                  <span>
                    {formatExportLabel(job.format)} - {job.createdAt ? new Date(job.createdAt).toLocaleString("fr-FR") : "date inconnue"}
                  </span>
                  {job.downloadUrl ? (
                    <a href={`${BASE}${job.downloadUrl}`} download className="text-primary hover:underline">
                      Telecharger {job.fileSizeBytes ? `(${Math.round(job.fileSizeBytes / 1024)} Ko)` : ""}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{formatExportStatus(job.status)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ExportButton({ title, subtitle, disabled, onClick }: { title: string; subtitle: string; disabled: boolean; onClick: () => void }) {
  return (
    <Button variant="outline" className="h-auto flex-col items-start gap-1 px-4 py-3 text-left" disabled={disabled} onClick={onClick}>
      <span className="font-semibold">{title}</span>
      <span className="text-xs font-normal text-muted-foreground">{subtitle}</span>
    </Button>
  );
}

function hasRunningFormat(jobs: ExportJob[], format: ExportFormat): boolean {
  return jobs.some((job) => job.format === format || apiFormatToButtonFormat(job.format) === format);
}

function apiFormatToButtonFormat(format: string): ExportFormat | null {
  if (format === "epub3") return "epub";
  if (format === "docx_manuscript") return "docx";
  if (format === "pdf_kdp") return "kdp-pdf";
  return null;
}

function formatExportLabel(format: string): string {
  if (format === "epub" || format === "epub3") return "EPUB3";
  if (format === "docx" || format === "docx_manuscript") return "DOCX manuscrit";
  if (format === "kdp-pdf" || format === "pdf_kdp") return "PDF KDP";
  return format;
}

function formatExportStatus(status: string): string {
  if (status === "pending") return "En attente";
  if (status === "processing") return "Generation en cours";
  if (status === "completed") return "Pret";
  if (status === "failed") return "Echec";
  return status;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function downloadMd(p: WorkPassport) {
  const md = generateMd(p);
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `passeport-${p.officialTitle || p.projectId}.md`; a.click();
  URL.revokeObjectURL(url);
}

function downloadJson(p: WorkPassport) {
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `passeport-${p.officialTitle || p.projectId}.json`; a.click();
  URL.revokeObjectURL(url);
}

function generateMd(p: WorkPassport): string {
  const now = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  return `# Passeport d'Œuvre - ${p.officialTitle || "Sans titre"}

> Document genere le ${now} via Matrice Narrative
>
> ${p.legalDisclaimer}

---

## 1. Identite

| Champ | Valeur |
|-------|--------|
| Titre | ${p.officialTitle || "_"} |
| Type | ${p.workType || "_"} |
| Auteur | ${p.displayedAuthor || "_"} |
| Langue | ${p.language || "_"} |
| Genre | ${p.genre || "_"} |
| Statut | ${p.status || "_"} |

## 2. ADN narratif

**Logline:** ${p.logline || "_"}

**Pitch:** ${p.shortPitch || "_"}

**Synopsis:** ${p.shortSynopsis || "_"}

**Themes:** ${(p.mainThemes ?? []).join(", ") || "_"}

## 3. Tracabilite

Version: ${p.version} | Hash: ${p.contentHash || "_"}

## 3.b Preuve d'anteriorite

- Mode : ${p.proofMode || "internal_hash"}
- Fournisseur : ${p.proofProvider || "Matrice Narrative"}
- Reference externe : ${p.proofExternalReference || "_"}
- Enregistre le : ${p.proofRegisteredAt ? new Date(p.proofRegisteredAt).toLocaleDateString("fr-FR") : "_"}

${p.proofNotes || "Preuve interne par empreinte. Depot officiel recommande."}

---
*Passeport d'Œuvre - Matrice Narrative*
`;
}

function F({ label, v, children }: { label: string; v?: string; children?: React.ReactNode }) {
  return <div><p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>{children ?? <p className="text-sm font-medium mt-0.5">{v || "_"}</p>}</div>;
}

function TF({ label, v }: { label: string; v: string }) {
  if (!v) return null;
  return <div><p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p><p className="text-sm leading-relaxed">{v}</p></div>;
}

function LF({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null;
  return <div><p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{label}</p><div className="flex flex-wrap gap-2">{items.map((i) => <Badge key={i} variant="secondary">{i}</Badge>)}</div></div>;
}
