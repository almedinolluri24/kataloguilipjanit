import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle,
  Star,
  Share2,
  AlertCircle,
  Navigation,
  Loader2
} from 'lucide-react';
import LeafletMap from '../components/LeafletMap';
import BusinessCard from '../components/BusinessCard';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';

export default function BusinessDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { tr, language } = useLanguage();

  const [business, setBusiness] = useState(null);
  const [relatedBusinesses, setRelatedBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setErrorStatus(null);
    setImgError(false);

    api.public.getBusiness(id)
      .then((data) => {
        setBusiness(data.business);
        setRelatedBusinesses(data.related || []);
      })
      .catch((err) => {
        console.warn('Biznesi nuk u gjet ose nuk është publik:', err);
        setErrorStatus(err.status || 404);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast(tr('Linku i biznesit u kopjua në clipboard!'), 'success');
    }
  };

  const todayIndex = new Date().getDay(); // 0 is Sunday, 6 is Saturday
  const fallbackUrl = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1.5rem', color: '#0d9488' }} />
        <p style={{ color: '#64748b', fontSize: '1rem' }}>{tr('Duke ngarkuar profilin e biznesit...')}</p>
      </div>
    );
  }

  // Skenari kur biznesi nuk ekziston ose është draft/arkivuar (PDF faqe 6)
  if (errorStatus || !business) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="empty-state-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
          <AlertCircle size={52} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
          <h2 className="empty-state-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            {tr('Biznesi nuk u gjet ose nuk është publikuar')}
          </h2>
          <p className="empty-state-desc" style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {tr('Ky profil mund të jetë në gjendje përgatitore (Draft), i arkivuar nga administratori, ose identifikuesi nuk ekziston në katalog.')}
          </p>
          <Link to="/bizneset" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>{tr('Kthehu te lista e bizneseve')}</span>
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = business.category?.name || business.category_id;
  const settlementName = business.settlement?.name || business.settlement_id;
  const coverImage = business.cover_image || business.coverImage;

  // Koordinatat
  const hasCoordinates = business.latitude && business.longitude && !isNaN(business.latitude);
  const mapCoords = hasCoordinates ? { lat: Number(business.latitude), lng: Number(business.longitude) } : null;

  // Linku për "Shiko udhëzimet" në shërbim hartash (PDF faqe 5)
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${business.address}, Lipjan`)}`;

  // Shërbimet
  const servicesList = Array.isArray(business.services) ? business.services : [];

  // Orari (PDF faqe 5: kur mungon shfaqet "Orari nuk është publikuar")
  const openingHours = business.opening_hours;
  const hasOpeningHoursInfo = openingHours && (openingHours.weekdays || openingHours.saturday || openingHours.sunday);

  return (
    <div className="business-details-page" style={{ padding: '1.5rem 0 2rem' }}>
      <div className="container">
        {/* Navigation & Share */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className="back-link-btn"
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={18} />
            <span>{tr('Kthehu prapa')}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleShare}
            title={tr('Kopjo linkun e këtij profili')}
          >
            <Share2 size={15} />
            <span>{tr('Shpërndaj')}</span>
          </button>
        </div>

        {/* Hero Card */}
        <div className="details-hero-card">
          <div className="details-cover-box">
            {!imgError && coverImage ? (
              <img
                src={coverImage}
                alt={business.name}
                className="details-cover-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <img
                src={fallbackUrl}
                alt={business.name}
                className="details-cover-img"
              />
            )}
          </div>

          <div className="details-meta-header">
            <div className="details-main-info">
              <div className="details-tags-row">
                {categoryName && (
                  <span className="badge-tag badge-category" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                    {categoryName}
                  </span>
                )}
                {settlementName && (
                  <span className="badge-tag details-settlement-badge" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                    {settlementName}
                  </span>
                )}
                {business.featured ? (
                  <span className="badge-tag badge-featured" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                    {tr('★ Biznes i Veçuar')}
                  </span>
                ) : null}
              </div>

              <h1 className="details-title">{business.name}</h1>

              <div className="details-location-sub">
                <MapPin size={16} color="#0d9488" />
                <span>{business.address || 'Lipjan, Kosovë'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              {Number(business.review_count ?? 0) > 0 && Number(business.rating) > 0 && (
                <div className="badge-rating" style={{ fontSize: '1rem', padding: '0.4rem 0.85rem' }}>
                  <Star size={18} color="#f59e0b" fill="#f59e0b" />
                  <span>{Number(business.rating).toFixed(1)}</span>
                  <span className="details-supporting-text" style={{ fontSize: '0.8125rem' }}>({business.review_count} {tr('vlerësime')})</span>
                </div>
              )}
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> {tr('Biznes i Verifikuar')}
              </span>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="details-layout-grid">
          {/* Left Column: Description, Services & Map */}
          <div>
            {/* Description */}
            <div className="details-section-card">
              <h2 className="details-card-heading">{tr('Rreth Biznesit')}</h2>
              <p className="details-description" style={{ fontSize: '1rem', lineHeight: 1.8, marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                {business.description || business.short_description || tr('Ky biznes ofron shërbime cilësore në Komunën e Lipjanit.')}
              </p>
            </div>

            {/* Services Offered */}
            {servicesList.length > 0 && (
              <div className="details-section-card">
                <h2 className="details-card-heading">{tr('Shërbimet & Veçoritë')}</h2>
                <div className="services-tag-list">
                  {servicesList.map((service, idx) => (
                    <span key={idx} className="service-pill-item">
                      <CheckCircle size={15} color="#0d9488" />
                      <span>{service}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Leaflet Map (PDF faqe 5 & 7) */}
            <div className="details-section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
                <h2 className="details-card-heading" style={{ margin: 0 }}>
                  <MapPin size={20} color="#0d9488" />
                  <span>{tr('Vendndodhja në Hartë')}</span>
                </h2>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Navigation size={14} />
                  <span>{tr('Shiko udhëzimet')}</span>
                </a>
              </div>

              <p className="details-supporting-text" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                {business.address} ({settlementName || 'Lipjan'})
              </p>

              {hasCoordinates ? (
                <LeafletMap
                  coordinates={mapCoords}
                  title={business.name}
                  address={business.address}
                  height="340px"
                />
              ) : (
                <div className="details-muted-surface" style={{
                  padding: '2.5rem',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <MapPin size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ margin: 0, fontWeight: 500 }}>
                    {tr('Koordinatat gjeografike nuk janë konfiguruar për këtë adresë.')}
                  </p>
                  <span className="details-supporting-text" style={{ fontSize: '0.8125rem' }}>
                    {tr('Ju lutemi referojuni adresës fizike të specifikuar më lart.')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Contact info & Hours */}
          <div>
            {/* Contact Details Card */}
            <div className="details-section-card">
              <h2 className="details-card-heading">{tr('Kontakt & Lokacioni')}</h2>
              <div className="contact-sidebar-list">
                {business.phone ? (
                  <a href={`tel:${business.phone}`} className="contact-action-item">
                    <div className="contact-icon-col">
                      <Phone size={18} />
                    </div>
                    <div className="contact-label-col">
                      <span className="contact-label">{tr('Telefoni')}</span>
                      <span className="contact-value">{business.phone}</span>
                    </div>
                  </a>
                ) : null}

                {business.email ? (
                  <a href={`mailto:${business.email}`} className="contact-action-item">
                    <div className="contact-icon-col">
                      <Mail size={18} />
                    </div>
                    <div className="contact-label-col">
                      <span className="contact-label">Email</span>
                      <span className="contact-value">{business.email}</span>
                    </div>
                  </a>
                ) : null}

                {business.website ? (
                  <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer" className="contact-action-item">
                    <div className="contact-icon-col">
                      <Globe size={18} />
                    </div>
                    <div className="contact-label-col">
                      <span className="contact-label">{tr('Uebfaqja')}</span>
                      <span className="contact-value">{business.website.replace(/^https?:\/\//, '')}</span>
                    </div>
                  </a>
                ) : null}

                <div className="contact-action-item">
                  <div className="contact-icon-col">
                    <MapPin size={18} />
                  </div>
                  <div className="contact-label-col">
                    <span className="contact-label">{tr('Adresa Fizike')}</span>
                    <span className="contact-value">{business.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Opening Hours Card (PDF faqe 5) */}
            <div className="details-section-card">
              <h2 className="details-card-heading">
                <Clock size={18} color="#0d9488" />
                <span>{tr('Orari i Punës')}</span>
              </h2>

              {hasOpeningHoursInfo ? (
                <div className="hours-list">
                  <div className={`hour-row${todayIndex >= 1 && todayIndex <= 5 ? ' is-today' : ''}`} style={{ padding: '6px 8px', borderRadius: '8px' }}>
                    <span className="hour-day">{tr('E Hënë - E Premte:')}</span>
                    <span className="hour-time">{openingHours.weekdays || tr('E papërcaktuar')}</span>
                  </div>
                  <div className={`hour-row${todayIndex === 6 ? ' is-today' : ''}`} style={{ padding: '6px 8px', borderRadius: '8px' }}>
                    <span className="hour-day">{tr('E Shtunë:')}</span>
                    <span className="hour-time">{openingHours.saturday || tr('E papërcaktuar')}</span>
                  </div>
                  <div className={`hour-row${todayIndex === 0 ? ' is-today' : ''}`} style={{ padding: '6px 8px', borderRadius: '8px' }}>
                    <span className="hour-day">{tr('E Diel:')}</span>
                    <span className={`hour-time${openingHours.sunday === 'Mbyllur' ? ' is-closed' : ''}`}>
                      {openingHours.sunday || tr('Mbyllur')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="details-muted-surface" style={{ padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                  <em>{tr('Orari nuk është publikuar')}</em>
                </div>
              )}
            </div>

            {/* Direction Quick Action */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', padding: '0.75rem' }}
            >
              <Navigation size={16} />
              <span>{tr('Shiko udhëzimet në hartë')}</span>
            </a>
          </div>
        </div>

        {/* Similar Businesses from this Category */}
        {relatedBusinesses.length > 0 && (
          <section className="details-related-section" style={{ marginTop: '2.5rem', paddingTop: '2.5rem' }}>
            <div className="section-header">
              <div className="section-title-wrap">
                <h2>{tr('Biznese të ngjashme në këtë kategori')}</h2>
                <p>{tr('Zbulo më shumë shërbime të ngjashme në Lipjan.')}</p>
              </div>
              <Link to={`/bizneset?kategoria=${business.category_id || business.categoryId}`} className="section-action-link">
                <span>{tr('Shiko të gjitha')}</span>
                <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
              </Link>
            </div>

            <div className="business-grid">
              {relatedBusinesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
