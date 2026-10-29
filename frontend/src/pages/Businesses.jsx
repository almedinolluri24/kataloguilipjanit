import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import BusinessGrid from '../components/BusinessGrid';
import Pagination from '../components/Pagination';
import AdvertisementBanner from '../components/AdvertisementBanner';
import MultiBusinessMap from '../components/MultiBusinessMap';
import { api } from '../services/api';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/useLanguage';

export default function Businesses() {
  const { tr, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Lookup data from API
  const [categories, setCategories] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [services, setServices] = useState([]);

  // Businesses list state
  const [businesses, setBusinesses] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Read URL parameters
  const urlSearch = searchParams.get('kerko') || '';
  const urlCategory = searchParams.get('kategoria') || '';
  const urlSettlement = searchParams.get('vendbanimi') || '';
  const urlService = searchParams.get('sherbimi') || '';
  const urlHasWebsite = searchParams.get('website') === '1';
  const urlHasHours = searchParams.get('orari') === '1';
  const urlSort = searchParams.get('renditja') || 'latest';
  const urlPage = parseInt(searchParams.get('faqe') || '1', 10);

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedSettlement, setSelectedSettlement] = useState(urlSettlement);
  const [selectedService, setSelectedService] = useState(urlService);
  const [hasWebsite, setHasWebsite] = useState(urlHasWebsite);
  const [hasHours, setHasHours] = useState(urlHasHours);
  const [sortBy, setSortBy] = useState(urlSort);
  const [currentPage, setCurrentPage] = useState(isNaN(urlPage) ? 1 : urlPage);

  // Load auxiliary data on mount
  useEffect(() => {
    Promise.all([
      api.public.getCategories().catch(() => []),
      api.public.getSettlements().catch(() => []),
      api.public.getServices().catch(() => [])
    ]).then(([cats, sets, srvs]) => {
      setCategories(cats);
      setSettlements(sets);
      setServices(srvs);
    });
  }, []);

  // Sync state when URL params change externally (p.sh. back/forward button ose reload)
  useEffect(() => {
    setSearchQuery(urlSearch);
    setSelectedCategory(urlCategory);
    setSelectedSettlement(urlSettlement);
    setSelectedService(urlService);
    setHasWebsite(urlHasWebsite);
    setHasHours(urlHasHours);
    setSortBy(urlSort);
    setCurrentPage(isNaN(urlPage) ? 1 : urlPage);
  }, [urlSearch, urlCategory, urlSettlement, urlService, urlHasWebsite, urlHasHours, urlSort, urlPage]);

  // Update URL parameters
  const updateParams = useCallback((updates) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === 'latest' || val === false || (key === 'faqe' && val === 1)) {
        nextParams.delete(key);
      } else if (val === true) {
        nextParams.set(key, '1');
      } else {
        nextParams.set(key, val);
      }
    });
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  // Fetch businesses from Laravel backend API
  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.public.getBusinesses({
        q: searchQuery,
        category: selectedCategory,
        settlement: selectedSettlement,
        service: selectedService,
        has_website: hasWebsite,
        has_hours: hasHours,
        sort: sortBy,
        page: currentPage
      });

      setBusinesses(res.data || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.last_page || 1);
    } catch (err) {
      console.error('Gabim gjatë marrjes së bizneseve nga API:', err);
      setErrorMessage(err.message || 'Dështoi lidhja me serverin e katalogut.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSettlement, selectedService, hasWebsite, hasHours, sortBy, currentPage]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Filter handlers
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
    updateParams({ kerko: val, faqe: 1 });
  };

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setCurrentPage(1);
    updateParams({ kategoria: val, faqe: 1 });
  };

  const handleSettlementChange = (val) => {
    setSelectedSettlement(val);
    setCurrentPage(1);
    updateParams({ vendbanimi: val, faqe: 1 });
  };

  const handleServiceChange = (val) => {
    setSelectedService(val);
    setCurrentPage(1);
    updateParams({ sherbimi: val, faqe: 1 });
  };

  const handleHasWebsiteChange = (val) => {
    setHasWebsite(val);
    setCurrentPage(1);
    updateParams({ website: val, faqe: 1 });
  };

  const handleHasHoursChange = (val) => {
    setHasHours(val);
    setCurrentPage(1);
    updateParams({ orari: val, faqe: 1 });
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setCurrentPage(1);
    updateParams({ renditja: val, faqe: 1 });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSettlement('');
    setSelectedService('');
    setHasWebsite(false);
    setHasHours(false);
    setSortBy('latest');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateParams({ faqe: newPage });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="businesses-page" style={{ padding: '1.5rem 0 2.5rem' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 className="businesses-page-title" style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            {tr('Katalogu i Bizneseve në Lipjan')}
          </h1>
          <p className="businesses-page-description" style={{ fontSize: '1.0625rem' }}>
            {tr('Eksploroni bizneset, punëtoritë dhe shërbimet e verifikuara në Komunën e Lipjanit me të dhëna në kohë reale.')}
          </p>
        </div>

        {/* Filter Bar with all static and dynamic filters */}
        <FilterBar
          categories={categories}
          settlements={settlements}
          services={services}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          selectedSettlement={selectedSettlement}
          onSettlementChange={handleSettlementChange}
          selectedService={selectedService}
          onServiceChange={handleServiceChange}
          hasWebsite={hasWebsite}
          onHasWebsiteChange={handleHasWebsiteChange}
          hasHours={hasHours}
          onHasHoursChange={handleHasHoursChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onResetFilters={handleResetFilters}
          totalResults={totalItems}
        />

        {/* Results Count & Meta info */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
            {isLoading ? tr('Duke ngarkuar të dhënat...') : language === 'en' ? `Showing ${businesses.length} of ${totalItems} matches (Page ${currentPage} of ${totalPages})` : `Duke shfaqur ${businesses.length} nga ${totalItems} përputhje gjithsej (Faqja ${currentPage} e ${totalPages})`}
          </span>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={fetchBusinesses}
            disabled={isLoading}
            title={tr('Rifresko të dhënat nga serveri')}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>{tr('Rifresko')}</span>
          </button>
        </div>

        {/* Error State with Retry Button */}
        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#991b1b', display: 'block' }}>{tr('Dështoi lidhja me serverin')}</strong>
                <span style={{ color: '#b91c1c', fontSize: '0.875rem' }}>{language === 'en' ? 'Please check the server connection and try again.' : errorMessage}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={fetchBusinesses}
            >
              <RefreshCw size={14} />
              <span>{tr('Ripravo')}</span>
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: '#0d9488' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>{tr('Duke marrë bizneset nga baza e të dhënave...')}</p>
          </div>
        )}

        {/* Business Cards Grid */}
        {!isLoading && !errorMessage && (
          <BusinessGrid
            businesses={businesses}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* Harta me Bizneset e Faqes Aktuale (PDF faqe 6) */}
        {!isLoading && !errorMessage && businesses.length > 0 && (
          <MultiBusinessMap
            businesses={businesses}
            title={tr('Shiko bizneset në këtë faqe')}
            height="360px"
          />
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {/* Ad Placement */}
        <div style={{ marginTop: '1.5rem' }}>
          <AdvertisementBanner placement="banner-catalog" />
        </div>
      </div>
    </div>
  );
}
