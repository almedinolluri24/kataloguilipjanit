import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import MainLayout from './layouts/MainLayout';

// Load routes on demand so the public home page does not download admin and map code first.
const Home = lazy(() => import('./pages/Home'));
const Businesses = lazy(() => import('./pages/Businesses'));
const BusinessDetails = lazy(() => import('./pages/BusinessDetails'));
const Categories = lazy(() => import('./pages/Categories'));
const Settlements = lazy(() => import('./pages/Settlements'));
const AddBusiness = lazy(() => import('./pages/AddBusiness'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const SiteAiAssistant = lazy(() => import('./components/SiteAiAssistant'));

function PageLoading() {
  return <div role="status" aria-live="polite" style={{ minHeight: '40vh', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>Duke u ngarkuar…</div>;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* Public Portal Layout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="bizneset" element={<Businesses />} />
              <Route path="bizneset/:id" element={<BusinessDetails />} />
              <Route path="kategorite" element={<Categories />} />
              <Route path="vendbanimet" element={<Settlements />} />
              <Route path="shto-biznes" element={<AddBusiness />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Management Panel */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <SiteAiAssistant />
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}
