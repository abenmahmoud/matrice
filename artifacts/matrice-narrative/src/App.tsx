import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router as WouterRouter } from "wouter";
import { AdminProvider } from "@/context/AdminContext";

import Home from "./pages/home";
import PricingPage from "./pages/pricing";
import SignupPage from "./pages/signup";
import VerifyEmailPage from "./pages/verify-email";
import Dashboard from "./pages/dashboard";
import NewProject from "./pages/new-project";
import MatrixPage from "./pages/matrix";
import EmotionalCorePage from "./pages/emotional-core";
import CharactersPage from "./pages/characters";
import RelationshipsPage from "./pages/relationships";
import WorldPage from "./pages/world";
import ResearchPage from "./pages/research";
import HpsaPage from "./pages/hpsa";
import BookPage from "./pages/book";
import ScreenplayPage from "./pages/screenplay";
import SeriesPage from "./pages/series";
import PitchPage from "./pages/pitch";
import ExportsPage from "./pages/exports";
import AdminPage from "./pages/admin";
import AnalysePage from "./pages/analyse";
import ProjectAnalysePage from "./pages/project-analyse";
import ProjectOverview from "./pages/project-overview";
import TensionArcPage from "./pages/tension-arc";
import AtmospherePage from "./pages/atmosphere";
import ConstellationPage from "./pages/constellation";
import DialoguePage from "./pages/dialogue";
import DirectorPage from "./pages/director";
import NotebookPage from "./pages/director-notebook";
import EchoTempsPage from "./pages/echo-temps";
import MiroirPage from "./pages/miroir";
import PiliersPage from "./pages/piliers";
import SequencierPage from "./pages/sequencier";
import NoteIntentionPage from "./pages/note-intention";
import FilmScenesPage from "./pages/film-scenes";
import PrismePage from "./pages/prisme";
import MemoryPage from "./pages/memory";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/memory" component={MemoryPage} />
      <Route path="/analyse" component={AnalysePage} />
      <Route path="/projects/new" component={NewProject} />
      <Route path="/projects/:id/matrix" component={MatrixPage} />
      <Route path="/projects/:id" component={ProjectOverview} />
      <Route path="/projects/:id/overview" component={ProjectOverview} />
      <Route path="/projects/:id/tension-arc" component={TensionArcPage} />
      <Route path="/projects/:id/atmosphere" component={AtmospherePage} />
      <Route path="/projects/:id/constellation" component={ConstellationPage} />
      <Route path="/projects/:id/dialogue" component={DialoguePage} />
      <Route path="/projects/:id/director" component={DirectorPage} />
      <Route path="/projects/:id/notebook" component={NotebookPage} />
      <Route path="/projects/:id/echo-temps" component={EchoTempsPage} />
      <Route path="/projects/:id/miroir" component={MiroirPage} />
      <Route path="/projects/:id/piliers" component={PiliersPage} />
      <Route path="/projects/:id/sequencier" component={SequencierPage} />
      <Route path="/projects/:id/note-intention" component={NoteIntentionPage} />
      <Route path="/projects/:id/film-scenes" component={FilmScenesPage} />
      <Route path="/projects/:id/prisme" component={PrismePage} />
      <Route path="/projects/:id/emotional-core" component={EmotionalCorePage} />
      <Route path="/projects/:id/characters" component={CharactersPage} />
      <Route path="/projects/:id/relationships" component={RelationshipsPage} />
      <Route path="/projects/:id/world" component={WorldPage} />
      <Route path="/projects/:id/research" component={ResearchPage} />
      <Route path="/projects/:id/hpsa" component={HpsaPage} />
      <Route path="/projects/:id/book" component={BookPage} />
      <Route path="/projects/:id/screenplay" component={ScreenplayPage} />
      <Route path="/projects/:id/series" component={SeriesPage} />
      <Route path="/projects/:id/pitch" component={PitchPage} />
      <Route path="/projects/:id/exports" component={ExportsPage} />
      <Route path="/projects/:id/analyse" component={ProjectAnalysePage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AdminProvider>
    </QueryClientProvider>
  );
}

export default App;
