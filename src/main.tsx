import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';
import QuoteRequest from './components/QuoteRequest';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import ProjectsPage from './components/admin/ProjectsPage';
import ProfessionalsPage from './components/admin/ProfessionalsPage';
import ContactRequestsPage from './components/admin/ContactRequestsPage';
import ClientsPage from './components/admin/ClientsPage';
import FindPro from './components/FindPro';
import LegalPages from './components/LegalPages';
import { isAdmin } from './lib/auth';

// Protected Route component
function RequireAuth({ children }: { children: JSX.Element }) {
  if (!isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function Root() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route index element={<App />} />
        <Route path="/demander-un-devis" element={<QuoteRequest />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/trouver-un-pro" element={<FindPro />} />
        <Route path="/legal/:page" element={<LegalPages />} />
        
        {/* Protected admin routes */}
        <Route path="/admin" element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<ProjectsPage />} />
          <Route path="contact-requests" element={<ContactRequestsPage />} />
          <Route path="professionals" element={<ProfessionalsPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
        </Route>

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <Root />
    </StrictMode>
  );
}