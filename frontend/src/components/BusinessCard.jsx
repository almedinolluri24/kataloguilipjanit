import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Star, Phone, ArrowRight } from 'lucide-react';

export default function BusinessCard({ business }) {
  const { tr } = useLanguage();
  const [imgError, setImgError] = useState(false);

  if (!business) return null;

  // Përdorim vetëm relacionet reale që vijnë nga API; mos shpikim etiketa nga të dhëna demo lokale.
  const categoryName = business.category?.name;
  const settlementName = business.settlement?.name;

  const coverImage = business.cover_image || business.coverImage;
  const shortDesc = business.short_description || business.shortDescription || business.description;
  const bizId = business.slug || business.id;

  // Fallback image
  const fallbackUrl = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';

  return (
    <article className="business-card-item" aria-labelledby={`biz-name-${business.id}`}>
      {/* Media Wrapper */}
      <div className="card-media-wrapper">
        {!imgError && coverImage ? (
          <img
            src={coverImage}
            alt={business.name}
            className="card-media-img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src={fallbackUrl}
            alt={business.name}
            className="card-media-img"
            loading="lazy"
          />
        )}

        {/* Top Badges */}
        <div className="card-badge-top-left">
          {categoryName && (
            <span className="badge-tag badge-category">
              {categoryName}
            </span>
          )}
          {business.featured ? (
            <span className="badge-tag badge-featured">
              ★ E Veçuar
            </span>
          ) : null}
        </div>

        {/* Rating badge */}
        {Number(business.review_count ?? business.reviewCount ?? 0) > 0 && Number(business.rating) > 0 && (
          <div className="card-badge-top-right">
            <div className="badge-rating" title={`${Number(business.rating).toFixed(1)} (${business.review_count ?? business.reviewCount})`}>
              <Star size={14} />
              <span>{Number(business.rating).toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="card-content">
        {/* Settlement Location Tag */}
        <div className="card-settlement-row">
          <MapPin size={14} />
          <span>{settlementName || 'Komuna e Lipjanit'}</span>
        </div>

        {/* Business Title */}
        <h3 className="card-business-name" id={`biz-name-${business.id}`}>
          <Link to={`/bizneset/${bizId}`}>
            {business.name}
          </Link>
        </h3>

        {/* Address */}
        <p className="card-address-text">
          <span>{business.address || 'Lipjan'}</span>
        </p>

        {/* Short description */}
        <p className="card-desc-snippet">
          {shortDesc || tr('Shërbime cilësore për qytetarët e Lipjanit.')}
        </p>

        {/* Card Footer Actions */}
        <div className="card-bottom-actions">
          {business.phone ? (
            <a href={`tel:${business.phone}`} className="card-phone-link" title={tr('Telefono biznesin')}>
              <Phone size={14} />
              <span>{business.phone}</span>
            </a>
          ) : (
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Lipjan</span>
          )}

          <Link to={`/bizneset/${bizId}`} className="btn btn-outline btn-sm">
            <span>{tr('Shiko biznesin')}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
