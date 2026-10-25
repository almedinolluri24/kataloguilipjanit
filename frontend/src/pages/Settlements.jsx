import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Search, Building2, Info, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function Settlements() {
  const { tr } = useLanguage();
  const [settlements, setSettlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.public.getSettlements()
      .then((data) => setSettlements(data || []))
      .catch((err) => console.error('Error fetching settlements:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredSettlements = settlements.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="settlements-page" style={{ padding: '1.5rem 0 2.5rem' }}>
      <div className="container">
        {/* Page Header */}
        <div className="settlements-page-header" style={{ maxWidth: '750px', marginBottom: '1.5rem' }}>
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
            <MapPin size={14} />
            <span>{tr('Harta Administrative')}</span>
          </div>

          <h1 className="categories-page-title" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            {tr('Vendbanimet e Komunës së Lipjanit')}
          </h1>
          <p className="categories-page-description" style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {tr('Eksploroni bizneset dhe shërbimet sipas lokaliteteve, fshatrave dhe qendrës së qytetit të Lipjanit me të dhëna në kohë reale.')}
          </p>

          {/* Quick search input */}
          <div className="categories-search" style={{ position: 'relative', maxWidth: '440px' }}>
            <input
              type="text"
              placeholder={tr('Kërko vendbanim (p.sh. Lipjan, Gadime, Janjevë)...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', height: '46px' }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}
            />
          </div>
        </div>

        {/* Settlements Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <Loader2 className="animate-spin" size={36} color="#0d9488" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div className="settlements-grid">
            {filteredSettlements.map((settlement) => {
              const count = settlement.businesses_count !== undefined ? settlement.businesses_count : 0;

              return (
                <div
                  key={settlement.id}
                  className="settlement-card"
                >
                  <div className="settlement-card-top">
                    <div className={`settlement-card-icon${settlement.is_town ? ' is-town' : ''}`}>
                      {settlement.is_town ? <Building2 size={22} /> : <MapPin size={22} />}
                    </div>

                    <span className={`settlement-card-type${settlement.is_town ? ' is-town' : ''}`}>
                      {settlement.is_town ? tr('Qendër Urbane') : tr('Vendbanim / Fshat')}
                    </span>
                  </div>

                  <h3 className="settlement-card-title">
                    {settlement.name}
                  </h3>
                  <p className="settlement-card-description">
                    {settlement.description || tr('Lokalitet i rëndësishëm në territorin e Komunës së Lipjanit.')}
                  </p>

                  <div className="settlement-card-footer">
                    <span className="settlement-card-count">
                      {count} {tr(count === 1 ? 'Biznes' : 'Biznese')}
                    </span>

                    <Link
                      to={`/bizneset?vendbanimi=${encodeURIComponent(settlement.id)}`}
                      className="btn btn-outline btn-sm"
                    >
                      <span>{tr('Shiko Bizneset')}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
