import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ExternalLink, ArrowRight, PlusCircle } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/useLanguage';

export default function AdvertisementBanner({ placement = 'banner-home' }) {
  const { tr } = useLanguage();
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.public.getAdvertisements(placement)
      .then((data) => {
        setAds(data || []);
      })
      .catch((err) => {
        console.warn('Nuk u mundësua ngarkimi i reklamave:', err);
        setAds([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [placement]);

  if (isLoading) return null;

  // Nëse nuk ka reklamë aktive, shfaqim ftesën "Reklamo biznesin tënd" (PDF faqe 7)
  if (!ads || ads.length === 0) {
    return (
      <div
        className="advertisement-banner"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--palette-teal) 25%, var(--palette-navy)) 0%, color-mix(in srgb, var(--palette-teal) 25%, var(--palette-navy)) 100%)',
          border: '1px dashed var(--palette-teal)'
        }}
      >
        <div className="ad-inner-content">
          <div className="ad-text-block">
            <span className="ad-tag-sponsor" style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'var(--palette-white)' }}>
              <Megaphone size={14} />
              Hapësirë Reklamimi
            </span>
            <h3 className="ad-banner-title">{tr('Reklamo biznesin tënd në Lipjan')}</h3>
            <p className="ad-banner-desc">
              Rritni shikueshmërinë dhe tërhiqni klientë të rinj lokalë duke vendosur banerin e biznesit tuaj në katalogun komunal.
            </p>
          </div>
          <div>
            <Link
              to="/shto-biznes"
              className="btn btn-primary"
              style={{ backgroundColor: 'color-mix(in srgb, var(--palette-teal) 45%, var(--palette-navy))', color: 'var(--palette-white)', fontWeight: 600 }}
            >
              <PlusCircle size={16} />
              <span>{tr('Kontakto Administratorin')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reklama me prioritet më të lartë vjen e para nga serveri
  const activeAd = ads[0];
  const destUrl = activeAd.destination_url || (activeAd.business_id ? `/bizneset/${activeAd.business_id}` : '/bizneset');
  const isExternal = destUrl.startsWith('http');

  return (
    <div
      className="advertisement-banner"
      style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--palette-teal) 25%, var(--palette-navy)) 0%, color-mix(in srgb, var(--palette-teal) 45%, var(--palette-navy)) 100%)',
        position: 'relative'
      }}
    >
      <div className="ad-inner-content">
        <div className="ad-text-block">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Etiketa e detyrueshme: 'E sponsorizuar' ose 'Reklamë' (PDF faqe 7) */}
            <span className="ad-tag-sponsor">
              <Megaphone size={14} />
              E sponsorizuar • {activeAd.sponsor || 'Sponsor'}
            </span>
            <span style={{ fontSize: '0.6875rem', background: 'rgba(11, 18, 32, 0.3)', color: 'color-mix(in srgb, var(--palette-teal) 12%, var(--palette-white))', padding: '2px 6px', borderRadius: '4px' }}>
              Reklamë
            </span>
          </div>

          <h3 className="ad-banner-title">{activeAd.title}</h3>
          <p className="ad-banner-desc">
            {activeAd.alt_text || 'Ofertë promocionale e verifikuar në platformën e Komunës së Lipjanit.'}
          </p>
        </div>

        <div>
          {isExternal ? (
            <a
              href={destUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ backgroundColor: 'var(--palette-white)', color: 'color-mix(in srgb, var(--palette-teal) 25%, var(--palette-navy))', fontWeight: 700 }}
            >
              <span>{tr('Shiko Ofertën')}</span>
              <ExternalLink size={16} />
            </a>
          ) : (
            <Link
              to={destUrl}
              className="btn btn-primary"
              style={{ backgroundColor: 'var(--palette-white)', color: 'color-mix(in srgb, var(--palette-teal) 25%, var(--palette-navy))', fontWeight: 700 }}
            >
              <span>{tr('Shiko Profilin')}</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
