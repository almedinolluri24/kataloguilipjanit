import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/useToast';
import { useLanguage } from '../contexts/useLanguage';

export default function AddBusiness() {
  const { tr, language } = useLanguage();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    settlementId: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    shortDescription: '',
    description: '',
    services: '',
    coverImage: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBusiness, setCreatedBusiness] = useState(null);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    let isCurrent = true;
    Promise.all([api.public.getCategories(), api.public.getSettlements()])
      .then(([categoryData, settlementData]) => {
        if (!isCurrent) return;
        const availableCategories = Array.isArray(categoryData) ? categoryData : [];
        const availableSettlements = Array.isArray(settlementData) ? settlementData : [];
        setCategories(availableCategories);
        setSettlements(availableSettlements);
        setFormData((current) => ({
          ...current,
          categoryId: current.categoryId || String(availableCategories[0]?.id || ''),
          settlementId: current.settlementId || String(availableSettlements[0]?.id || '')
        }));
        if (!availableCategories.length || !availableSettlements.length) {
          setOptionsError(tr('Kategoritë ose vendbanimet nuk mund të ngarkohen. Rifresko faqen dhe provo përsëri.'));
        }
      })
      .catch(() => {
        if (isCurrent) setOptionsError(tr('Kategoritë dhe vendbanimet nuk u ngarkuan. Kontrollo lidhjen dhe rifresko faqen.'));
      })
      .finally(() => {
        if (isCurrent) setIsLoadingOptions(false);
      });
    return () => { isCurrent = false; };
  }, [tr]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = 'Emri i biznesit duhet të përmbajë të paktën 3 karaktere.';
    }
    if (!formData.address.trim()) {
      errs.address = 'Ju lutem shënoni adresën ose rrugën në Lipjan.';
    }
    if (!formData.categoryId || !categories.some((category) => String(category.id) === String(formData.categoryId))) {
      errs.categoryId = 'Ju lutem zgjidhni një kategori.';
    }
    if (!formData.settlementId || !settlements.some((settlement) => String(settlement.id) === String(formData.settlementId))) {
      errs.settlementId = 'Ju lutem zgjidhni vendbanimin.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Ju lutem shënoni numrin e telefonit.';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Format i pavlefshëm i email adresës.';
    }
    if (!formData.shortDescription.trim()) {
      errs.shortDescription = 'Ju lutem shkruani një përshkrim të shkurtër.';
    }
    if (!formData.description.trim()) {
      errs.description = 'Ju lutem plotësoni përshkrimin e biznesit.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        category_id: formData.categoryId,
        settlement_id: formData.settlementId,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        website: formData.website.trim() || null,
        short_description: formData.shortDescription.trim(),
        description: formData.description.trim(),
        cover_image: formData.coverImage.trim() || null,
        services: formData.services
          ? formData.services.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      };

      const res = await api.public.submitBusiness(payload);
      setCreatedBusiness(res.business);
      addToast('Biznesi u dërgua me sukses dhe u regjistrua në sistem!', 'success');
    } catch (err) {
      addToast(err.message || 'Ndodhi një gabim gjatë regjistrimit.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdBusiness) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', maxWidth: '640px' }}>
        <div className="add-business-success-card">
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'color-mix(in srgb, var(--color-success) 14%, var(--bg-card))',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {tr('Biznesi u regjistrua me sukses!')}
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {tr('Biznesi juaj')} <strong>{createdBusiness.name}</strong> {tr('u regjistrua si draft dhe do të shfaqet në katalog pasi të miratohet nga administratori.')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/bizneset" className="btn btn-outline">
              <span>{tr('Shfleto Katalogun')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-business-page" style={{ padding: '1.5rem 0 2.5rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="add-business-eyebrow" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            <Sparkles size={14} />
            <span>{tr('Regjistrim Falas')}</span>
          </div>

          <h1 className="categories-page-title" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            {tr('Regjistroni Biznesin Tuaj në Lipjan')}
          </h1>
          <p className="categories-page-description" style={{ fontSize: '1.0625rem', lineHeight: 1.6, maxWidth: '620px', margin: '0 auto' }}>
            {tr("Plotësoni të dhënat e ndërmarrjes suaj për t'u bërë pjesë e katalogut zyrtar të bizneseve të Komunës së Lipjanit.")}
          </p>
        </div>

        {/* Demo Warning Banner */}
        <div className="add-business-review-notice">
          <ShieldAlert size={20} style={{ flexShrink: 0 }} />
          <span>
            <strong>{tr('Procedura Zyrtare e Regjistrimit:')}</strong> {tr('Pas dërgimit, biznesi regjistrohet në bazën e të dhënave të katalogut me status')} <em>Draft ({language === 'en' ? 'under review' : 'në shqyrtim'})</em> {tr('dhe publikohet pas miratimit nga administratori.')}
          </span>
        </div>

        {/* Form Card */}
        <div className="add-business-form-card">
          <form className="add-business-form" onSubmit={handleSubmit} noValidate>
            {optionsError && (
              <div className="add-business-options-error" role="alert">
                <AlertCircle size={17} />
                <span>{tr(optionsError)}</span>
              </div>
            )}
            {isLoadingOptions && (
              <div className="add-business-options-loading" role="status">
                <span className="loading-spinner" />
                <span>{tr('Duke ngarkuar kategoritë dhe vendbanimet...')}</span>
              </div>
            )}
            {/* Business Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="pub-biz-name">
                {tr('Emri Zyrtar i Biznesit *')}
              </label>
              <input
                id="pub-biz-name"
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                placeholder={tr('p.sh. Restorant Lipjani ose Servis Gadime')}
              />
              {errors.name && (
                <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.name)}</span>
              )}
            </div>

            {/* Category & Settlement */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="pub-biz-cat">
                  {tr('Kategoria')} *
                </label>
                <select
                  id="pub-biz-cat"
                  className={`form-select ${errors.categoryId ? 'has-error' : ''}`}
                  value={formData.categoryId}
                  onChange={(e) => updateField('categoryId', e.target.value)}
                  required
                  disabled={isLoadingOptions || categories.length === 0}
                >
                  <option value="" disabled>{tr('Zgjidhni kategorinë')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.categoryId)}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pub-biz-settle">
                  {tr('Vendbanimi në Komunën e Lipjanit *')}
                </label>
                <select
                  id="pub-biz-settle"
                  className={`form-select ${errors.settlementId ? 'has-error' : ''}`}
                  value={formData.settlementId}
                  onChange={(e) => updateField('settlementId', e.target.value)}
                  required
                  disabled={isLoadingOptions || settlements.length === 0}
                >
                  <option value="" disabled>{tr('Zgjidhni vendbanimin')}</option>
                  {settlements.map((s) => (
                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                  ))}
                </select>
                {errors.settlementId && <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.settlementId)}</span>}
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="pub-biz-addr">
                {tr('Adresa / Rruga e Biznesit *')}
              </label>
              <input
                id="pub-biz-addr"
                type="text"
                className={`form-input ${errors.address ? 'has-error' : ''}`}
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                required
                placeholder={tr('p.sh. Rruga Sadik Shala, Nr. 8, Lipjan')}
              />
              {errors.address && (
                <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.address)}</span>
              )}
            </div>

            {/* Phone & Email */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="pub-biz-phone">
                  {tr('Numri i Telefonit')} *
                </label>
                <input
                  id="pub-biz-phone"
                  type="tel"
                  className={`form-input ${errors.phone ? 'has-error' : ''}`}
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                  autoComplete="tel"
                  placeholder="+383 44 000 000"
                />
                {errors.phone && <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.phone)}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pub-biz-email">
                  {tr('Email Adresa e Kontaktit')}
                </label>
                <input
                  id="pub-biz-email"
                  type="email"
                  className={`form-input ${errors.email ? 'has-error' : ''}`}
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder={tr('info@kompania-juaj.com')}
                />
                {errors.email && (
                  <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.email)}</span>
                )}
              </div>
            </div>

            {/* Short Description */}
            <div className="form-group">
                <label className="form-label" htmlFor="pub-biz-short">
                {tr('Përshkrim i Përmbledhur')} *
              </label>
              <input
                id="pub-biz-short"
                type="text"
                className="form-input"
                value={formData.shortDescription}
                onChange={(e) => updateField('shortDescription', e.target.value)}
                required
                maxLength={500}
                placeholder={tr('Një fjali e shkurtër për kartën e biznesit...')}
              />
              {errors.shortDescription && <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.shortDescription)}</span>}
            </div>

            {/* Full Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="pub-biz-desc">
                {tr('Përshkrimi i Detajuar i Veprimtarisë')} *
              </label>
              <textarea
                id="pub-biz-desc"
                rows={4}
                className={`form-textarea ${errors.description ? 'has-error' : ''}`}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                required
                placeholder={tr("Tregojeni historikun, llojet e shërbimeve dhe arsyet pse klientët duhet t'ju zgjedhin...")}
              />
              {errors.description && <span className="form-error-msg"><AlertCircle size={14} /> {tr(errors.description)}</span>}
            </div>

            {/* Services */}
            <div className="form-group">
              <label className="form-label" htmlFor="pub-biz-services">
                {tr('Shërbimet Kryesore (të ndara me presje)')}
              </label>
              <input
                id="pub-biz-services"
                type="text"
                className="form-input"
                value={formData.services}
                onChange={(e) => updateField('services', e.target.value)}
                placeholder={tr('p.sh. Porosi telefonike, Parking falas, Garancion 1-vjeçar, Wi-Fi')}
              />
            </div>

            {/* Submit Button */}
            <div className="form-actions" style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Link to="/" className="btn btn-outline">
                {tr('Anulo')}
              </Link>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isSubmitting || isLoadingOptions || Boolean(optionsError)}
              >
                <Building2 size={18} />
                <span>{isSubmitting ? tr('Duke regjistruar...') : tr('Dërgo Kërkesën për Regjistrim')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
