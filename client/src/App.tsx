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
import Windows10Upgrade from "@/pages/windows10-upgrade";
import CustomerPortal from "@/pages/customer-portal";
import SocialProofPopup from "@/components/social-proof-popup";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { initializeWHMCS } from "./lib/whmcs-integration";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/windows10-upgrade" component={Windows10Upgrade} />
      <Route path="/customer-portal" component={CustomerPortal} />
      <Route path="/admin/reviews" component={AdminReviewsPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics and WHMCS when app loads
  useEffect(() => {
    // Initialize Google Analytics
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }

    // Initialize WHMCS integration
    initializeWHMCS({
      baseUrl: 'https://billing.aramistech.com',
      apiIdentifier: '', // Will be set via server environment
      apiSecret: '' // Will be set via server environment
    });
  }, []);

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
