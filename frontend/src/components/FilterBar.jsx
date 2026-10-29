import React from 'react';
import { Search, X, RotateCcw, Globe, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/useLanguage';

export default function FilterBar({
  categories = [],
  settlements = [],
  services = [],
  searchQuery = '',
  onSearchChange,
  selectedCategory = '',
  onCategoryChange,
  selectedSettlement = '',
  onSettlementChange,
  selectedService = '',
  onServiceChange,
  hasWebsite = false,
  onHasWebsiteChange,
  hasHours = false,
  onHasHoursChange,
  sortBy = 'latest',
  onSortChange,
  onResetFilters,
  totalResults = 0
}) {
  const { tr } = useLanguage();
  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedCategory ||
    selectedSettlement ||
    selectedService ||
    hasWebsite ||
    hasHours ||
    (sortBy !== 'latest' && sortBy !== 'newest')
  );

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
  const activeSettlementObj = settlements.find((s) => s.id === selectedSettlement);

  return (
    <div className="filters-bar-card">
      <div className="filter-row-main">
        {/* Search query input */}
        <div className="filter-control-wrap filter-search-control">
          <label className="filter-label" htmlFor="filter-search-input">
            {tr('Kërko sipas emrit / përshkrimit')}
          </label>
          <div className="filter-search-input-wrap">
            <input
              id="filter-search-input"
              type="text"
              placeholder={tr('p.sh. Restorant, servis, furrë...')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-input"
            />
            <Search size={18} aria-hidden="true" />
          </div>
        </div>

        {/* Category filter */}
        <div className="filter-control-wrap">
          <label className="filter-label" htmlFor="filter-cat-select">
            {tr('Kategoria')}
          </label>
          <select
            id="filter-cat-select"
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">{tr('Të gjitha kategoritë')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Settlement filter */}
        <div className="filter-control-wrap">
          <label className="filter-label" htmlFor="filter-settle-select">
            {tr('Vendbanimi')}
          </label>
          <select
            id="filter-settle-select"
            className="filter-select"
            value={selectedSettlement}
            onChange={(e) => onSettlementChange(e.target.value)}
          >
            <option value="">{tr('Të gjitha vendbanimet')}</option>
            {settlements.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Service filter */}
        {services && services.length > 0 && (
          <div className="filter-control-wrap">
            <label className="filter-label" htmlFor="filter-service-select">
              {tr('Shërbimi')}
            </label>
            <select
              id="filter-service-select"
              className="filter-select"
              value={selectedService}
              onChange={(e) => onServiceChange && onServiceChange(e.target.value)}
            >
              <option value="">{tr('Të gjitha shërbimet')}</option>
              {services.map((s) => (
                <option key={s.id || s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort filter */}
        <div className="filter-control-wrap">
          <label className="filter-label" htmlFor="filter-sort-select">
            {tr('Renditja')}
          </label>
          <select
            id="filter-sort-select"
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="latest">{tr('Më të rejat')}</option>
            <option value="name_asc">{tr('Emri (A - Z)')}</option>
            <option value="name_desc">{tr('Emri (Z - A)')}</option>
            <option value="rating">{tr('Më të vlerësuarat (Rating)')}</option>
          </select>
        </div>
      </div>

      {/* Static Quick Toggles (Website & Opening Hours) - Kërkesë e PDF faqe 6 */}
      <div className="filter-toggle-row">
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={Boolean(hasWebsite)}
            onChange={(e) => onHasWebsiteChange && onHasWebsiteChange(e.target.checked)}
          />
          <Globe size={16} aria-hidden="true" />
          <span>{tr('Vetëm biznese me website')}</span>
        </label>

        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={Boolean(hasHours)}
            onChange={(e) => onHasHoursChange && onHasHoursChange(e.target.checked)}
          />
          <Clock size={16} aria-hidden="true" />
          <span>{tr('Vetëm me orar të publikuar')}</span>
        </label>
      </div>

      {/* Active Filter Chips & Summary */}
      {hasActiveFilters && (
        <div className="filter-chips-row">
          <span className="filter-summary-label">
            {tr('Filtrat aktivë')} ({totalResults} {tr('rezultate')}):
          </span>

          {searchQuery && (
            <span className="filter-chip">
              {tr('Fjala')}: "{searchQuery}"
              <button
                type="button"
                className="filter-chip-remove"
                onClick={() => onSearchChange('')}
                aria-label={tr('Fshi filtrin e kërkimit')}
              >
                <X size={14} />
              </button>
            </span>
          )}

          {activeCategoryObj && (
            <span className="filter-chip">
              {tr('Kategoria')}: {activeCategoryObj.name}
              <button
                type="button"
                className="filter-chip-remove"
                onClick={() => onCategoryChange('')}
                aria-label={tr('Fshi filtrin e kategorisë')}
              >
                <X size={14} />
              </button>
            </span>
          )}

          {activeSettlementObj && (
            <span className="filter-chip">
              {tr('Vendi')}: {activeSettlementObj.name}
              <button
                type="button"
                className="filter-chip-remove"
                onClick={() => onSettlementChange('')}
                aria-label={tr('Fshi filtrin e vendbanimit')}
              >
                <X size={14} />
              </button>
            </span>
          )}

          {selectedService && (
            <span className="filter-chip">
              {tr('Shërbimi')}: {selectedService}
              <button
                type="button"
                className="filter-chip-remove"
                onClick={() => onServiceChange && onServiceChange('')}
                aria-label={tr('Fshi filtrin e shërbimit')}
              >
                <X size={14} />
              </button>
            </span>
          )}

          {hasWebsite && (
            <span className="filter-chip">
              Me website
              <button
                type="button"
                className="filter-chip-remove"
                onClick={() => onHasWebsiteChange && onHasWebsiteChange(false)}
                aria-label={tr('Hiq filtrin website')}
              >
                <X size={14} />
              </button>
            </span>
          )}

          {hasHours && (
            <span className="filter-chip">
              Me orar pune
              <button
                type="button"
                className="filter-chip-remove"
                onClick={() => onHasHoursChange && onHasHoursChange(false)}
                aria-label={tr('Hiq filtrin orari')}
              >
                <X size={14} />
              </button>
            </span>
          )}

          {sortBy && sortBy !== 'latest' && sortBy !== 'newest' && (
            <span className="filter-chip">
              {tr('Renditja')}: {sortBy === 'rating' ? tr('Më të vlerësuarat (Rating)') : sortBy === 'name_asc' || sortBy === 'name-asc' ? 'A-Z' : 'Z-A'}
              <button
                type="button"
                className="filter-chip-remove"
                onClick={() => onSortChange('latest')}
                aria-label={tr('Rivendos renditjen')}
              >
                <X size={14} />
              </button>
            </span>
          )}

          <button
            type="button"
            className="reset-filters-btn"
            onClick={onResetFilters}
          >
            <RotateCcw size={14} />
            <span>{tr('Pastro të gjithë')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
