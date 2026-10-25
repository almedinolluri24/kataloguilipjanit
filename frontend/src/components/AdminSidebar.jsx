import React from 'react';
import {
  LayoutDashboard,
  Store,
  Layers,
  Megaphone,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  UserCheck,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminSidebar({ activeTab, onSelectTab, onLogout, adminUser }) {
  const { t, tr } = useLanguage();
  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'businesses', label: t('manageBusinesses'), icon: Store },
    { id: 'categories', label: t('manageCategories'), icon: Layers },
    { id: 'ads', label: t('ads'), icon: Megaphone },
    { id: 'profile', label: t('profile'), icon: User }
  ];

  return (
    <aside className="admin-sidebar" aria-label={tr('Menyja e Administrimit')}>
      <div style={{ paddingBottom: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14b8a6', marginBottom: '4px' }}>
          <ShieldCheck size={22} />
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>Paneli Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#94a3b8', fontSize: '0.8125rem' }}>
          <UserCheck size={14} color="#14b8a6" />
          <span>{adminUser?.email}</span>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onSelectTab(item.id); }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          onClick={onLogout}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.15s ease'
          }}
          title="Dil nga paneli i administratorit"
        >
          <LogOut size={15} />
          <span>{t('logout')}</span>
        </button>

        <Link
          to="/"
          style={{
            color: '#94a3b8',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 4px',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={14} />
          <span>{t('public')}</span>
        </Link>
      </div>
    </aside>
  );
}
