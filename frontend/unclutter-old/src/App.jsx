import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/auth/LoginPage';
import RegistrationPage from './pages/auth/RegistrationPage';
import VerifyEmail from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import HomePage from './pages/HomePage';
import JournalPage from './pages/JournalPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/journal/*',  // Add the * to enable nested routes
        element: <JournalPage />
      },
    ]
  },
  // Auth routes outside AppShell
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegistrationPage />
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />
  }
], {
  future: {
    v7_startTransition: true
  }
});

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
      <ToastViewport />
    </ToastProvider>
  );
}

export default App;