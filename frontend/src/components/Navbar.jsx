import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Building2, Menu, X, PlusCircle, ShieldCheck, MapPin, Grid, Moon, Sun, Bot } from 'lucide-react';
import { useTheme } from '../contexts/useTheme';
import { useLanguage } from '../contexts/useLanguage';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, tr } = useLanguage();

  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Demo Notice Top Banner */}
      <div className="demo-notice-bar">
        <div className="container demo-notice-content">
          <span className="demo-badge-pill">{tr('Demo Publike')}</span>
          <span>{tr('Portali zyrtar i katalogut të bizneseve në Komunën e Lipjanit (Të dhëna demonstrative).')}</span>
        </div>
      </div>

      <header className="site-navbar">
        <div className="container navbar-inner">
          {/* Brand Logo */}
          <Link to="/" className="brand-link" onClick={closeMobile}>
            <div className="brand-icon-box">
              <Building2 size={24} />
            </div>
            <div className="brand-text-col">
              <span className="brand-title">Katalogu <span>Lipjan</span></span>
              <span className="brand-subtitle">{tr('Komuna e Lipjanit')}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label={tr('Navigimi kryesor')}>
            <ul className="nav-links-desktop">
              <li>
                <NavLink to="/" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`} end>
                  {t('home')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/bizneset" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
                  {t('businesses')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/kategorite" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
                  {t('categories')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/vendbanimet" className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}>
                  {t('settlements')}
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Action Buttons */}
          <div className="navbar-actions">
            <button
              onClick={toggleTheme}
              className="btn btn-glass btn-sm"
              title={theme === 'dark' ? tr('Ndrysho në dritë') : tr('Ndrysho në errësirë')}
              aria-label={tr('Ndrysho temën')}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <label className="language-picker" aria-label={t('language')}>
              <span className="sr-only">{t('language')}</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option value="sq">Shqip</option>
                <option value="en">English</option>
              </select>
            </label>
            <Link to="/shto-biznes" className="btn btn-primary btn-sm">
              <PlusCircle size={16} />
              <span>{t('addBusiness')}</span>
            </Link>
            <Link to="/admin" className="btn btn-glass btn-sm" title="Paneli i Administrimit (Demo)">
              <ShieldCheck size={16} />
              <span>{language === 'en' ? 'Admin panel' : 'Admin UI'}</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              className="mobile-toggle-btn"
              onClick={toggleMobile}
              aria-label={mobileOpen ? tr('Mbyll menynë') : tr('Hap menynë')}
            >
              {mobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <div className={`mobile-menu-drawer ${mobileOpen ? 'open' : ''}`}>
          <ul className="mobile-nav-list">
            <li>
              <NavLink to="/" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile} end>
                <Building2 size={18} />
                {t('home')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/bizneset" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Grid size={18} />
                {t('businesses')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/kategorite" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <Grid size={18} />
                {t('categories')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/vendbanimet" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <MapPin size={18} />
                {t('settlements')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/shto-biznes" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <PlusCircle size={18} />
                Regjistro Biznes
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
                <ShieldCheck size={18} />
                {t('admin')}
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                className="mobile-nav-link mobile-ai-link"
                onClick={() => {
                  closeMobile();
                  window.dispatchEvent(new Event('katalogu:open-ai-assistant'));
                }}
              >
                <Bot size={18} />
                {t('aiAssistant')}
              </button>
            </li>
          </ul>
        </div>
      </header>
    </>
  );
}
