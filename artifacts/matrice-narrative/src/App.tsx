 
 

import { useEffect } from "react";
import { Switch, Route, useLocation, useParams } from "wouter";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { setAuthTokenGetter } from "@workspace/api-client-react";

import { Toaster } from "@/components/ui/toaster";

import { TooltipProvider } from "@/components/ui/tooltip";

import { Router as WouterRouter } from "wouter";

import { AdminProvider } from "@/context/AdminContext";

import { getUserToken } from "@/lib/userAuth";



import Home from "./pages/home";

import PricingPage from "./pages/pricing";
import { LegalCguPage, LegalCgvPage, LegalMentionsPage, LegalPrivacyPage } from "./pages/legal";

import SignupPage from "./pages/signup";
import LoginPage from "./pages/login";
import ProfilePage from "./pages/profile";

import VerifyEmailPage from "./pages/verify-email";

import ForgotPasswordPage from "./pages/forgot-password";

import ResetPasswordPage from "./pages/reset-password";

import OnboardingPage from "./pages/onboarding";
import OnboardingWelcomePage from "./pages/onboarding-welcome";
import OnboardingStepPage from "./pages/onboarding-step";
import NotificationsPage from "./pages/notifications";
import NotificationPreferencesPage from "./pages/profile-notifications";
import SupportPage from "./pages/support";
import NewSupportTicketPage from "./pages/support/new";
import SupportTicketDetailPage from "./pages/support/ticket-detail";
import CommunityPage from "./pages/community";
import NewCommunityThreadPage from "./pages/community/new";
import CommunityThreadPage from "./pages/community/thread-detail";

import AccessRedirectPage from "./pages/access-redirect";
import VerifyWorkPage from "./pages/verify-work";

import ExperimentalModulesPage from "./pages/experimental-modules";

import Dashboard from "./pages/dashboard";
import MyLockedWorksPage from "./pages/my-locked-works";

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
import WorkPassportPage from "./pages/work-passport";
import ProjectMandatePage from "./pages/project-mandate";
import ProjectPublishPage from "./pages/project-publish";
import BillingPage from "./pages/billing";
import SalesPage from "./pages/sales";

import AdminDashboardPage from "./pages/admin/dashboard";
import AdminFinancePage from "./pages/admin/finance";
import AdminAuthorsPage from "./pages/admin/authors";
import AdminUsersPage from "./pages/admin/users";
import AdminUserDetailPage from "./pages/admin/user-detail";
import AdminCreditsPage from "./pages/admin/credits";
import AdminInvitesPage from "./pages/admin/invites";
import AdminAuditLogPage from "./pages/admin/audit-log";
import AdminSupportPage from "./pages/admin/support";
import AdminSupportTicketPage from "./pages/admin/support/ticket-detail";
import AdminSystemPage from "./pages/admin/system";
import CreatorLabPage, { CreatorPreviewPage } from "./pages/creator/lab";
import CreatorSystemPage from "./pages/creator/system";
import VoiceLabPage from "./pages/creator/voice-lab";

import AnalysePage from "./pages/analyse";
import LentilleMarchePage from "./pages/lentille-marche";
import LentilleMarcheDetailPage from "./pages/lentille-marche-detail";

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



setAuthTokenGetter(() => getUserToken());



function Router() {

  return (

    <Switch>

      <Route path="/" component={Home} />

      <Route path="/pricing" component={PricingPage} />
      <Route path="/legal/mentions-legales" component={LegalMentionsPage} />
      <Route path="/legal/cgu" component={LegalCguPage} />
      <Route path="/legal/cgv" component={LegalCgvPage} />
      <Route path="/legal/confidentialite" component={LegalPrivacyPage} />

      <Route path="/signup" component={SignupPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/connexion" component={LoginPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/notifications" component={NotificationPreferencesPage} />
      <Route path="/compte" component={ProfileRedirect} />

      <Route path="/verify-email" component={VerifyEmailPage} />

      <Route path="/forgot-password" component={ForgotPasswordPage} />

      <Route path="/reset-password" component={ResetPasswordPage} />

      <Route path="/onboarding/welcome" component={OnboardingWelcomePage} />
      <Route path="/onboarding/:stepId" component={OnboardingStepPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/support/tickets/:id" component={SupportTicketDetailPage} />
      <Route path="/support/new" component={NewSupportTicketPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/community/new" component={NewCommunityThreadPage} />
      <Route path="/community/:id" component={CommunityThreadPage} />
      <Route path="/community" component={CommunityPage} />

      <Route path="/auth-required" component={AccessRedirectPage} />

      <Route path="/upgrade" component={AccessRedirectPage} />

      <Route path="/forbidden" component={AccessRedirectPage} />
      <Route path="/verify/:hash" component={VerifyWorkPage} />

      <Route path="/experimental-modules" component={ExperimentalModulesPage} />

      <Route path="/dashboard" component={Dashboard} />
      <Route path="/locked-works" component={MyLockedWorksPage} />

      <Route path="/memory" component={MemoryPage} />

      <Route path="/analyse" component={AnalysePage} />
      <Route path="/lentille-marche/:id" component={LentilleMarcheDetailPage} />
      <Route path="/lentille-marche" component={LentilleMarchePage} />

      <Route path="/projects/new" component={NewProject} />

      <Route path="/projects/:id/matrix" component={MatrixPage} />

      <Route path="/projects/:id/overview" component={ProjectOverviewRedirect} />

      <Route path="/projects/:id" component={ProjectOverview} />

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
      <Route path="/projects/:id/publish" component={ProjectPublishPage} />
      <Route path="/projects/:id/mandate" component={ProjectMandatePage} />
      <Route path="/projects/:id/passport" component={WorkPassportPage} />
      <Route path="/billing" component={BillingPage} />
      <Route path="/sales" component={SalesPage} />
      <Route path="/creator-lab/system" component={CreatorSystemPage} />
      <Route path="/creator-lab/voice" component={VoiceLabPage} />
      <Route path="/creator-lab/preview" component={CreatorPreviewPage} />
      <Route path="/creator-lab" component={CreatorLabPage} />
      <Route path="/studio" component={AdminRedirect} />
      <Route path="/admin/dashboard" component={AdminRedirect} />
      <Route path="/admin/users/:id" component={AdminUserDetailPage} />
      <Route path="/admin/credits" component={AdminCreditsPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/invites" component={AdminInvitesPage} />
      <Route path="/admin/support/:id" component={AdminSupportTicketPage} />
      <Route path="/admin/support" component={AdminSupportPage} />
      <Route path="/admin/audit" component={AdminAuditLogPage} />
      <Route path="/admin/finance" component={AdminFinancePage} />
      <Route path="/admin/authors" component={AdminAuthorsPage} />
      <Route path="/admin/system" component={AdminSystemPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route component={NotFound} />

    </Switch>

  );

}

function RedirectTo({ to }: { to: string }) {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate(to, { replace: true });
  }, [navigate, to]);

  return null;
}

function ProfileRedirect() {
  return <RedirectTo to="/profile" />;
}

function AdminRedirect() {
  return <RedirectTo to="/admin" />;
}

function ProjectOverviewRedirect() {
  const { id = "" } = useParams<{ id: string }>();
  return <RedirectTo to={`/projects/${id}`} />;
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

