import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FinanceProvider } from '@/context/FinanceContext';
import { AuthProvider } from '@/context/AuthContext';
import React, { Suspense, lazy } from 'react';
import OfflineNotice from '@/components/ui/OfflineNotice';
import { UpdateNotification } from '@/components/UpdateNotification';

// Layouts
import AppLayout from "@/components/layout/AppLayout";
import AuthLayout from "@/components/layout/AuthLayout";

// Loading component
const LoadingFallback = () => <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

// Lazily loaded components
const Onboarding = lazy(() => import('@/pages/Onboarding'));

// Auth Pages
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/auth/VerifyEmail"));
const ResendVerification = lazy(() => import("@/pages/auth/ResendVerification"));

// App Pages
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const More = lazy(() => import("@/pages/dashboard/More"));
const PageNotFound = lazy(() => import("@/pages/common/PageNotFound"));
const Accounts = lazy(() => import("@/pages/accounts/Accounts"));
const AccountDetail = lazy(() => import("@/pages/accounts/AccountDetail"));
const Transactions = lazy(() => import("@/pages/transactions/Transactions"));
const Budgets = lazy(() => import("@/pages/budgets/Budgets"));
const Goals = lazy(() => import("@/pages/goals/Goals"));
const Settings = lazy(() => import("@/pages/settings/Settings"));
const Reports = lazy(() => import("@/pages/reports/Reports"));
const Categories = lazy(() => import("@/pages/categories/Categories"));

// Create a client
const queryClient = new QueryClient();

const App = () => {
  const [showOnboarding, setShowOnboarding] = React.useState(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    const token = localStorage.getItem('token');
    return !hasVisited && !token;
  });

  if (showOnboarding) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Onboarding onFinish={() => setShowOnboarding(false)} />
      </Suspense>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <FinanceProvider>
            <Toaster />
            <Sonner />
            <OfflineNotice />
            <UpdateNotification />
            <BrowserRouter>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Login />
                    </Suspense>
                  } />
                  <Route path="/register" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Register />
                    </Suspense>
                  } />
                  <Route path="/forgot-password" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ForgotPassword />
                    </Suspense>
                  } />
                  <Route path="/reset-password" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ResetPassword />
                    </Suspense>
                  } />
                  <Route path="/verify-email" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <VerifyEmail />
                    </Suspense>
                  } />
                  <Route path="/resend-verification" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ResendVerification />
                    </Suspense>
                  } />
                </Route>

                {/* App Routes */}
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="/accounts" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Accounts />
                    </Suspense>
                  } />
                  <Route path="/accounts/:id" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AccountDetail />
                    </Suspense>
                  } />
                  <Route path="/transactions" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Transactions />
                    </Suspense>
                  } />
                  <Route path="/budgets" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Budgets />
                    </Suspense>
                  } />
                  <Route path="/goals" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Goals />
                    </Suspense>
                  } />
                  <Route path="/reports" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Reports />
                    </Suspense>
                  } />
                  <Route path="/categories" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Categories />
                    </Suspense>
                  } />
                  <Route path="/settings" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Settings />
                    </Suspense>
                  } />
                  <Route path="/more" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <More />
                    </Suspense>
                  } />
                </Route>

                {/* Redirect root to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* 404 - Not Found */}
                <Route path="*" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PageNotFound />
                  </Suspense>
                } />
              </Routes>
            </BrowserRouter>
          </FinanceProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
