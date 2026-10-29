import React from 'react';
import BusinessCard from './BusinessCard';
import { SearchX, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/useLanguage';

export default function BusinessGrid({
  businesses = [],
  emptyTitle = 'Nuk u gjet asnjë biznes',
  emptyDescription = 'Provoni të ndryshoni fjalët kyçe të kërkimit ose pastroni filtrat e përzgjedhur.',
  onResetFilters
}) {
  const { tr } = useLanguage();
  if (!businesses || businesses.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-icon-wrap">
          <SearchX size={36} />
        </div>
        <h3 className="empty-state-title">{tr(emptyTitle)}</h3>
        <p className="empty-state-desc">{tr(emptyDescription)}</p>
        {onResetFilters && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onResetFilters}
          >
            <RotateCcw size={16} />
            <span>{tr('Pastro të gjithë filtrat')}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="business-grid">
      {businesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
}
