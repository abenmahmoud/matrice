import { Link } from "wouter";
import { useListProjects, useGetDashboardSummary } from "@workspace/api-client-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, FolderOpen, Loader2, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: projects, isLoading: projectsLoading } = useListProjects();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();

  const isLoading = projectsLoading || summaryLoading;

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">Vos univers en cours de création</p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau projet
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-4xl font-serif text-primary">
                    {summary?.totalProjects || 0}
                  </CardTitle>
                  <CardDescription>Projets totaux</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-4xl font-serif text-primary">
                    {Math.round(summary?.averageProgression || 0)}%
                  </CardTitle>
                  <CardDescription>Progression moyenne</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-4xl font-serif text-primary">
                    {summary?.recentProjects?.length || 0}
                  </CardTitle>
                  <CardDescription>Projets actifs récemment</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Projects Grid */}
            <div>
              <h2 className="text-xl font-serif font-semibold mb-4">Vos Projets</h2>
              {projects?.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/10">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Aucun projet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Vous n'avez pas encore créé de projet. Commencez par créer votre premier univers narratif.
                  </p>
                  <Link href="/projects/new">
                    <Button>Créer un univers</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projects?.map((project, i) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/projects/${project.id}`}>
                        <Card className="h-full flex flex-col bg-card hover:bg-card/80 transition-colors border-border/50 cursor-pointer group">
                          <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                                {project.targetFormat}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(project.updatedAt), "d MMM yyyy", { locale: fr })}
                              </span>
                            </div>
                            <CardTitle className="text-xl font-serif line-clamp-1">{project.title}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-2 h-10">
                              {project.rawIdea}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1">
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progression</span>
                                <span>{project.progression}%</span>
                              </div>
                              <Progress value={project.progression} className="h-1.5" />
                            </div>
                          </CardContent>
                          <CardFooter className="pt-4 border-t border-border/20">
                            <span className="text-sm font-medium text-primary flex items-center group-hover:translate-x-1 transition-transform">
                              Ouvrir <ArrowRight className="w-4 h-4 ml-1" />
                            </span>
                          </CardFooter>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
