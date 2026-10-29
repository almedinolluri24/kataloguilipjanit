import React, { useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/useLanguage';

export default function SearchBar({
  initialValue = '',
  onSearch,
  placeholder = 'Kërko biznese, shërbime, restorante...',
  showButton = true,
  autoFocus = false
}) {
  const { tr } = useLanguage();
  const [term, setTerm] = useState(initialValue);
  const [previousInitialValue, setPreviousInitialValue] = useState(initialValue);

  if (initialValue !== previousInitialValue) {
    setPreviousInitialValue(initialValue);
    setTerm(initialValue);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(term.trim());
    }
  };

  const handleClear = () => {
    setTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form className="search-bar-container" onSubmit={handleSubmit} role="search">
      <div className="search-input-wrap">
        <Search size={20} aria-hidden="true" />
        <input
          type="text"
          className="search-input-field"
          placeholder={tr(placeholder)}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          autoFocus={autoFocus}
          aria-label={tr('Fusha e kërkimit për biznese')}
        />
        {term && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label={tr('Fshi tekstin e kërkimit')}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showButton && (
        <button type="submit" className="btn btn-primary" aria-label={tr('Ekzekuto kërkimin')}>
          <span>{tr('Kërko')}</span>
          <ArrowRight size={16} />
        </button>
      )}
    </form>
  );
}
