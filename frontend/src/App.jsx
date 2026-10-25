import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Businesses from './pages/Businesses';
import BusinessDetails from './pages/BusinessDetails';
import Categories from './pages/Categories';
import Settlements from './pages/Settlements';
import AddBusiness from './pages/AddBusiness';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import SiteAiAssistant from './components/SiteAiAssistant';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </ToastProvider>
  );
}
