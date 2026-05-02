import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BrainCircuit, Activity, BookOpen, Download } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-chart-4/10 blur-[150px]" />
      </div>

      <header className="py-6 px-8 border-b border-border/40 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold tracking-widest text-primary uppercase">Matrice</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Tableau de bord</Button>
            </Link>
            <Link href="/projects/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Créer un univers
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
              Transformez une idée brute en univers fictionnel.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light">
              Le premier système d'exploitation créatif pensé pour les conteurs exigeants, les scénaristes et les créateurs de mondes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/projects/new">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_40px_-10px_hsl(var(--primary))]">
                  Créer un univers <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="py-24 bg-black/40 border-t border-border/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { title: "Matrice", icon: Sparkles, desc: "Structurez les fondations de votre univers" },
                { title: "Noyau", icon: BrainCircuit, desc: "Définissez l'arc émotionnel de vos personnages" },
                { title: "Scores", icon: Activity, desc: "Évaluez l'impact narratif de votre projet" },
                { title: "Atelier", icon: BookOpen, desc: "Développez votre manuscrit ou scénario" },
                { title: "Exports", icon: Download, desc: "Générez des documents professionnels" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-card/30 border border-border/50 rounded-2xl p-6 hover:bg-card/50 transition-colors"
                >
                  <feature.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
