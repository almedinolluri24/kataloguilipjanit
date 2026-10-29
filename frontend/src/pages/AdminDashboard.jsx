import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Layers,
  Megaphone,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle,
  Clock,
  Archive,
  RefreshCw,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Lock,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  KeyRound,
  Mail,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminProfile from '../components/AdminProfile';
import BusinessModal from '../components/BusinessModal';
import ConfirmModal from '../components/ConfirmModal';
import { api, authStorage } from '../services/api';
import { useToast } from '../components/useToast';
import { useTheme } from '../contexts/useTheme';
import { useLanguage } from '../contexts/useLanguage';

export default function AdminDashboard() {
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, tr } = useLanguage();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(authStorage.getToken()));
  const [adminUser, setAdminUser] = useState(authStorage.getUser());
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirmation, setRegPasswordConfirmation] = useState('');
  const [regInviteCode, setRegInviteCode] = useState('');
  const [regError, setRegError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSentMsg, setCodeSentMsg] = useState(null);

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Data states from MySQL API
  const [stats, setStats] = useState({
    total_businesses: 0,
    published_count: 0,
    draft_count: 0,
    archived_count: 0,
    active_ads_count: 0,
    category_count: 0,
    settlement_count: 0
  });
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);

  // Business CRUD modal states
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);

  // New Category / Ad modal states
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newSettlementName, setNewSettlementName] = useState('');
  const [newSettlementDescription, setNewSettlementDescription] = useState('');
  const [newSettlementIsTown, setNewSettlementIsTown] = useState(false);
  const [isAddingSettlement, setIsAddingSettlement] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState(null);

  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdSponsor, setNewAdSponsor] = useState('');
  const [newAdPlacement, setNewAdPlacement] = useState('banner-home');
  const [newAdStart, setNewAdStart] = useState('2026-10-18T12:00');
  const [newAdEnd, setNewAdEnd] = useState('2026-11-01T23:59');
  const [newAdPriority, setNewAdPriority] = useState(5);
  const [newAdStatus, setNewAdStatus] = useState('active');
  const [isAddingAd, setIsAddingAd] = useState(false);

  // Confirm delete modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Table filters & pagination
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Check auth session on mount
  useEffect(() => {
    if (authStorage.getToken()) {
      api.auth.me()
        .then((res) => {
          setIsAuthenticated(true);
          setAdminUser(res.user);
        })
      .catch(() => {
          authStorage.clear();
          setIsAuthenticated(false);
          setAdminUser(null);
        })
        .finally(() => setIsCheckingSession(false));
    } else {
      setIsCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    if (!codeSentMsg) return undefined;
    const dismissTimer = window.setTimeout(() => setCodeSentMsg(null), 5000);
    return () => window.clearTimeout(dismissTimer);
  }, [codeSentMsg]);

  // Fetch all real MySQL data
  const loadAdminData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    try {
      const [statsRes, bizRes, catsRes, setsRes, adsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getBusinesses({ status: statusFilter, category: catFilter, q: searchFilter }),
        api.admin.getCategories(),
        api.admin.getSettlements(),
        api.admin.getAdvertisements()
      ]);

      setStats(statsRes || {});
      setBusinesses(bizRes || []);
      setCategories(catsRes || []);
      setSettlements(setsRes || []);
      setAdvertisements(adsRes || []);
    } catch (err) {
      console.error('Gabim gjatë ngarkimit të panelit admin:', err);
      addToast('Dështoi ngarkimi i të dhënave administrative nga MySQL.', 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, statusFilter, catFilter, searchFilter, addToast]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated, loadAdminData]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await api.auth.login(loginEmail, loginPassword);
      setIsAuthenticated(true);
      setAdminUser(res.user);
      addToast('Hyrja në panelin e administrimit u krye me sukses!', 'success');
    } catch (err) {
      setLoginError(err.status === 401 ? t('loginFailed') : (language === 'en' ? 'Unable to sign in. Please try again.' : (err.message || 'Kredencialet janë të pasakta.')));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Send Invite Code to Admin Email handler
  const handleSendInviteCode = async () => {
    const emailInput = document.getElementById('reg-email');
    if (!emailInput?.reportValidity() || !regEmail.trim()) return;

    setIsSendingCode(true);
    setRegError(null);
    setCodeSentMsg(null);

    try {
      const res = await api.auth.sendInviteCode(regEmail.trim());
      setCodeSentMsg(res.message || 'Kodi i ftesës u dërgua me sukses në email.');
      if (res.code) {
        setRegInviteCode(res.code); // Plotësoje automatikisht për lehtësi të përdoruesit
      }
    } catch (err) {
      setRegError(err.message || (language === 'en' ? 'Could not send the invitation code.' : 'Dështoi dërgimi i kodit të ftesës.'));
    } finally {
      setIsSendingCode(false);
    }
  };

  // Sign Up handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegError(null);

    if (regPassword !== regPasswordConfirmation) {
      setRegError('Konfirmimi i fjalëkalimit nuk përputhet me fjalëkalimin.');
      setIsRegistering(false);
      return;
    }

    try {
      const fullName = `${regFirstName.trim()} ${regLastName.trim()}`.trim();
      const res = await api.auth.register({
        name: fullName || 'Administrator',
        email: regEmail.trim(),
        password: regPassword,
        password_confirmation: regPasswordConfirmation,
        invite_code: regInviteCode.trim()
      });
      setIsAuthenticated(true);
      setAdminUser(res.user);
      addToast(`Mirësevini! Llogaria e re e administratorit u krijua me sukses.`, 'success');
    } catch (err) {
      setRegError(err.message || (language === 'en' ? 'Administrator registration failed.' : 'Dështoi regjistrimi i administratorit.'));
    } finally {
      setIsRegistering(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try { await api.auth.logout(); } catch { /* local session is cleared by the API client */ }
    setIsAuthenticated(false);
    setAdminUser(null);
    setActiveTab('dashboard');
    setBusinesses([]); setCategories([]); setSettlements([]); setAdvertisements([]);
    addToast(t('logoutDone'), 'info');
  };

  // Business CRUD
  const handleOpenAdd = () => {
    setEditingBusiness(null);
    setIsBusinessModalOpen(true);
  };

  const handleOpenEdit = (biz) => {
    setEditingBusiness(biz);
    setIsBusinessModalOpen(true);
  };

  const handleSaveBusiness = async (formData) => {
    try {
      if (editingBusiness) {
        await api.admin.updateBusiness(editingBusiness.id, formData);
        addToast(`Biznesi "${formData.name}" u përditësua në bazën e të dhënave!`, 'success');
      } else {
        await api.admin.createBusiness(formData);
        addToast(`Biznesi "${formData.name}" u krijua me sukses në MySQL!`, 'success');
      }
      setIsBusinessModalOpen(false);
      setEditingBusiness(null);
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Dështoi ruajtja e biznesit.', 'error');
    }
  };

  const handleDeleteBusiness = (biz) => {
    setConfirmConfig({
      title: `Fshi biznesin "${biz.name}"?`,
      message: `Ky veprim do të fshijë përgjithmonë biznesin "${biz.name}" dhe reklamat e tij nga databaza MySQL.`,
      onConfirm: async () => {
        try {
          await api.admin.deleteBusiness(biz.id);
          setIsConfirmOpen(false);
          addToast(`Biznesi "${biz.name}" u fshi me sukses.`, 'info');
          loadAdminData();
        } catch (err) {
          addToast(err.message || 'Dështoi fshirja.', 'error');
        }
      }
    });
    setIsConfirmOpen(true);
  };

  const handleStatusChange = async (bizId, newStatus) => {
    try {
      await api.admin.updateBusiness(bizId, { status: newStatus });
      addToast(`Statusi u përditësua në: ${newStatus}`, 'success');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Dështoi ndryshimi i statusit.', 'error');
    }
  };

  // Category Actions
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const payload = {
        name: newCatName.trim(),
        description: newCatDesc.trim() || null
      };
      if (editingCategory) {
        await api.admin.updateCategory(editingCategory.id, payload);
      } else {
        await api.admin.createCategory(payload);
      }
      addToast(editingCategory ? `Kategoria "${newCatName}" u përditësua.` : `Kategoria "${newCatName}" u shtua me sukses!`, 'success');
      setNewCatName('');
      setNewCatDesc('');
      setIsAddingCat(false);
      setEditingCategory(null);
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Dështoi shtimi i kategorisë.', 'error');
    }
  };

  const handleDeleteCategory = (cat) => {
    setConfirmConfig({
      title: `Fshi kategorinë "${cat.name}"?`,
      message: `Sigurohuni që nuk ka biznese të lidhura para fshirjes.`,
      onConfirm: async () => {
        try {
          await api.admin.deleteCategory(cat.id);
          setIsConfirmOpen(false);
          addToast(`Kategoria "${cat.name}" u fshi.`, 'success');
          loadAdminData();
        } catch (err) {
          setIsConfirmOpen(false);
          addToast(err.message || 'Nuk mund të fshihet kategoria.', 'error');
        }
      }
    });
    setIsConfirmOpen(true);
  };

  const handleSaveSettlement = async (e) => {
    e.preventDefault();
    if (!newSettlementName.trim()) return;
    const payload = {
      name: newSettlementName.trim(),
      description: newSettlementDescription.trim() || null,
      is_town: newSettlementIsTown
    };
    try {
      if (editingSettlement) {
        await api.admin.updateSettlement(editingSettlement.id, payload);
      } else {
        await api.admin.createSettlement(payload);
      }
      addToast(editingSettlement ? 'Vendbanimi u përditësua.' : 'Vendbanimi u shtua.', 'success');
      setIsAddingSettlement(false);
      setEditingSettlement(null);
      setNewSettlementName('');
      setNewSettlementDescription('');
      setNewSettlementIsTown(false);
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Dështoi ruajtja e vendbanimit.', 'error');
    }
  };

  const handleDeleteSettlement = (settlement) => {
    setConfirmConfig({
      title: `Fshi vendbanimin "${settlement.name}"?`,
      message: 'Vendbanimet që kanë biznese të lidhura nuk mund të fshihen.',
      onConfirm: async () => {
        try {
          await api.admin.deleteSettlement(settlement.id);
          setIsConfirmOpen(false);
          addToast(`Vendbanimi "${settlement.name}" u fshi.`, 'success');
          loadAdminData();
        } catch (err) {
          setIsConfirmOpen(false);
          addToast(err.message || 'Nuk mund të fshihet vendbanimi.', 'error');
        }
      }
    });
    setIsConfirmOpen(true);
  };

  // Advertisement Actions
  const handleAddAdvertisement = async (e) => {
    e.preventDefault();
    if (!newAdTitle.trim() || !newAdSponsor.trim()) return;

    try {
      await api.admin.createAdvertisement({
        title: newAdTitle.trim(),
        sponsor: newAdSponsor.trim(),
        placement: newAdPlacement,
        start_time: newAdStart,
        end_time: newAdEnd,
        priority: Number(newAdPriority) || 0,
        status: newAdStatus
      });
      addToast('Reklama u shtua me sukses!', 'success');
      setNewAdTitle('');
      setNewAdSponsor('');
      setIsAddingAd(false);
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Dështoi shtimi i reklamës.', 'error');
    }
  };

  const handleToggleAdStatus = async (ad) => {
    const newStatus = ad.status === 'active' ? 'disabled' : 'active';
    try {
      await api.admin.updateAdvertisement(ad.id, { status: newStatus });
      addToast(`Statusi i reklamës u bë: ${newStatus}`, 'success');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Dështoi ndryshimi i statusit.', 'error');
    }
  };

  if (isCheckingSession) {
    return <div className="admin-session-check"><Loader2 size={22} className="animate-spin" /> {t('loading')}</div>;
  }

  // 1. LOGIN SCREEN nëse nuk është i autentikuar
  if (!isAuthenticated) {
    return (
      <div className={`admin-auth-page ${authMode === 'signup' ? 'admin-auth-page-signup' : ''}`} style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        background: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="admin-login-preferences">
          <button type="button" className="btn btn-outline btn-sm" onClick={toggleTheme} aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <label className="language-picker"><span className="sr-only">{t('language')}</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="sq">Shqip</option><option value="en">English</option></select></label>
        </div>
        {codeSentMsg && authMode === 'signup' && (
          <div className="admin-code-sent-notice" role="status" aria-live="polite">
            <CheckCircle size={19} aria-hidden="true" />
            <div>
              <strong>{tr('Kodi u dërgua:')}</strong> {tr(codeSentMsg)}
            </div>
          </div>
        )}
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'var(--gradient-glow)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: '0.3',
          pointerEvents: 'none'
        }} />

        <section className="admin-auth-intro" aria-label={language === 'en' ? 'Administrator access' : 'Qasja e administratorit'}>
          <div className="admin-auth-brand-mark"><ShieldCheck size={22} /><span>Katalogu <strong>Lipjan</strong></span></div>
          <span className="admin-auth-eyebrow">{language === 'en'
            ? (authMode === 'login' ? 'ADMINISTRATOR ACCESS' : 'CREATE ADMIN ACCOUNT')
            : (authMode === 'login' ? 'QASJE ADMINISTRATIVE' : 'KRIJO LLOGARI ADMINISTRATIVE')}</span>
          <h2>{language === 'en'
            ? (authMode === 'login' ? 'Your local business directory, under control.' : 'Set up your administrator account securely.')
            : (authMode === 'login' ? 'Katalogu i bizneseve lokale, nën kontrollin tuaj.' : 'Krijoni llogarinë tuaj administrative në mënyrë të sigurt.')}</h2>
          <p>{language === 'en'
            ? (authMode === 'login' ? 'Sign in to manage listings, categories, and promotions from one secure workspace.' : 'Complete the invitation process to access the administration workspace.')
            : (authMode === 'login' ? 'Hyni për të menaxhuar bizneset, kategoritë dhe promovimet nga një hapësirë e sigurt.' : 'Përfundoni procesin e ftesës për të hyrë në hapësirën administrative.')}</p>
          <div className="admin-auth-secure-note">
            <Lock size={16} />
            <span>{language === 'en' ? 'Secure administrator sign-in' : 'Hyrje e sigurt për administratorët'}</span>
          </div>
        </section>

        <motion.div
          className={`admin-auth-card ${authMode === 'signup' ? 'admin-auth-card-signup' : ''}`}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: authMode === 'signup' ? '540px' : '440px',
            width: '100%',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderRadius: '24px',
            padding: '2.5rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
            margin: 'auto',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div className="admin-auth-header" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'var(--gradient-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              {authMode === 'login' ? <Lock size={32} /> : <UserPlus size={32} />}
            </motion.div>
            <div className="admin-auth-title-copy">
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {authMode === 'login' ? t('loginTitle') : (language === 'en' ? 'Administrator registration' : 'Regjistrimi i Administratorit')}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {authMode === 'login'
                  ? t('loginDescription')
                  : tr('Krijo llogari të re administrative me verifikim të kodit të ftesës.')}
              </p>
            </div>
          </div>

          {/* Toggle Button Tabs between Login and Sign Up */}
          <div className="admin-auth-tabs" style={{
            display: 'flex',
            background: 'var(--bg-tertiary)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <motion.button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
                setRegError(null);
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                borderRadius: '8px',
                background: authMode === 'login' ? 'var(--gradient-secondary)' : 'transparent',
                color: authMode === 'login' ? 'white' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tr('Hyrja')}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setLoginError(null);
                setRegError(null);
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                borderRadius: '8px',
                background: authMode === 'signup' ? 'var(--gradient-secondary)' : 'transparent',
                color: authMode === 'signup' ? 'white' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tr('Regjistrohu')}
            </motion.button>
          </div>

          {/* Error alerts */}
          {authMode === 'login' && loginError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#991b1b',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          {authMode === 'signup' && regError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#991b1b',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{tr(regError)}</span>
            </div>
          )}

          {/* FORMULARI 1: LOGIN */}
          {authMode === 'login' && (
            <form className="admin-login-form" onSubmit={handleLogin} autoComplete="off">
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="admin-email">
                  {t('email')}
                </label>
                <input
                  id="admin-email"
                  name="admin-login-email"
                  type="email"
                  className="form-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder={tr('Shkruaj email-in')}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label" htmlFor="admin-pass">
                  {t('password')}
                </label>
                <input
                  id="admin-pass"
                  name="admin-login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  className="form-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder={tr('Shkruaj fjalëkalimin')}
                />
                <button type="button" className="password-visibility" onClick={() => setShowLoginPassword((shown) => !shown)} aria-label={showLoginPassword ? t('hidePassword') : t('showPassword')}>
                  {showLoginPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                  fontWeight: 700,
                  borderRadius: '10px'
                }}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{tr('Duke verifikuar...')}</span>
                  </>
                ) : (
                  <span>{tr('Hyr në Panel →')}</span>
                )}
              </button>
            </form>
          )}

          {/* FORMULARI 2: SIGN UP ME KOD FTESE NE EMAIL */}
          {authMode === 'signup' && (
            <form className="admin-registration-form" onSubmit={handleRegister} autoComplete="off">
              <div className="admin-registration-fields">
              {/* Emri & Mbiemri në dy inpute të veçanta */}
              <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="reg-first-name">
                    {tr('Emri')} *
                  </label>
                  <input
                    id="reg-first-name"
                    type="text"
                    className="form-input"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    required
                    placeholder={tr('Shkruaj emrin')}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="reg-last-name">
                    {tr('Mbiemri')} *
                  </label>
                  <input
                    id="reg-last-name"
                    type="text"
                    className="form-input"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    required
                    placeholder={tr('Shkruaj mbiemrin')}
                  />
                </div>
              </div>

              {/* Email Adresa */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="reg-email">
                  {tr('Email Adresa Zyrtare *')}
                </label>
                <input
                  id="reg-email"
                    name="admin-signup-email"
                  type="email"
                  className="form-input"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                    autoComplete="off"
                    placeholder={tr('Shkruaj email-in')}
                />
              </div>

              <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="reg-pass">
                  {t('password')} *
                  </label>
                  <input
                    id="reg-pass"
                    name="admin-signup-password"
                    type="password"
                    className="form-input"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder={tr('Shkruaj fjalëkalimin')}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="reg-pass-conf">
                    {tr('Konfirmo Fjalëkalimin *')}
                  </label>
                  <input
                    id="reg-pass-conf"
                    name="admin-signup-password-confirm"
                    type="password"
                    className="form-input"
                    value={regPasswordConfirmation}
                    onChange={(e) => setRegPasswordConfirmation(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder={tr('Konfirmo fjalëkalimin')}
                  />
                </div>
              </div>

              </div>

              {/* Fusha e Kodit të Ftesës me Butonin 'Dërgo në Email' */}
              <div className="form-group admin-invite-panel" style={{
                background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
                border: '1px solid #ccfbf1',
                borderRadius: '14px',
                padding: '18px',
                marginBottom: '1.5rem'
              }}>
                <div className="admin-invite-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div className="admin-invite-icon" style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Mail size={14} color="#ffffff" />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="reg-invite" style={{ marginBottom: 0, fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                      {tr('Kodi i Ftesës në Email *')}
                    </label>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', lineHeight: 1.3 }}>
                      {tr('Kliko butonin për të marrë kodin në email, pastaj vendose kodin këtu.')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="admin-invite-send"
                  onClick={handleSendInviteCode}
                  disabled={isSendingCode || !regEmail}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: !regEmail || isSendingCode ? 'not-allowed' : 'pointer',
                    opacity: !regEmail || isSendingCode ? 0.55 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                    marginBottom: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSendingCode ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>{tr('Duke dërguar kodin në email...')}</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>{tr('Dërgo kodin në email')}</span>
                    </>
                  )}
                </button>

                <div className="admin-invite-code-field" style={{ position: 'relative' }}>
                  <input
                    id="reg-invite"
                    type="text"
                    className="form-input"
                    value={regInviteCode}
                    onChange={(e) => setRegInviteCode(e.target.value)}
                    required
                    placeholder={tr('Vendose kodin')}
                    style={{
                      paddingLeft: '2.5rem',
                      background: '#ffffff',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      fontSize: '0.95rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '10px'
                    }}
                  />
                  <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#0d9488' }} />
                </div>
                <div className="admin-invite-help" style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '8px', color: '#64748b', fontSize: '0.7rem', lineHeight: 1.4 }}>
                  <Mail size={13} color="#0d9488" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{tr('Kodi dërgohet në email-in tuaj:')} <strong style={{ color: regEmail ? '#0d9488' : '#94a3b8' }}>{regEmail || tr('(shkruaj email-in më lart)')}</strong></span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary admin-registration-submit"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.85rem',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                  fontWeight: 700,
                  borderRadius: '10px'
                }}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{tr('Duke regjistruar llogarinë...')}</span>
                  </>
                ) : (
                  <span>{tr('Krijo Llogarinë Administrative →')}</span>
                )}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
              &larr; Kthehu në faqen publike
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. PANELI I ADMINISTRIMIT I AUTENTIKUAR
  return (
    <div className="admin-layout-wrapper">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        adminUser={adminUser}
      />

      {/* Main Content Area */}
      <main className="admin-main-view">
        <div className="admin-preferences">
          <button type="button" className="btn btn-outline btn-sm" onClick={toggleTheme} aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <label className="language-picker"><span className="sr-only">{t('language')}</span><select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="sq">Shqip</option><option value="en">English</option></select></label>
        </div>
        {/* Verification Status Banner */}
        <div className="admin-sync-banner" style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '14px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          fontSize: '0.875rem',
          color: '#166534',
          boxShadow: '0 2px 6px rgba(22, 101, 52, 0.04)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} color="#16a34a" />
            </div>
            <span>
                  <strong>{tr('Lidhja me Backend')}:</strong> {language === 'en' ? 'Data is syncing with the Laravel API and database.' : 'Paneli po sinkronizon të dhënat drejtpërdrejt me Laravel API & MySQL.'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadAdminData}
            disabled={isLoadingData}
            style={{
              borderColor: '#86efac',
              color: '#15803d',
              background: '#ffffff',
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >
            <RefreshCw size={13} className={isLoadingData ? 'animate-spin' : ''} />
            <span>{tr('Sinkronizo të dhënat')}</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="admin-view-header">
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                  {tr('Paneli Kryesor i Administrimit')}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
                  {tr('Statistika dhe pasqyrë e plotë mbi bizneset dhe përmbajtjen e regjistruar në Lipjan.')}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenAdd}
                  style={{
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                    padding: '9px 18px',
                    fontWeight: 700,
                    borderRadius: '10px'
                  }}
                >
                  <Plus size={18} />
                  <span>{tr('Shto Biznes të Ri')}</span>
                </button>
              </div>
            </div>

            {/* Stat Cards Grid (Reale nga DB) */}
            <div className="stats-cards-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
                  <Store size={24} />
                </div>
                <div className="stat-meta">
                  <span className="stat-value">{stats.total_businesses ?? 0}</span>
                  <span className="stat-title">{t('totalBusinesses')}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                  <CheckCircle size={24} />
                </div>
                <div className="stat-meta">
                  <span className="stat-value">{stats.published_count ?? 0}</span>
                  <span className="stat-title">{t('published')}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                  <Clock size={24} />
                </div>
                <div className="stat-meta">
                  <span className="stat-value">{stats.draft_count ?? 0}</span>
                  <span className="stat-title">{t('drafts')}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#f1f5f9', color: '#64748b' }}>
                  <Archive size={24} />
                </div>
                <div className="stat-meta">
                  <span className="stat-value">{stats.archived_count ?? 0}</span>
                  <span className="stat-title">{t('archived')}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Layers size={24} />
                </div>
                <div className="stat-meta">
                  <span className="stat-value">{stats.category_count ?? categories.length}</span>
                  <span className="stat-title">{t('categoriesCount')}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                  <Megaphone size={24} />
                </div>
                <div className="stat-meta">
                  <span className="stat-value">{stats.active_ads_count ?? 0}</span>
                  <span className="stat-title">{t('activeAds')}</span>
                </div>
              </div>
            </div>

            {/* Quick Recent Businesses Table */}
            <div className="admin-table-card">
              <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                  {tr('Bizneset e Fundit në Katalog')}
                </h3>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab('businesses')}
                >
                  <span>{tr('Menaxho të Gjitha →')}</span>
                </button>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{tr('Emri i Biznesit')}</th>
                      <th>{tr('Kategoria')}</th>
                      <th>{tr('Vendbanimi')}</th>
                      <th>{tr('Statusi')}</th>
                      <th>{tr('Veprime')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.slice(0, 5).map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>{b.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.address}</div>
                        </td>
                        <td>{b.category?.name || b.category_id}</td>
                        <td>{b.settlement?.name || b.settlement_id}</td>
                        <td>
                          <span className={`status-badge status-${b.status}`}>
                            {b.status === 'published' ? 'Publikuar' : b.status === 'draft' ? 'Draft' : 'Arkivuar'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link
                              to={`/bizneset/${b.slug || b.id}`}
                              className="action-icon-btn action-btn-view"
                              title="Shiko në faqe"
                            >
                              <Eye size={15} />
                            </Link>
                            <button
                              type="button"
                              className="action-icon-btn action-btn-edit"
                              onClick={() => handleOpenEdit(b)}
                              title="Ndrysho të dhënat"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn action-btn-delete"
                              onClick={() => handleDeleteBusiness(b)}
                              title="Fshi biznesin"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUSINESSES CRUD */}
        {activeTab === 'businesses' && (
          <div>
            <div className="admin-view-header">
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>
                  {tr('Menaxhimi i Bizneseve')}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
                  {tr('Shto, ndrysho, fshi dhe menaxho statuset e publikimit (Draft, Publikuar, Arkivuar) në MySQL.')}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenAdd}
                style={{
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                  padding: '9px 18px',
                  fontWeight: 700,
                  borderRadius: '10px'
                }}
              >
                <Plus size={18} />
                <span>{tr('Shto Biznes të Ri')}</span>
              </button>
            </div>

            {/* Filter Toolbar */}
            <div className="admin-table-card" style={{ marginBottom: '1.5rem' }}>
              <div className="admin-table-toolbar">
                <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
                  {/* Search input */}
                  <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
                    <input
                      type="text"
                      placeholder={tr('Kërko me emër, adresë ose telefon...')}
                      value={searchFilter}
                      onChange={(e) => {
                        setSearchFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="form-input"
                      style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.875rem' }}
                    />
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                      }}
                    />
                  </div>

                  {/* Status filter */}
                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ width: '160px', height: '38px' }}
                  >
                    <option value="all">{tr('Të gjitha statuset')}</option>
                    <option value="published">{tr('Vetëm Publikuar')}</option>
                    <option value="draft">{tr('Vetëm Draft')}</option>
                    <option value="archived">{tr('Vetëm Arkivuar')}</option>
                  </select>

                  {/* Category filter */}
                  <select
                    className="filter-select"
                    value={catFilter}
                    onChange={(e) => {
                      setCatFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ width: '180px', height: '38px' }}
                  >
                    <option value="">{tr('Të gjitha kategoritë')}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
                      {businesses.length} {tr('Biznese')}
                </span>
              </div>

              {/* Data Table me lartësi të kufizuar & scroll të brendshëm */}
              <div className="table-responsive" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="admin-sticky-table-head">{tr('Emri & Detajet')}</th>
                      <th className="admin-sticky-table-head">{tr('Kategoria')}</th>
                      <th className="admin-sticky-table-head">{tr('Vendbanimi')}</th>
                      <th className="admin-sticky-table-head">{tr('Statusi')}</th>
                      <th className="admin-sticky-table-head">{tr('Ndrysho Statusin')}</th>
                      <th className="admin-sticky-table-head" style={{ textAlign: 'right' }}>{tr('Veprime')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.length > 0 ? (
                      businesses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((biz) => (
                        <tr key={biz.id}>
                          <td>
                            <div className="admin-business-name">
                              {biz.name}
                              {biz.featured ? (
                                <span style={{ marginLeft: '6px', fontSize: '0.6875rem', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>
                                  {tr('★ Veçuar')}
                                </span>
                              ) : null}
                            </div>
                            <div className="admin-business-details">
                              {biz.address} {biz.phone ? `• ${biz.phone}` : ''}
                            </div>
                          </td>
                          <td>{biz.category?.name || biz.category_id}</td>
                          <td>{biz.settlement?.name || biz.settlement_id}</td>
                          <td>
                            <span className={`status-badge status-${biz.status}`}>
                              {biz.status === 'published' ? tr('Publikuar') : biz.status === 'draft' ? 'Draft' : tr('Arkivuar')}
                            </span>
                          </td>
                          <td>
                            <select
                              value={biz.status}
                              onChange={(e) => handleStatusChange(biz.id, e.target.value)}
                              className="admin-business-status-select"
                            >
                              <option value="published">{tr('Publikuar')}</option>
                              <option value="draft">Draft</option>
                              <option value="archived">{tr('Arkivuar')}</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <Link
                                to={`/bizneset/${biz.slug || biz.id}`}
                                className="action-icon-btn action-btn-view"
                                title="Shiko profilin"
                              >
                                <Eye size={15} />
                              </Link>
                              <button
                                type="button"
                                className="action-icon-btn action-btn-edit"
                                onClick={() => handleOpenEdit(biz)}
                                title="Ndrysho të dhënat"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn action-btn-delete"
                                onClick={() => handleDeleteBusiness(biz)}
                                title="Fshi biznesin"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="admin-table-empty-cell">
                          Nuk u gjet asnjë biznes me këto kritere filtrimi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {businesses.length > itemsPerPage && (
                <div className="admin-table-pagination">
                  <span className="admin-table-pagination-summary">
                    Duke shfaqur {Math.min((currentPage - 1) * itemsPerPage + 1, businesses.length)} - {Math.min(currentPage * itemsPerPage, businesses.length)} nga gjithsej {businesses.length} biznese
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{ padding: '5px 10px', opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                      <ChevronLeft size={14} />
                      <span>{tr('Para')}</span>
                    </button>

                    {Array.from({ length: Math.ceil(businesses.length / itemsPerPage) }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`admin-page-number${currentPage === pageNum ? ' active' : ''}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setCurrentPage((p) => Math.min(Math.ceil(businesses.length / itemsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(businesses.length / itemsPerPage)}
                      style={{ padding: '5px 10px', opacity: currentPage === Math.ceil(businesses.length / itemsPerPage) ? 0.5 : 1 }}
                    >
                      <span>{tr('Tjetra')}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES & SETTLEMENTS */}
        {activeTab === 'categories' && (
          <div>
            <div className="admin-view-header">
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>
                  {tr('Kategoritë & Vendbanimet')}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
                  {tr('Menaxhoni sektorët ekonomikë dhe lokalitetet në territorin e Lipjanit (me mbrojtje nga fshirja e lidhjeve).')}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingCategory(null);
                  setNewCatName('');
                  setNewCatDesc('');
                  setIsAddingCat(true);
                }}
              >
                <Plus size={16} />
                <span>{tr('Shto Kategori')}</span>
              </button>
            </div>

            {/* Modal për shtim kategorie */}
            {isAddingCat && (
              <div className="modal-overlay" role="dialog" aria-modal="true">
                <div className="modal-box" style={{ maxWidth: '440px' }}>
                  <div className="modal-header">
                    <h3 className="modal-title">{editingCategory ? tr('Ndrysho Kategorinë') : tr('Shto Kategori të Re')}</h3>
                    <button type="button" onClick={() => { setIsAddingCat(false); setEditingCategory(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      &times;
                    </button>
                  </div>
                  <form onSubmit={handleSaveCategory}>
                    <div className="modal-body">
                      <div className="form-group">
                        <label className="form-label">{tr('Emri i Kategorisë *')}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder={tr('p.sh. Sport & Rekreacion')}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{tr('Përshkrimi')}</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={newCatDesc}
                          onChange={(e) => setNewCatDesc(e.target.value)}
                          placeholder={tr('Përshkrim i shkurtër...')}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-outline" onClick={() => { setIsAddingCat(false); setEditingCategory(null); }}>{tr('Anulo')}</button>
                      <button type="submit" className="btn btn-primary">{tr('Ruaj Kategorinë')}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {isAddingSettlement && (
              <div className="modal-overlay" role="dialog" aria-modal="true">
                <div className="modal-box" style={{ maxWidth: '440px' }}>
                  <div className="modal-header">
                    <h3 className="modal-title">{editingSettlement ? tr('Ndrysho Vendbanimin') : tr('Shto Vendbanim të Ri')}</h3>
                    <button type="button" onClick={() => { setIsAddingSettlement(false); setEditingSettlement(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                  </div>
                  <form onSubmit={handleSaveSettlement}>
                    <div className="modal-body">
                      <div className="form-group">
                        <label className="form-label" htmlFor="settlement-name">{tr('Emri i Vendbanimit *')}</label>
                        <input id="settlement-name" type="text" className="form-input" value={newSettlementName} onChange={(event) => setNewSettlementName(event.target.value)} required maxLength={100} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="settlement-type">{tr('Lloji i vendbanimit')}</label>
                        <select id="settlement-type" className="form-select" value={newSettlementIsTown ? 'town' : 'village'} onChange={(event) => setNewSettlementIsTown(event.target.value === 'town')}>
                          <option value="village">{tr('Fshat / Lokalitet')}</option>
                          <option value="town">{tr('Qendër Urbane')}</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="settlement-description">{tr('Përshkrimi')}</label>
                        <textarea id="settlement-description" rows={2} className="form-textarea" value={newSettlementDescription} onChange={(event) => setNewSettlementDescription(event.target.value)} />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-outline" onClick={() => { setIsAddingSettlement(false); setEditingSettlement(null); }}>{tr('Anulo')}</button>
                      <button type="submit" className="btn btn-primary">{tr('Ruaj Vendbanimin')}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {/* Categories Card */}
              <div className="admin-table-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>
                  Kategoritë ({categories.length})
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{tr('Emri në tabelë')}</th>
                        <th>{tr('Biznese')}</th>
                        <th style={{ textAlign: 'right' }}>{tr('Veprime')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {c.id}</div>
                          </td>
                          <td><span className="cat-count">{c.businesses_count ?? 0}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ marginRight: '6px' }}
                              onClick={() => {
                                setEditingCategory(c);
                                setNewCatName(c.name || '');
                                setNewCatDesc(c.description || '');
                                setIsAddingCat(true);
                              }}
                              title={tr('Ndrysho Kategorinë')}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                              onClick={() => handleDeleteCategory(c)}
                              title="Fshi kategorinë"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Settlements Card */}
              <div className="admin-table-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                  <span>Vendbanimet ({settlements.length})</span>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => {
                    setEditingSettlement(null);
                    setNewSettlementName('');
                    setNewSettlementDescription('');
                    setNewSettlementIsTown(false);
                    setIsAddingSettlement(true);
                  }}><Plus size={14} /> {tr('Shto Vendbanim')}</button>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{tr('Vendbanimi')}</th>
                        <th>{tr('Lloji')}</th>
                        <th>{tr('Biznese')}</th>
                        <th>{tr('Veprime')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlements.map((s) => (
                        <tr key={s.id}>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.is_town ? 'Qendër Urbane' : 'Fshat / Lokalitet'}</td>
                          <td><span className="cat-count">{s.businesses_count ?? 0}</span></td>
                          <td>
                            <button type="button" className="btn btn-outline btn-sm" title={tr('Ndrysho Vendbanimin')} onClick={() => {
                              setEditingSettlement(s);
                              setNewSettlementName(s.name || '');
                              setNewSettlementDescription(s.description || '');
                              setNewSettlementIsTown(Boolean(s.is_town));
                              setIsAddingSettlement(true);
                            }}><Edit2 size={13} /></button>
                            <button type="button" className="btn btn-outline btn-sm" title={tr('Fshi vendbanimin')} style={{ marginLeft: '6px', color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => handleDeleteSettlement(s)}><Trash2 size={13} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ADVERTISEMENTS (4 statuset) */}
        {activeTab === 'ads' && (
          <div>
            <div className="admin-view-header">
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>
                  {tr('Reklamat & Bannerët Promovues')}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
                  {tr('Menaxhoni fushatat me të 4 statuset (Active, Scheduled, Expired, Disabled) dhe kontrollet e kohës.')}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddingAd(true)}
              >
                <Plus size={16} />
                <span>{tr('Krijo Reklamë')}</span>
              </button>
            </div>

            {/* Modal për krijim reklame */}
            {isAddingAd && (
              <div className="modal-overlay" role="dialog" aria-modal="true">
                <div className="modal-box" style={{ maxWidth: '520px' }}>
                  <div className="modal-header">
                    <h3 className="modal-title">{tr('Krijo Reklamë të Re')}</h3>
                    <button type="button" onClick={() => setIsAddingAd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      &times;
                    </button>
                  </div>
                  <form onSubmit={handleAddAdvertisement}>
                    <div className="modal-body">
                      <div className="form-group">
                        <label className="form-label">{tr('Titulli i Reklamës *')}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newAdTitle}
                          onChange={(e) => setNewAdTitle(e.target.value)}
                          required
                          placeholder={tr('p.sh. Ofertë Speciale Dimërore')}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{tr('Sponsori / Kompania *')}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newAdSponsor}
                          onChange={(e) => setNewAdSponsor(e.target.value)}
                          required
                          placeholder={tr('p.sh. Auto Servis Ulpiana')}
                        />
                      </div>
                      <div className="form-row-2">
                        <div className="form-group">
                          <label className="form-label">{tr('Pozicioni *')}</label>
                          <select
                            className="form-select"
                            value={newAdPlacement}
                            onChange={(e) => setNewAdPlacement(e.target.value)}
                          >
                            <option value="banner-home">{tr('Ballinë (banner-home)')}</option>
                            <option value="banner-catalog">{tr('Katalog (banner-catalog)')}</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">{tr('Statusi *')}</label>
                          <select
                            className="form-select"
                            value={newAdStatus}
                            onChange={(e) => setNewAdStatus(e.target.value)}
                          >
                            <option value="active">{language === 'en' ? 'Active' : 'Aktive'}</option>
                            <option value="scheduled">{language === 'en' ? 'Scheduled' : 'E planifikuar'}</option>
                            <option value="expired">{language === 'en' ? 'Expired' : 'E skaduar'}</option>
                            <option value="disabled">{language === 'en' ? 'Disabled' : 'E çaktivizuar'}</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row-2">
                        <div className="form-group">
                          <label className="form-label">{tr('Data Fillimit *')}</label>
                          <input
                            type="datetime-local"
                            className="form-input"
                            value={newAdStart}
                            onChange={(e) => setNewAdStart(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">{tr('Data Mbarimit *')}</label>
                          <input
                            type="datetime-local"
                            className="form-input"
                            value={newAdEnd}
                            onChange={(e) => setNewAdEnd(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">{tr('Prioriteti (numër më i madh = prioritet më i lartë)')}</label>
                        <input
                          type="number"
                          className="form-input"
                          value={newAdPriority}
                          onChange={(e) => setNewAdPriority(e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-outline" onClick={() => setIsAddingAd(false)}>{tr('Anulo')}</button>
                      <button type="submit" className="btn btn-primary">{tr('Ruaj Reklamën')}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="admin-table-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{tr('Titulli & Sponsori')}</th>
                      <th>{tr('Pozicioni')}</th>
                      <th>{tr('Prioriteti')}</th>
                      <th>{tr('Statusi')}</th>
                      <th>{tr('Ndrysho Statusin')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advertisements.map((ad) => (
                      <tr key={ad.id}>
                        <td>
                          <strong>{ad.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sponsor: {ad.sponsor}</div>
                        </td>
                        <td><code>{ad.placement}</code></td>
                        <td><strong>{ad.priority}</strong></td>
                        <td>
                          <span className={`status-badge ${
                            ad.status === 'active' ? 'status-published' :
                            ad.status === 'scheduled' ? 'status-draft' :
                            'status-archived'
                          }`}>
                            {ad.status === 'active' ? tr('Aktive') :
                             ad.status === 'scheduled' ? tr('E planifikuar') :
                             ad.status === 'expired' ? tr('E skaduar') : tr('E çaktivizuar')}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleToggleAdStatus(ad)}
                          >
                            {ad.status === 'active' ? tr('Çaktivizo') : tr('Aktivizo')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PROFILI IM */}
        {activeTab === 'profile' && (
          <AdminProfile
            adminUser={adminUser}
            onBack={() => setActiveTab('dashboard')}
            onLogout={handleLogout}
            onUserUpdate={(updatedUser) => {
              setAdminUser(updatedUser);
              authStorage.setUser(updatedUser);
            }}
            addToast={addToast}
          />
        )}
      </main>

      {/* Add / Edit Business Modal */}
      <BusinessModal
        isOpen={isBusinessModalOpen}
        business={editingBusiness}
        categories={categories}
        settlements={settlements}
        onSave={handleSaveBusiness}
        onClose={() => {
          setIsBusinessModalOpen(false);
          setEditingBusiness(null);
        }}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDanger={true}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
