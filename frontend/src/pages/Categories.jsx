import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingBag,
  Car,
  HeartPulse,
  Laptop,
  Hammer,
  Sparkles,
  Briefcase,
  Layers,
  ArrowRight,
  Search,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const ICON_MAP = {
  UtensilsCrossed,
  ShoppingBag,
  Car,
  HeartPulse,
  Laptop,
  Hammer,
  Sparkles,
  Briefcase,
  Layers
};

export default function Categories() {
  const { tr } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [loadError, setLoadError] = useState('');

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await api.public.getCategories();
      setCategories(data || []);
    } catch {
      setLoadError('Kategoritë nuk u ngarkuan. Kontrolloni lidhjen dhe provoni përsëri.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const normalizeSearch = (value) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();
  const normalizedQuery = normalizeSearch(filterQuery.trim());
  const filteredCategories = categories.filter((category) =>
    normalizeSearch(category.name || '').includes(normalizedQuery) ||
    normalizeSearch(category.description || '').includes(normalizedQuery)
  );

  return (
    <div className="categories-page" style={{ padding: '1.5rem 0 2.5rem' }}>
      <div className="container">
        {/* Page Title & Filter */}
        <div className="categories-page-header" style={{ maxWidth: '750px', marginBottom: '1.5rem' }}>
          <div className="categories-page-eyebrow" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <Layers size={14} />
            <span>{tr('Sektorët Ekonomikë')}</span>
          </div>

          <h1 className="categories-page-title" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            {tr('Kategoritë e Bizneseve në Lipjan')}
          </h1>
          <p className="categories-page-description" style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {tr('Shfletoni të gjitha fushat kryesore të veprimtarisë ekonomike, tregtisë, gastronomisë dhe shërbimeve profesionale në Komunën e Lipjanit me të dhëna në kohë reale.')}
          </p>

          {/* Quick filter box */}
          <div className="categories-search" style={{ position: 'relative', maxWidth: '480px' }}>
            <input
              type="text"
              placeholder={tr('Filtro kategoritë (p.sh. Auto, Ushqimore, Shëndetësi)...')}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.75rem', height: '48px', fontSize: '1rem' }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}
            />
          </div>
        </div>

        {/* Categories Grid */}
        {loadError ? (
          <div role="alert" style={{ padding: '1.25rem', border: '1px solid #fecaca', borderRadius: '12px', color: '#b91c1c' }}>
            <p>{loadError}</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={loadCategories} disabled={isLoading}>
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> {tr('Rifresko')}
            </button>
          </div>
        ) : isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <Loader2 className="animate-spin" size={36} color="#0d9488" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          filteredCategories.length === 0 ? (
            <div role="status" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>{filterQuery ? tr('Nuk u gjet asnjë kategori për këtë kërkim.') : tr('Nuk ka kategori për t’u shfaqur.')}</p>
              {filterQuery && <button type="button" className="btn btn-outline btn-sm" onClick={() => setFilterQuery('')}>{tr('Pastro kërkimin')}</button>}
            </div>
          ) : (
          <div className="category-showcase-grid">
            {filteredCategories.map((c) => {
              const IconComp = ICON_MAP[c.icon] || Layers;
              const count = c.businesses_count !== undefined ? c.businesses_count : 0;

              return (
                <Link
                  key={c.id}
                  to={`/bizneset?kategoria=${encodeURIComponent(c.id)}`}
                  className="category-showcase-card"
                  style={{ '--category-accent': c.color || '#0d9488' }}
                >
                  <div className="category-showcase-top">
                    <div className="category-showcase-icon">
                      <IconComp size={26} />
                    </div>

                    <span className="category-showcase-count">
                      {count} {tr('Biznese')}
                    </span>
                  </div>

                  <h3 className="category-showcase-title">
                    {c.name}
                  </h3>

                  <p className="category-showcase-description">
                    {c.description || tr('Shërbime të specializuara në territorin e Komunës së Lipjanit.')}
                  </p>

                  <div className="category-showcase-action">
                    <span>{tr('Eksploro bizneset')}</span>
                    <ArrowRight size={15} />
                  </div>
                </Link>
              );
            })}
          </div>
          )
        )}
      </div>
    </div>
  );
}
