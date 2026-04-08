import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { MoneyProvider } from "@/context/MoneyContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import { MainLayout } from "@/components/layout";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const SummaryPage = lazy(() => import("./pages/SummaryPage"));
const AccountsPage = lazy(() => import("./pages/AccountsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<AppLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                element={
                  <PrivateRoute>
                    <MoneyProvider>
                      <MainLayout />
                    </MoneyProvider>
                  </PrivateRoute>
                }
              >
                <Route path="/app" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/summary" element={<SummaryPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingChatWidget />
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
