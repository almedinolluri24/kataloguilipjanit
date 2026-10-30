import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { useLanguage } from '../contexts/useLanguage';

export default function NotFound() {
  const { tr } = useLanguage();
  return (
    <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
      <div className="empty-state-card" style={{ maxWidth: '520px' }}>
        <div className="empty-icon-wrap" style={{ background: 'color-mix(in srgb, var(--palette-teal) 12%, var(--palette-white))', color: 'var(--palette-teal)' }}>
          <Compass size={40} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'color-mix(in srgb, var(--palette-teal) 25%, var(--palette-navy))', marginBottom: '0.5rem' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'color-mix(in srgb, var(--palette-teal) 25%, var(--palette-navy))', marginBottom: '0.75rem' }}>
          {tr('Faqja nuk u gjet')}
        </h2>
        <p style={{ color: 'var(--palette-teal)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {tr('Faqja që po kërkoni mund të jetë zhvendosur, fshirë ose nuk ekziston në Katalogun e Bizneseve të Lipjanit.')}
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>{tr('Kthehu në Ballinë')}</span>
        </Link>
      </div>
    </div>
  );
}
