import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const { tr, language } = useLanguage();
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav className="pagination-container" aria-label={tr('Navigimi i faqeve')}>
      <button
        type="button"
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label={tr('Faqja e mëparshme')}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`page-btn ${currentPage === p ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={currentPage === p ? 'page' : undefined}
          aria-label={`${language === 'en' ? 'Page' : 'Faqja'} ${p}`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label={tr('Faqja tjetër')}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
