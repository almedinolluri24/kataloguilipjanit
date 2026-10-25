import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Mail, Phone, ExternalLink, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { tr, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & About */}
          <div className="footer-brand-col">
            <Link to="/" className="brand-link" style={{ color: 'var(--text-primary)' }}>
              <div className="brand-icon-box">
                <Building2 size={24} />
              </div>
              <div className="brand-text-col">
                <span className="brand-title" style={{ color: 'var(--text-primary)' }}>Katalogu <span style={{ color: '#14b8a6' }}>Lipjan</span></span>
                <span className="brand-subtitle" style={{ color: 'var(--text-muted)' }}>{tr('Komuna e Lipjanit')}</span>
              </div>
            </Link>
            <p>
              {tr('Portali informativ dhe katalogu digjital i ndërmarrjeve, dyqaneve dhe shërbimeve profesionale që operojnë në Komunën e Lipjanit.')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">{tr('Navigimi')}</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><Link to="/">{tr('Ballina')}</Link></li>
              <li className="footer-link-item"><Link to="/bizneset">{tr('Të Gjitha Bizneset')}</Link></li>
              <li className="footer-link-item"><Link to="/kategorite">{tr('Kategoritë Kryesore')}</Link></li>
              <li className="footer-link-item"><Link to="/vendbanimet">{tr('Vendbanimet e Lipjanit')}</Link></li>
              <li className="footer-link-item"><Link to="/shto-biznes">{tr('Regjistro Biznesin')}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-heading">{tr('Kategori të Shpeshta')}</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><Link to="/bizneset?kategoria=gastronomi">{tr('Gastronomi & Kafe')}</Link></li>
              <li className="footer-link-item"><Link to="/bizneset?kategoria=auto">{tr('Auto Servise')}</Link></li>
              <li className="footer-link-item"><Link to="/bizneset?kategoria=markete">{tr('Supermarkete')}</Link></li>
              <li className="footer-link-item"><Link to="/bizneset?kategoria=shendetesi">{tr('Barnatore & Klinika')}</Link></li>
              <li className="footer-link-item"><Link to="/bizneset?kategoria=ndertim">{tr('Ndërtim & Mobilieri')}</Link></li>
            </ul>
          </div>

          {/* Contact & Legal Notice */}
          <div>
            <h4 className="footer-heading">{tr('Informata & Kontakt')}</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <MapPin size={18} style={{ color: '#14b8a6', flexShrink: 0, marginTop: '2px' }} />
                <span>{tr('Sheshi "Adem Jashari", Lipjan, Republika e Kosovës')}</span>
              </li>
              <li className="footer-link-item" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Phone size={18} style={{ color: '#14b8a6', flexShrink: 0 }} />
                <span>{tr('+383 38 580 000 (Komuna)')}</span>
              </li>
              <li className="footer-link-item" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Mail size={18} style={{ color: '#14b8a6', flexShrink: 0 }} />
                <span>katalogu@lipjan-demo.rks</span>
              </li>
              <li className="footer-link-item" style={{ marginTop: '8px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  <ShieldAlert size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                  <span>{tr('Katalog demonstrativ i dizajnuar për prezantim të veprimtarive të Lipjanit.')}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom-bar">
          <div>
            &copy; {currentYear} {language === 'en' ? 'Lipjan Municipality Business Directory.' : 'Katalogu i Bizneseve të Komunës së Lipjanit.'} {tr('Të gjitha të drejtat e rezervuara.')}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/admin" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{tr('Paneli Admin')}</Link>
            <a href="https://kk.rks-gov.net/lipjan/" target="_blank" rel="noreferrer" style={{ color: '#14b8a6', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {tr('Komuna e Lipjanit')} <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
