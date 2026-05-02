import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useCreateProject, useGenerateMatrix } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(2, "Le titre doit faire au moins 2 caractères"),
  rawIdea: z.string().min(10, "Décrivez votre idée en quelques phrases"),
  targetFormat: z.string().min(1, "Format requis"),
  genre: z.string().min(1, "Genre requis"),
  tone: z.string().min(1, "Ton requis"),
});

export default function NewProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const createProject = useCreateProject();
  const generateMatrix = useGenerateMatrix();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      rawIdea: "",
      targetFormat: "Roman",
      genre: "Science-Fiction",
      tone: "Sombre",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const project = await createProject.mutateAsync({
        data: values,
      });

      // Try to generate matrix automatically
      try {
        await generateMatrix.mutateAsync({ id: project.id });
        toast({
          title: "Projet créé avec succès",
          description: "La matrice narrative a été générée.",
        });
      } catch (e) {
        toast({
          title: "Projet créé",
          description: "Le projet a été créé mais la génération de la matrice a échoué. Vous pourrez réessayer plus tard.",
        });
      }

      setLocation(`/projects/${project.id}/matrix`);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le projet.",
      });
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">Créer un univers</h1>
          <p className="text-muted-foreground mt-1">Posez les fondations de votre prochaine histoire.</p>
        </div>

        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Informations principales</CardTitle>
            <CardDescription>
              Ces informations serviront de base à l'intelligence artificielle pour générer votre Matrice Narrative.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de travail</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Chroniques de l'Aube" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rawIdea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idée brute</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Racontez votre idée en quelques phrases. L'IA s'en servira pour extrapoler l'univers." 
                          className="h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="targetFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format cible</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Roman">Roman</SelectItem>
                            <SelectItem value="Scénario de film">Scénario de film</SelectItem>
                            <SelectItem value="Série TV">Série TV</SelectItem>
                            <SelectItem value="Jeu Vidéo">Jeu Vidéo</SelectItem>
                            <SelectItem value="Bande Dessinée">Bande Dessinée</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre principal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Science-Fiction">Science-Fiction</SelectItem>
                            <SelectItem value="Fantasy">Fantasy</SelectItem>
                            <SelectItem value="Thriller">Thriller</SelectItem>
                            <SelectItem value="Horreur">Horreur</SelectItem>
                            <SelectItem value="Drame">Drame</SelectItem>
                            <SelectItem value="Romance">Romance</SelectItem>
                            <SelectItem value="Historique">Historique</SelectItem>
                            <SelectItem value="Cyberpunk">Cyberpunk</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ton</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sombre">Sombre</SelectItem>
                            <SelectItem value="Épique">Épique</SelectItem>
                            <SelectItem value="Mélancolique">Mélancolique</SelectItem>
                            <SelectItem value="Humoristique">Humoristique</SelectItem>
                            <SelectItem value="Cynique">Cynique</SelectItem>
                            <SelectItem value="Onirique">Onirique</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createProject.isPending || generateMatrix.isPending}>
                    {(createProject.isPending || generateMatrix.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {(createProject.isPending || generateMatrix.isPending) ? "Création en cours..." : "Créer l'univers"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
