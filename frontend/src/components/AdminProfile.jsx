import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle,
  Edit2,
  Lock,
  ArrowLeft,
  Save,
  X,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Activity,
  Camera,
  Upload,
  Bell,
  BellOff,
  UserCheck,
  FileText,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, authStorage } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminProfile({ adminUser, onBack, onLogout, onUserUpdate, addToast }) {
  const { t, tr, language } = useLanguage();
  // Profile data from API
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // View modes
  const [activeView, setActiveView] = useState('view'); // 'view' | 'edit' | 'password' | 'settings'

  // Edit Profile state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState(null);
  const [passSuccess, setPassSuccess] = useState(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const clearPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPassError(null);
    setPassSuccess(null);
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
  };

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email_updates: true,
    security_alerts: true,
    system_news: false
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load profile from API
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await api.admin.getProfile();
      setProfile(res.user);
      setEditName(res.user.name || '');
      setEditEmail(res.user.email || '');
      setEditPhone(res.user.phone || '');
      setEditBio(res.user.bio || '');
      setAvatarPreview(res.user.avatar_url || null);
      if (res.user.notification_preferences) {
        setNotifications(res.user.notification_preferences);
      }
    } catch (err) {
      addToast?.('Dështoi ngarkimi i profilit.', 'error');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addToast?.('Fotoja e profilit nuk mund të jetë më e madhe se 5MB.', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        addToast?.('Ju lutem ngarkoni një foto të vlefshme.', 'error');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Handle Edit Profile submit
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);
    setIsSavingProfile(true);

    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('email', editEmail.trim());
      formData.append('phone', editPhone.trim());
      formData.append('bio', editBio.trim());
      Object.entries(notifications).forEach(([key, value]) => formData.append(`notification_preferences[${key}]`, String(value)));
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await api.admin.updateProfile(formData);
      setProfile(prev => ({ ...prev, ...res.user }));
      setEditSuccess(res.message || 'Profili u përditësua me sukses.');
      addToast?.('Profili u përditësua me sukses!', 'success');

      // Update local storage and parent component
      if (res.user) {
        authStorage.setUser(res.user);
        onUserUpdate?.(res.user);
      }

      setAvatarFile(null);
      setTimeout(() => setActiveView('view'), 1500);
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Dështoi përditësimi i profilit.';
      setEditError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Change Password submit
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword !== confirmPassword) {
      setPassError('Konfirmimi i fjalëkalimit nuk përputhet me fjalëkalimin e ri.');
      return;
    }

    if (newPassword.length < 8) {
      setPassError('Fjalëkalimi i ri duhet të ketë së paku 8 karaktere.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await api.admin.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      setPassSuccess(res.message || 'Fjalëkalimi u ndryshua me sukses.');
      addToast?.('Fjalëkalimi u ndryshua me sukses!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => setActiveView('view'), 1500);
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Dështoi ndryshimi i fjalëkalimit.';
      setPassError(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle settings save
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await api.admin.updateProfile({
        notification_preferences: notifications
      });
      setProfile(prev => ({ ...prev, ...res.user }));
      addToast?.('Preferencat u ruajtën me sukses!', 'success');
      setTimeout(() => setActiveView('view'), 1000);
    } catch (err) {
      addToast?.('Dështoi ruajtja e preferencave.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'en' ? 'en-US' : 'sq-AL', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Loading state
  if (isLoadingProfile) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: '12px', color: 'var(--text-muted)'
      }}>
        <Loader2 size={24} className="animate-spin" />
        <span style={{ fontSize: '1rem', fontWeight: 500 }}>{t('loading')}</span>
      </div>
    );
  }

  const displayUser = profile || adminUser || {};

  return (
    <div className="admin-profile-page" style={{ maxWidth: '980px', margin: '0 auto', padding: '1rem 0.5rem' }}>
      {/* Header with Back button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-profile-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.625rem 1rem',
            borderRadius: 'var(--radius-md)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <ArrowLeft size={16} />
          {t('backDashboard')}
        </motion.button>

        <motion.button
          type="button"
          onClick={onLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--color-danger)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.625rem 1rem',
            borderRadius: 'var(--radius-md)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <LogOut size={14} />
          {t('logout')}
        </motion.button>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card admin-profile-overview"
        style={{
          marginBottom: '1.5rem',
          overflow: 'hidden'
        }}
      >
        {/* Top Banner */}
        <div className="admin-profile-banner" style={{
          background: 'var(--gradient-primary)',
          padding: '3rem 2rem 4rem',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--gradient-glow)',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Avatar + Info */}
        <div className="admin-profile-details" style={{ padding: '0 2rem 2rem', marginTop: '-4rem', position: 'relative', zIndex: 1 }}>
          <div className="admin-profile-info-grid" style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1.5rem',
            flexWrap: 'wrap',
            marginBottom: '2rem'
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div
                className="admin-profile-avatar"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: 'var(--radius-xl)',
                  background: avatarPreview
                    ? `url(${avatarPreview}) center/cover`
                    : 'var(--gradient-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'white',
                  border: '4px solid ' + (avatarPreview ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'),
                  boxShadow: 'var(--shadow-glow)',
                  letterSpacing: '1px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  overflow: 'hidden'
                }}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              >
                {avatarPreview ? '' : getInitials(displayUser.name)}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Name + Role */}
            <div style={{ flex: 1, minWidth: '200px', paddingBottom: '4px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.3
              }}>
                {displayUser.name || 'Administrator'}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '8px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  padding: '0.375rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backdropFilter: 'blur(8px)'
                }}>
                  <Shield size={12} />
                  {displayUser.role || 'admin'}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '0.375rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backdropFilter: 'blur(8px)'
                }}>
                  <Activity size={11} />
                  {t('active')}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="admin-profile-action-list" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <InfoCard icon={<Mail size={16} />} label={t('emailLabel')} value={displayUser.email} />
            <InfoCard icon={<Phone size={16} />} label={t('phone')} value={displayUser.phone || t('noPhone')} />
            <InfoCard icon={<User size={16} />} label={t('fullName')} value={displayUser.name} />
            <InfoCard icon={<Calendar size={16} />} label={t('createdAt')} value={formatDate(displayUser.created_at)} />
          </div>

          {/* Bio */}
          {displayUser.bio && (
            <div style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '2rem',
              fontStyle: 'italic',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              {displayUser.bio}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <ActionBtn
              icon={<Edit2 size={15} />}
              label={t('editProfile')}
              isActive={activeView === 'edit'}
              onClick={() => { setActiveView('edit'); setEditError(null); setEditSuccess(null); }}
              color="cyan"
            />
            <ActionBtn
              icon={<KeyRound size={15} />}
              label={t('changePassword')}
              isActive={activeView === 'password'}
              onClick={() => { clearPasswordForm(); setActiveView('password'); }}
              color="violet"
            />
            <ActionBtn
              icon={<Settings size={15} />}
              label={t('preferences')}
              isActive={activeView === 'settings'}
              onClick={() => { setActiveView('settings'); }}
              color="blue"
            />
          </div>
        </div>
      </motion.div>

      {/* === EDIT PROFILE FORM === */}
      <AnimatePresence>
        {activeView === 'edit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card admin-profile-panel admin-profile-edit"
            style={{ padding: '2rem' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: 0
              }}>
                <Edit2 size={20} color="var(--text-accent)" />
                {t('editProfile')}
              </h3>
              <motion.button
                type="button"
                onClick={() => setActiveView('view')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <X size={18} />
              </motion.button>
            </div>

            <AnimatePresence>
              {editError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: 'var(--color-danger-bg)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    color: 'var(--color-danger)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertTriangle size={18} />
                  {editError}
                </motion.div>
              )}
              {editSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: 'var(--color-success-bg)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    color: 'var(--color-success)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle size={18} />
                  {editSuccess}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>{t('profilePicture')}</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-glow)';
                  e.currentTarget.style.background = 'rgba(34, 211, 238, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                  <Upload size={20} color="var(--text-accent)" />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {avatarFile ? avatarFile.name : t('uploadPicture')}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>{t('fullName')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder={language === 'en' ? 'First and last name' : 'Emri Mbiemri'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>{t('email')}</label>
                <input
                  type="email"
                  className="form-input"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  maxLength={150}
                  placeholder={language === 'en' ? 'email@example.com' : 'email@shembull.com'}
                />
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {t('emailUnique')}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>{t('phone')}</label>
                <input
                  type="tel"
                  className="form-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  maxLength={20}
                  placeholder="+383 XX XXX XXX"
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>{t('personalBio')}</label>
                <textarea
                  className="form-textarea"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={500}
                  placeholder={language === 'en' ? 'Write a short introduction about yourself...' : 'Shkruani diçka të shkurtër rreth vetes...'}
                  rows={3}
                />
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {editBio.length}/500 karaktere
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <motion.button
                  type="button"
                  onClick={() => setActiveView('view')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  Anulo
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSavingProfile}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    border: 'none',
                    background: 'var(--gradient-secondary)',
                    color: 'white',
                    cursor: isSavingProfile ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-glow-sm)',
                    opacity: isSavingProfile ? 0.7 : 1,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {isSavingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {isSavingProfile ? t('saving') : t('saveChanges')}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === CHANGE PASSWORD FORM === */}
      <AnimatePresence>
        {activeView === 'password' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card admin-profile-panel admin-profile-password"
            style={{ padding: '2rem' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: 0
              }}>
                <KeyRound size={20} color="var(--text-accent)" />
                Ndrysho Fjalëkalimin
              </h3>
              <motion.button
                type="button"
                disabled={isSavingPassword}
                onClick={() => { clearPasswordForm(); setActiveView('view'); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <X size={18} />
              </motion.button>
            </div>

            <AnimatePresence>
              {passError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: 'var(--color-danger-bg)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    color: 'var(--color-danger)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertTriangle size={18} />
                  {tr(passError)}
                </motion.div>
              )}
              {passSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: 'var(--color-success-bg)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    color: 'var(--color-success)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle size={18} />
                  {tr(passSuccess)}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleChangePassword} autoComplete="off">
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="admin-current-password" style={labelStyle}>{tr('Fjalëkalimi aktual')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-current-password"
                    name="admin-current-password"
                    type={showCurrentPass ? 'text' : 'password'}
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder={tr('Shkruani fjalëkalimin aktual')}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    style={eyeBtnStyle}
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="admin-new-password" style={labelStyle}>{tr('Fjalëkalimi i ri')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-new-password"
                    name="admin-new-password"
                    type={showNewPass ? 'text' : 'password'}
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder={tr('Së paku 8 karaktere')}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={eyeBtnStyle}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {newPassword.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{
                      height: '4px',
                      borderRadius: '2px',
                      background: 'var(--bg-tertiary)',
                      overflow: 'hidden'
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: newPassword.length < 8 ? '25%' :
                                 newPassword.length < 12 ? '50%' :
                                 /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? '100%' : '75%',
                          background: newPassword.length < 8 ? 'var(--color-danger)' :
                                      newPassword.length < 12 ? 'var(--color-warning)' :
                                      /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'var(--color-success)' : 'var(--color-info)',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      marginTop: '0.5rem',
                      color: newPassword.length < 8 ? 'var(--color-danger)' : 'var(--text-muted)'
                    }}>
                      {newPassword.length < 8 ? 'Shumë i shkurtër — nevojiten së paku 8 karaktere' :
                       newPassword.length < 12 ? 'I mirë — shtoni karaktere të mëdha dhe numra' :
                       'I fortë — fjalëkalim i sigurt'}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label htmlFor="admin-confirm-password" style={labelStyle}>{tr('Konfirmo fjalëkalimin e ri')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-confirm-password"
                    name="admin-confirm-password"
                    type={showConfirmPass ? 'text' : 'password'}
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder={tr('Konfirmo fjalëkalimin e ri')}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    style={eyeBtnStyle}
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <motion.button
                  type="button"
                  disabled={isSavingPassword}
                  onClick={() => { clearPasswordForm(); setActiveView('view'); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  Anulo
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSavingPassword}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    border: 'none',
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    cursor: isSavingPassword ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-glow-sm)',
                    opacity: isSavingPassword ? 0.7 : 1,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {isSavingPassword ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                  {isSavingPassword ? 'Po ndryshohet...' : 'Ndrysho Fjalëkalimin'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === NOTIFICATION PREFERENCES === */}
      <AnimatePresence>
        {activeView === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card admin-profile-panel admin-profile-settings"
            style={{ padding: '2rem' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: 0
              }}>
                <Settings size={20} color="var(--text-accent)" />
                {t('notificationSettings')}
              </h3>
              <motion.button
                type="button"
                onClick={() => setActiveView('view')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <X size={18} />
              </motion.button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <NotificationToggle
                icon={<Mail size={20} />}
                label={t('systemUpdates')}
                checked={notifications.email_updates}
                onChange={(checked) => setNotifications(prev => ({ ...prev, email_updates: checked }))}
                description={t('profileUpdateEmails')}
              />
              <NotificationToggle
                icon={<Shield size={20} />}
                label={t('securityNotices')}
                checked={notifications.security_alerts}
                onChange={(checked) => setNotifications(prev => ({ ...prev, security_alerts: checked }))}
                description={t('securityEmails')}
              />
              <NotificationToggle
                icon={<Bell size={20} />}
                label={t('systemNews')}
                checked={notifications.system_news}
                onChange={(checked) => setNotifications(prev => ({ ...prev, system_news: checked }))}
                description={t('systemNewsDescription')}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <motion.button
                type="button"
                onClick={() => setActiveView('view')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'self 0.875rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {t('cancel')}
              </motion.button>
              <motion.button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  border: 'none',
                  background: 'var(--gradient-secondary)',
                  color: 'white',
                  cursor: isSavingSettings ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-glow-sm)',
                  opacity: isSavingSettings ? 0.7 : 1,
                  transition: 'all var(--transition-fast)'
                }}
              >
                {isSavingSettings ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {isSavingSettings ? t('saving') : t('savePreferences')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
function InfoCard({ icon, label, value }) {
  return (
    <div className="admin-profile-info-card" style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '1rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      transition: 'all var(--transition-fast)'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(34, 211, 238, 0.1)',
        color: 'var(--text-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2px' }}>
          {label}
        </div>
        <div style={{
          fontSize: '0.9375rem',
          color: 'var(--text-primary)',
          fontWeight: 600,
          wordBreak: 'break-word'
        }}>
          {value || 'N/A'}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, isActive, onClick, color }) {
  const colorStyles = {
    cyan: {
      bg: isActive ? 'var(--gradient-secondary)' : 'transparent',
      border: isActive ? 'transparent' : 'var(--border-color)',
      color: isActive ? 'white' : 'var(--text-primary)',
      hoverBg: 'rgba(34, 211, 238, 0.1)'
    },
    violet: {
      bg: isActive ? 'var(--gradient-primary)' : 'transparent',
      border: isActive ? 'transparent' : 'var(--border-color)',
      color: isActive ? 'white' : 'var(--text-primary)',
      hoverBg: 'rgba(139, 92, 246, 0.1)'
    },
    blue: {
      bg: isActive ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
      border: isActive ? 'transparent' : 'var(--border-color)',
      color: isActive ? 'white' : 'var(--text-primary)',
      hoverBg: 'rgba(59, 130, 246, 0.1)'
    }
  };

  const styles = colorStyles[color] || colorStyles.cyan;

  return (
    <motion.button
      type="button"
      className={`admin-profile-action-btn${isActive ? ' is-active' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0.625rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        fontWeight: 600,
        border: '1px solid ' + styles.border,
        background: styles.bg,
        color: styles.color,
        cursor: 'pointer',
        transition: 'all var(--transition-fast)'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = styles.hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = styles.bg;
        }
      }}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function NotificationToggle({ icon, label, description, checked, onChange }) {
  return (
    <div className="admin-profile-notification" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      transition: 'all var(--transition-fast)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(34, 211, 238, 0.1)',
          color: 'var(--text-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
            {label}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {description}
          </div>
        </div>
      </div>
      <motion.button
        type="button"
        onClick={() => onChange(!checked)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          width: '48px',
        height: '26px',
        borderRadius: '13px',
          background: checked ? 'var(--gradient-secondary)' : 'var(--bg-tertiary)',
          border: '1px solid ' + (checked ? 'transparent' : 'var(--border-color)'),
          color: checked ? 'white' : 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: checked ? 'flex-start' : 'center',
          padding: 0
        }}
      >
        {checked ? <CheckCircle size={14} style={{ marginLeft: '4px' }} /> : ''}
      </motion.button>
    </div>
  );
}

// Inline styles
const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '0.5rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
  fontSize: '0.9375rem',
  outline: 'none',
  transition: 'all var(--transition-fast)'
};

const eyeBtnStyle = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  transition: 'all var(--transition-fast)'
};

eyeBtnStyle[':hover'] = {
  color: 'var(--text-primary)'
};
