import type { ChangeEvent } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { CheckCircle2, FileAudio, Mic2, Server, ShieldCheck, Trash2, TriangleAlert, Wand2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminButton } from "@/components/admin/AdminBits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiFetch";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Sample = { id: string; displayName: string; originalFilename?: string | null; mimeType: string; sizeBytes: number; createdAt: string };
type Job = { id: string; scope: string; status: string; engine: string; outputPath?: string | null; costCredits: number; createdAt: string };

const ENGINES = [
  { name: "Chatterbox Multilingual", license: "MIT a verifier", fit: "Voix clonee 5s, FR natif, watermarking", status: "moteur cible self-host" },
  { name: "Mock engine", license: "interne", fit: "Genere un artefact texte audio sans cout quand Chatterbox est absent", status: "actif par defaut" },
  { name: "OpenVoice v2", license: "MIT", fit: "Fallback zero-shot si Chatterbox ne convient pas", status: "reserve" },
];

export default function VoiceLabPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sampleForm, setSampleForm] = useState({ display_name: "Voix auteur", consent_text: "", consent_accepted: false, audio_base64: "", filename: "", mime_type: "" });
  const [jobForm, setJobForm] = useState({ voice_sample_id: "", scope: "excerpt", input_text: "" });

  const statusQuery = useQuery({
    queryKey: ["voice-lab-status"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/voice-lab/status`);
      if (!response.ok) throw new Error("Voice Lab indisponible");
      return response.json() as Promise<{ engine: string; generation_enabled: boolean; license_notice: string; safeguards: string[] }>;
    },
  });
  const samplesQuery = useQuery({
    queryKey: ["voice-samples"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/voice-lab/samples`);
      if (!response.ok) throw new Error("Samples indisponibles");
      return response.json() as Promise<{ samples: Sample[] }>;
    },
  });
  const jobsQuery = useQuery({
    queryKey: ["audio-jobs"],
    queryFn: async () => {
      const response = await apiFetch(`${BASE}/api/voice-lab/jobs`);
      if (!response.ok) throw new Error("Jobs indisponibles");
      return response.json() as Promise<{ jobs: Job[] }>;
    },
  });

  const uploadSample = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/voice-lab/samples`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sampleForm),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((payload as { error?: string }).error ?? "Upload impossible");
      return payload;
    },
    onSuccess: () => {
      setSampleForm({ display_name: "Voix auteur", consent_text: "", consent_accepted: false, audio_base64: "", filename: "", mime_type: "" });
      toast({ title: "Sample voix ajoute" });
      queryClient.invalidateQueries({ queryKey: ["voice-samples"] });
    },
    onError: (err) => toast({ title: "Sample refuse", description: err instanceof Error ? err.message : undefined, variant: "destructive" }),
  });

  const deleteSample = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`${BASE}/api/voice-lab/samples/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Suppression impossible");
    },
    onSuccess: () => {
      toast({ title: "Sample supprime" });
      queryClient.invalidateQueries({ queryKey: ["voice-samples"] });
    },
  });

  const createJob = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`${BASE}/api/voice-lab/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobForm),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((payload as { error?: string }).error ?? "Generation impossible");
      return payload;
    },
    onSuccess: () => {
      toast({ title: "Job audio cree", description: "Mock automatique si Chatterbox est absent." });
      queryClient.invalidateQueries({ queryKey: ["audio-jobs"] });
    },
    onError: (err) => toast({ title: "Job refuse", description: err instanceof Error ? err.message : undefined, variant: "destructive" }),
  });

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setSampleForm((current) => ({ ...current, audio_base64: base64, filename: file.name, mime_type: file.type || "audio/wav" }));
  }

  const samples = samplesQuery.data?.samples ?? [];
  const jobs = jobsQuery.data?.jobs ?? [];

  return (
    <AppLayout>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-matrice-sable bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-essuf-or px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-matrice-encre">
            <Mic2 className="h-4 w-4" />
            Voice Lab gratuit
          </div>
          <h1 className="mt-4 font-serif text-4xl text-matrice-encre">Laboratoire voix auteur</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-matrice-encre/70">
            Consentement, sample voix, jobs audio et suppression RGPD. Chatterbox reste self-host separe ; si le moteur est absent, Matrice genere un mock sans cout.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/creator-lab"><AdminButton variant="secondary">Retour Creator Lab</AdminButton></Link>
            <Link href="/creator-lab/system"><AdminButton variant="secondary"><Server className="h-4 w-4" /> Verifier infra</AdminButton></Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {ENGINES.map((engine) => (
            <article key={engine.name} className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-matrice-or-fonce">{engine.license}</p>
              <h2 className="mt-3 font-serif text-2xl text-matrice-encre">{engine.name}</h2>
              <p className="mt-2 text-sm leading-6 text-matrice-encre/70">{engine.fit}</p>
              <span className="mt-4 inline-flex rounded-full bg-matrice-sable px-2.5 py-1 text-xs font-semibold text-matrice-encre">{engine.status}</span>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-matrice-success" />
            <h2 className="mt-3 font-serif text-2xl text-matrice-encre">Garde-fous</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-matrice-encre/72">
              {(statusQuery.data?.safeguards ?? ["consentement explicite", "watermark", "pas de clonage de voix tierce", "suppression sample RGPD"]).map((item) => (
                <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-matrice-success" /> {item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-matrice-warning/30 bg-matrice-warning/10 p-5 shadow-sm">
            <TriangleAlert className="h-5 w-5 text-matrice-or-fonce" />
            <h2 className="mt-3 font-serif text-2xl text-matrice-encre">Statut moteur</h2>
            <p className="mt-3 text-sm leading-6 text-matrice-encre/72">
              Moteur actif : <strong>{statusQuery.data?.engine ?? "..."}</strong>. Generation reelle : {statusQuery.data?.generation_enabled ? "activee" : "desactivee"}.
            </p>
            <p className="mt-2 text-xs leading-5 text-matrice-encre/60">{statusQuery.data?.license_notice}</p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); uploadSample.mutate(); }}>
            <h2 className="font-serif text-2xl text-matrice-encre">Uploader un sample</h2>
            <div className="mt-4 grid gap-4">
              <Input value={sampleForm.display_name} onChange={(event) => setSampleForm((current) => ({ ...current, display_name: event.target.value }))} placeholder="Nom du sample" />
              <Input type="file" accept="audio/*" onChange={(event) => void onFile(event)} />
              <Textarea value={sampleForm.consent_text} onChange={(event) => setSampleForm((current) => ({ ...current, consent_text: event.target.value }))} rows={4} placeholder="Je confirme etre proprietaire de cette voix et autoriser Matrice a l'utiliser pour generer mon livre audio." />
              <label className="flex gap-2 text-sm text-matrice-encre/70">
                <input type="checkbox" checked={sampleForm.consent_accepted} onChange={(event) => setSampleForm((current) => ({ ...current, consent_accepted: event.target.checked }))} />
                Je confirme que ce sample est ma voix ou une voix pour laquelle j'ai un droit explicite.
              </label>
            </div>
            <Button disabled={!sampleForm.audio_base64 || !sampleForm.consent_accepted || uploadSample.isPending} className="mt-5 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
              <FileAudio className="h-4 w-4" />
              Ajouter le sample
            </Button>
          </form>

          <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
            <h2 className="font-serif text-2xl text-matrice-encre">Samples actifs</h2>
            <div className="mt-4 grid gap-3">
              {samples.length ? samples.map((sample) => (
                <div key={sample.id} className="flex items-center justify-between gap-3 rounded-xl border border-matrice-sable p-3">
                  <div>
                    <p className="font-medium text-matrice-encre">{sample.displayName}</p>
                    <p className="text-xs text-matrice-encre/55">{sample.originalFilename ?? sample.mimeType} · {Math.round(sample.sizeBytes / 1024)} Ko</p>
                  </div>
                  <button type="button" onClick={() => deleteSample.mutate(sample.id)} className="rounded-lg p-2 text-matrice-error hover:bg-matrice-error/10" aria-label="Supprimer le sample">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )) : <p className="text-sm text-matrice-encre/55">Aucun sample pour l'instant.</p>}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); createJob.mutate(); }}>
            <h2 className="font-serif text-2xl text-matrice-encre">Creer un job audio</h2>
            <div className="mt-4 grid gap-4">
              <select className="min-h-[44px] rounded-md border border-matrice-sable bg-white px-3 text-sm" value={jobForm.voice_sample_id} onChange={(event) => setJobForm((current) => ({ ...current, voice_sample_id: event.target.value }))}>
                <option value="">Voix standard / mock</option>
                {samples.map((sample) => <option key={sample.id} value={sample.id}>{sample.displayName}</option>)}
              </select>
              <select className="min-h-[44px] rounded-md border border-matrice-sable bg-white px-3 text-sm" value={jobForm.scope} onChange={(event) => setJobForm((current) => ({ ...current, scope: event.target.value }))}>
                <option value="excerpt">Extrait court</option>
                <option value="chapter">Chapitre</option>
                <option value="book">Livre complet</option>
              </select>
              <Textarea value={jobForm.input_text} onChange={(event) => setJobForm((current) => ({ ...current, input_text: event.target.value }))} rows={6} placeholder="Texte a convertir en audio..." />
            </div>
            <Button disabled={jobForm.input_text.trim().length < 10 || createJob.isPending} className="mt-5 rounded-xl bg-matrice-encre text-matrice-ivoire hover:bg-matrice-bleu-nuit">
              <Wand2 className="h-4 w-4" />
              Generer
            </Button>
          </form>

          <div className="rounded-2xl border border-matrice-sable bg-white p-5 shadow-sm">
            <h2 className="font-serif text-2xl text-matrice-encre">Jobs audio</h2>
            <div className="mt-4 grid gap-3">
              {jobs.length ? jobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-matrice-sable p-3">
                  <p className="font-medium text-matrice-encre">{job.scope} · {job.status}</p>
                  <p className="mt-1 text-xs text-matrice-encre/55">Moteur {job.engine} · cout {job.costCredits} credits · {new Date(job.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
              )) : <p className="text-sm text-matrice-encre/55">Aucun job audio.</p>}
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture fichier impossible"));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",")[1] ?? "" : result);
    };
    reader.readAsDataURL(file);
  });
}
