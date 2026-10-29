import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/useLanguage';

export default function BusinessModal({
  isOpen,
  business = null,
  categories = [],
  settlements = [],
  onSave,
  onClose
}) {
  const { tr, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    settlement_id: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    short_description: '',
    description: '',
    status: 'draft',
    featured: false,
    cover_image: '',
    services: '',
    latitude: '',
    longitude: '',
    weekdaysHours: '08:00 - 20:00',
    saturdayHours: '08:00 - 18:00',
    sundayHours: 'Mbyllur'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const defaultCat = categories[0]?.id || 'gastronomi';
    const defaultSettle = settlements[0]?.id || 'lipjan';

    if (business) {
      setFormData({
        name: business.name || '',
        category_id: business.category_id || business.categoryId || defaultCat,
        settlement_id: business.settlement_id || business.settlementId || defaultSettle,
        address: business.address || '',
        phone: business.phone || '',
        email: business.email || '',
        website: business.website || '',
        short_description: business.short_description || business.shortDescription || '',
        description: business.description || '',
        status: business.status || 'published',
        featured: Boolean(business.featured),
        cover_image: business.cover_image || business.coverImage || '',
        services: Array.isArray(business.services) ? business.services.join(', ') : '',
        latitude: business.latitude ?? business.coordinates?.lat ?? '',
        longitude: business.longitude ?? business.coordinates?.lng ?? '',
        weekdaysHours: business.opening_hours?.weekdays || business.openingHours?.weekdays || '08:00 - 20:00',
        saturdayHours: business.opening_hours?.saturday || business.openingHours?.saturday || '08:00 - 18:00',
        sundayHours: business.opening_hours?.sunday || business.openingHours?.sunday || 'Mbyllur'
      });
    } else {
      setFormData({
        name: '',
        category_id: defaultCat,
        settlement_id: defaultSettle,
        address: '',
        phone: '',
        email: '',
        website: '',
        short_description: '',
        description: '',
        status: 'draft',
        featured: false,
        cover_image: '',
        services: '',
        latitude: '',
        longitude: '',
        weekdaysHours: '08:00 - 20:00',
        saturdayHours: '08:00 - 18:00',
        sundayHours: 'Mbyllur'
      });
    }
    setErrors({});
  }, [business, isOpen, categories, settlements]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'Emri i biznesit duhet të ketë së paku 3 shkronja.';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Adresa është e detyrueshme.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Numri i telefonit është i detyrueshëm për publikim.';
    }
    if (!formData.short_description.trim()) {
      newErrors.short_description = 'Përshkrimi i shkurtër është i detyrueshëm.';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Përshkrimi i plotë është i detyrueshëm.';
    }
    if (formData.status === 'published' && (!formData.latitude || !formData.longitude)) {
      newErrors.latitude = 'Për publikim duhet të vendosen koordinatat reale të biznesit.';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format i pasaktë i email adresës.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formattedPayload = {
      name: formData.name.trim(),
      category_id: formData.category_id,
      settlement_id: formData.settlement_id,
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      website: formData.website.trim() || null,
      short_description: formData.short_description.trim(),
      description: formData.description.trim(),
      status: formData.status,
      featured: Boolean(formData.featured),
      cover_image: formData.cover_image.trim() || null,
      latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
      longitude: formData.longitude !== '' ? Number(formData.longitude) : null,
      opening_hours: {
        weekdays: formData.weekdaysHours,
        saturday: formData.saturdayHours,
        sunday: formData.sundayHours
      },
      services: formData.services
        ? formData.services.split(',').map((s) => s.trim()).filter(Boolean)
        : []
    };

    onSave(formattedPayload);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-biz-title">
      <div className="modal-box" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h3 className="modal-title" id="modal-biz-title">
            {business ? tr('Ndrysho Biznesin') : tr('Regjistro Biznes të Ri')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            aria-label={tr('Mbyll modalin')}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Business Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="m-biz-name">
                {tr('Emri i Biznesit')} *
              </label>
              <input
                id="m-biz-name"
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={tr('p.sh. Restorant Lipjani')}
              />
              {errors.name && (
                <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.name)}</span>
              )}
            </div>

            {/* Category & Settlement */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="m-biz-cat">
                  {tr('Kategoria')} *
                </label>
                <select
                  id="m-biz-cat"
                  className="form-select"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="m-biz-settle">
                  {tr('Vendbanimi')} *
                </label>
                <select
                  id="m-biz-settle"
                  className="form-select"
                  value={formData.settlement_id}
                  onChange={(e) => setFormData({ ...formData, settlement_id: e.target.value })}
                >
                  {settlements.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="m-biz-addr">
                {tr('Adresa / Rruga *')}
              </label>
              <input
                id="m-biz-addr"
                type="text"
                className={`form-input ${errors.address ? 'has-error' : ''}`}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={tr('p.sh. Rruga Sadik Shala, Nr. 12, Lipjan')}
              />
              {errors.address && (
                <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.address)}</span>
              )}
            </div>

            {/* Phone & Email */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="m-biz-phone">
                  {tr('Numri i Telefonit *')}
                </label>
                <input
                  id="m-biz-phone"
                  type="text"
                  className={`form-input ${errors.phone ? 'has-error' : ''}`}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+383 44 000 000"
                />
                {errors.phone && (
                  <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.phone)}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="m-biz-email">
                  {tr('Email Adresa')}
                </label>
                <input
                  id="m-biz-email"
                  type="email"
                  className={`form-input ${errors.email ? 'has-error' : ''}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="kontakt@biznesi.com"
                />
                {errors.email && (
                  <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.email)}</span>
                )}
              </div>
            </div>

            {/* Website & Cover Image */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="m-biz-web">
                  {tr('Uebfaqja')}
                </label>
                <input
                  id="m-biz-web"
                  type="url"
                  className="form-input"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://biznesi-juaj.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="m-biz-img">
                  {tr('URL e Fotografisë (Kopertinë)')}
                </label>
                <input
                  id="m-biz-img"
                  type="text"
                  className="form-input"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="m-biz-short">
                {tr('Përshkrimi i Shkurtër (Snippet për kartelë) *')}
              </label>
              <input
                id="m-biz-short"
                type="text"
                className={`form-input ${errors.short_description ? 'has-error' : ''}`}
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder={tr('Përmbledhje në 1-2 fjali...')}
              />
              {errors.short_description && (
                <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.short_description)}</span>
              )}
            </div>

            {/* Full Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="m-biz-desc">
                {tr('Përshkrimi i Plotë i Biznesit *')}
              </label>
              <textarea
                id="m-biz-desc"
                rows={3}
                className={`form-textarea ${errors.description ? 'has-error' : ''}`}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={tr('Detaje të plota mbi aktivitetin, shërbimet dhe historikun...')}
              />
              {errors.description && (
                <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.description)}</span>
              )}
            </div>

            {/* Services */}
            <div className="form-group">
              <label className="form-label" htmlFor="m-biz-serv">
                {tr('Shërbimet (të ndara me presje)')}
              </label>
              <input
                id="m-biz-serv"
                type="text"
                className="form-input"
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                placeholder={tr('Wi-Fi falas, Parking, Dërgesa në shtëpi')}
              />
            </div>

            {/* Opening Hours */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                {tr('Orari i Punës')}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>{tr('Hënë - Premte:')}</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ height: '34px', fontSize: '0.8125rem' }}
                    value={formData.weekdaysHours}
                    onChange={(e) => setFormData({ ...formData, weekdaysHours: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>{tr('E Shtunë:')}</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ height: '34px', fontSize: '0.8125rem' }}
                    value={formData.saturdayHours}
                    onChange={(e) => setFormData({ ...formData, saturdayHours: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>{tr('E Diel:')}</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ height: '34px', fontSize: '0.8125rem' }}
                    value={formData.sundayHours}
                    onChange={(e) => setFormData({ ...formData, sundayHours: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Coordinates (Latitude & Longitude) */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="m-biz-lat">
                  {tr('Gjerësia Gjeografike (Latitude)')}
                </label>
                <input
                  id="m-biz-lat"
                  type="number"
                  step="any"
                  className={`form-input ${errors.latitude ? 'has-error' : ''}`}
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="m-biz-lng">
                  {tr('Gjatësia Gjeografike (Longitude)')}
                </label>
                <input
                  id="m-biz-lng"
                  type="number"
                  step="any"
                  className={`form-input ${errors.latitude ? 'has-error' : ''}`}
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
              {errors.latitude && (
                <span className="form-error-msg" style={{ gridColumn: '1 / -1' }}>
                  <AlertCircle size={14} /> {tr(errors.latitude)}
                </span>
              )}
            </div>

            {/* Status & Featured */}
            <div className="form-row-2" style={{ alignItems: 'center' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="m-biz-status">
                  {tr('Statusi i Publikimit *')}
                </label>
                <select
                  id="m-biz-status"
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="published">{language === 'en' ? 'Published (visible to the public)' : 'Publikuar (E dukshme për qytetarët)'}</option>
                  <option value="draft">{language === 'en' ? 'Draft (not yet published)' : 'Draft (Në përgatitje pa publikim)'}</option>
                  <option value="archived">{language === 'en' ? 'Archived (hidden from the public)' : 'Arkivuar (Largohet nga pjesa publike)'}</option>
                </select>
              </div>

              <div style={{ paddingTop: '1.25rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0d9488' }}
                  />
                  <span>{tr('Biznes i Veçuar (Featured)')}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              {tr('Anulo')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Check size={16} />
              <span>{business ? tr('Ruaj Ndryshimet') : tr('Krijo Biznesin')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
