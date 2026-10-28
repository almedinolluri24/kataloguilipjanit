import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, AlertTriangle } from 'lucide-react';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));

export default function MultiBusinessMap({
  businesses = [],
  title = 'Bizneset e kësaj faqeje',
  height = '380px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  // Filtrojmë vetëm bizneset që kanë koordinata reale valide
  const validBusinesses = useMemo(() => businesses.filter(
    (business) => business
      && business.latitude !== null && business.latitude !== ''
      && business.longitude !== null && business.longitude !== ''
      && Number.isFinite(Number(business.latitude))
      && Number.isFinite(Number(business.longitude))
  ), [businesses]);

  useEffect(() => {
    if (!mapContainerRef.current || mapError) return;

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Qendra fillestare në Lipjan
      const defaultCenter = [42.5217, 21.1258];
      const initialZoom = validBusinesses.length > 0 ? 13 : 14;

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: initialZoom,
        scrollWheelZoom: false
      });

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Pin icon
      const createCustomIcon = () => {
        return L.divIcon({
          className: 'custom-business-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background: #0f172a;
              border: 3px solid #0d9488;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              cursor: pointer;
            ">
              <div style="
                width: 9px;
                height: 9px;
                background: #ffffff;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
      };

      const markers = [];

      validBusinesses.forEach((biz) => {
        const marker = L.marker([Number(biz.latitude), Number(biz.longitude)], {
          icon: createCustomIcon(biz.name)
        }).addTo(map);

        const popupContent = `
          <div style="font-family: inherit; padding: 6px 2px; min-width: 170px;">
            <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 4px;">
              ${escapeHtml(biz.name)}
            </strong>
            <div style="color: #64748b; font-size: 12px; margin-bottom: 8px;">
              ${escapeHtml(biz.address || 'Lipjan')}
            </div>
            <a href="/bizneset/${escapeHtml(encodeURIComponent(biz.id || biz.slug || ''))}" style="
              display: inline-block;
              background: #0d9488;
              color: #ffffff;
              text-decoration: none;
              padding: 5px 10px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
            ">
              Shiko Profilin &rarr;
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);
      });

      // Përshtat kufijtë e hartës për të gjithë pin-at nëse ka më shumë se 1
      if (markers.length > 1) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.15));
      } else if (markers.length === 1) {
        map.setView([Number(validBusinesses[0].latitude), Number(validBusinesses[0].longitude)], 15);
      }
    } catch (err) {
      console.error('Error rendering Leaflet map:', err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [validBusinesses, mapError]);

  return (
    <div className="multi-map-wrapper" style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} color="#0d9488" />
          <span>{title}</span>
        </h3>
        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          {validBusinesses.length} biznese me vendndodhje në këtë faqe
        </span>
      </div>

      {mapError ? (
        <div style={{
          height: height,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <AlertTriangle size={36} color="#d97706" style={{ marginBottom: '10px' }} />
          <h4 style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
            Harta nuk mund të ngarkohej për momentin
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '400px' }}>
            Ju lutemi përdorni adresat dhe numrat e kontaktit të listuara në kartelat e bizneseve më poshtë.
          </p>
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          style={{
            height: height,
            width: '100%',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
          }}
          aria-label={title}
        />
      )}
    </div>
  );
}
