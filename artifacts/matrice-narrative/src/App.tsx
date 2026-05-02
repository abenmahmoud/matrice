import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router as WouterRouter } from "wouter";
import { AdminProvider } from "@/context/AdminContext";

import Home from "./pages/home";
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
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects/new" component={NewProject} />
      <Route path="/projects/:id/matrix" component={MatrixPage} />
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
