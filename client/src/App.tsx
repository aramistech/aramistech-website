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
import IPLookup from "@/pages/ip-lookup";
import AIDevelopment from "@/pages/ai-development";
import KnowledgeBase from "@/pages/knowledge-base";
import KnowledgeBaseArticle from "@/pages/knowledge-base-article";
import ServiceCalculator from "@/pages/service-calculator";
import AdminServiceCalculator from "@/pages/admin-service-calculator";
import ServicesOrder from "@/pages/services-order-static";
import Checkout from "@/pages/checkout";

import SocialProofPopup from "@/components/social-proof-popup";
import ChatGPTChatbot from "@/components/chatgpt-chatbot";
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
      <Route path="/ai-development" component={AIDevelopment} />
      <Route path="/windows10-upgrade" component={Windows10Upgrade} />
      <Route path="/customer-portal" component={CustomerPortal} />
      <Route path="/ip-lookup" component={IPLookup} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/knowledge-base/:slug" component={KnowledgeBaseArticle} />
      <Route path="/service-calculator" component={ServiceCalculator} />
      <Route path="/services-order" component={ServicesOrder} />
      <Route path="/checkout" component={Checkout} />
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
      baseUrl: 'https://aramistech.com/abilling',
      apiIdentifier: '',
      apiSecret: ''
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
        <SocialProofPopup />
        <ChatGPTChatbot className="fixed bottom-4 right-4 z-40" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
