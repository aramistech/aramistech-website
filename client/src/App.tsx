import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import AdminReviewsPage from "@/pages/admin-reviews";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import SocialProofPopup from "@/components/social-proof-popup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/reviews" component={AdminReviewsPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <SocialProofPopup />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
