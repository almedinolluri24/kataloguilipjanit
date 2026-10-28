import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import BusinessCard from '../components/BusinessCard';
import AdvertisementBanner from '../components/AdvertisementBanner';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const ParticleBackground = lazy(() => import('../components/ParticleBackground'));

export default function Home() {
  const { tr, language } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [cats, sets, bizRes] = await Promise.all([
        api.public.getCategories(),
        api.public.getSettlements(),
        api.public.getBusinesses({ sort: 'latest' })
      ]);
      setCategories(cats || []);
      setSettlements(sets || []);
      setBusinesses(bizRes.data || []);
    } catch {
      setLoadError(language === 'en'
        ? 'The directory could not be loaded. Check your connection and try again.'
        : 'Katalogu nuk u ngarkua. Kontrolloni lidhjen dhe provoni përsëri.');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Featured businesses (up to 4)
  const featuredBusinesses = businesses
    .filter((b) => b.featured)
    .slice(0, 4);

  const displayBusinesses = featuredBusinesses.length >= 3
    ? featuredBusinesses
    : businesses.slice(0, 4);

  const handleSearch = (term) => {
    if (term) {
      navigate(`/bizneset?kerko=${encodeURIComponent(term)}`);
    } else {
      navigate('/bizneset');
    }
  };

  const handleSettlementClick = (settlementId) => {
    navigate(`/bizneset?vendbanimi=${encodeURIComponent(settlementId)}`);
  };

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-wrapper">
        <Suspense fallback={null}><ParticleBackground /></Suspense>
        <div className="container hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-tag"
          >
            <Sparkles size={16} />
            <span>{tr('Katalogu Zyrtar Digjital')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-title"
          >
            {tr('Zbulo')} <span>{tr('bizneset e Lipjanit')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-desc"
          >
            {tr('Platformë full stack për gjetjen e bizneseve, shërbimeve dhe kontakteve në komunën e Lipjanit.')}
          </motion.p>

          {/* Central Search Component (Enter ose Buton) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <SearchBar
              placeholder={tr('Kërko biznes ose shërbim...')}
              onSearch={handleSearch}
            />
          </motion.div>

          {/* Quick Settlement Shortcut Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="quick-settlements-row"
          >
            <span className="quick-label">{tr('Vendbanime të shpeshta:')}</span>
            {settlements.slice(0, 6).map((s) => (
              <button
                key={s.id}
                type="button"
                className="quick-pill"
                onClick={() => handleSettlementClick(s.id)}
              >
                {s.name}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {loadError && (
        <div className="container" role="alert" style={{ paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', padding: '1rem 1.25rem', border: '1px solid #fecaca', borderRadius: '12px', background: 'var(--bg-card)', color: '#b91c1c' }}>
            <AlertCircle size={18} />
            <span>{loadError}</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={loadHomeData} disabled={isLoading}>
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              {tr('Rifresko')}
            </button>
          </div>
        </div>
      )}

      {/* Popular Categories Section */}
      <section style={{ padding: '3rem 0 2rem' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <div className="section-title-wrap">
              <h2>{tr('Eksploro sipas Kategorive')}</h2>
              <p>{tr('Zgjidhni sektorin e dëshiruar për të parë bizneset përkatëse në Lipjan.')}</p>
            </div>
            <Link to="/kategorite" className="section-action-link">
              <span>{tr('Të gjitha kategoritë')}</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <Loader2 className="animate-spin" size={32} color="#22d3ee" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="category-grid home-category-grid"
            >
              {categories.slice(0, 8).map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <CategoryCard category={cat} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Mid-Page Advertisement Banner (Home placement) */}
      <section style={{ padding: '1rem 0 2rem' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <AdvertisementBanner placement="banner-home" />
          </motion.div>
        </div>
      </section>

      {/* Featured Businesses Section */}
      <section style={{ padding: '1.5rem 0 3rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-header"
          >
            <div className="section-title-wrap">
              <h2>{tr('Biznese të Përzgjedhura & Rekomanduara')}</h2>
              <p>{tr('Disa nga ndërmarrjet me shërbime cilësore në regjionin e Lipjanit.')}</p>
            </div>
            <Link to="/bizneset" className="section-action-link">
              <span>{tr('Shiko katalogun e plotë')}</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <Loader2 className="animate-spin" size={32} color="#22d3ee" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="business-grid home-business-grid"
            >
              {displayBusinesses.map((b, index) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <BusinessCard business={b} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Features & Trust Pillars */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}
          >
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              {tr('Pse të përdorni Katalogun e Lipjanit?')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              {tr("Platformë e ndërtuar për t'ju lidhur shpejt dhe saktë me ofertën e gjerë të shërbimeve vendore.")}
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              {
                icon: ShieldCheck,
                bg: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                title: tr('Informata të Verifikuara'),
                desc: tr('Numra telefoni të saktë, orare pune të verifikuara dhe adresa fizike të kontrolluara në terren.')
              },
              {
                icon: MapPin,
                bg: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                title: tr('Harta Interaktive me Pin'),
                desc: tr('Gjeni menjëherë lokacionin ekzakt përmes OpenStreetMap / Leaflet dhe udhëzimeve direkte të lëvizjes.')
              },
              {
                icon: TrendingUp,
                bg: 'rgba(139, 92, 246, 0.1)',
                color: '#8b5cf6',
                title: tr('Mbështetje Ekonomisë Lokale'),
                desc: tr('Promovojmë prodhuesit, zejtarët dhe ndërmarrjet e vogla në qytet dhe në të gjitha fshatrat e komunës.')
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{ background: 'var(--bg-card)', backdropFilter: 'var(--glass-blur)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: feature.bg, color: feature.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <feature.icon size={26} />
                </div>
                <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
