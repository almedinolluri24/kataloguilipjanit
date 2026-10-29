import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useLanguage } from '../contexts/useLanguage';

export default function LeafletMap({
  coordinates = { lat: 42.5217, lng: 21.1258 },
  title = 'Lokacioni i Biznesit',
  address = 'Lipjan',
  zoom = 15,
  height = '320px'
}) {
  const { tr } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = coordinates?.lat || 42.5217;
    const lng = coordinates?.lng || 21.1258;

    // Clean up if already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: zoom,
      scrollWheelZoom: false
    });

    mapInstanceRef.current = map;

    // OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom modern Teal SVG Marker Pin to prevent broken default Leaflet assets
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background: #0f172a;
          border: 3px solid #14b8a6;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

    const popupHtml = `
      <div style="font-family: inherit; padding: 4px;">
        <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 2px;">${title}</strong>
        <span style="color: #64748b; font-size: 12px;">${address}</span>
      </div>
    `;

    marker.bindPopup(popupHtml).openPopup();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coordinates, title, address, zoom]);

  return (
    <div
      ref={mapContainerRef}
      className="map-container-box"
      style={{ height: height }}
      aria-label={`${tr('Harta për')} ${title}`}
    />
  );
}
