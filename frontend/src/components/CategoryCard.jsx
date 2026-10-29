import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/useLanguage';
import {
  UtensilsCrossed,
  ShoppingBag,
  Car,
  HeartPulse,
  Laptop,
  Hammer,
  Sparkles,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

const ICON_MAP = {
  UtensilsCrossed,
  ShoppingBag,
  Car,
  HeartPulse,
  Laptop,
  Hammer,
  Sparkles,
  Briefcase
};

export default function CategoryCard({ category, businessCount }) {
  const { tr } = useLanguage();
  if (!category) return null;

  const IconComponent = ICON_MAP[category.icon] || Layers;
  const count = typeof businessCount === 'number'
    ? businessCount
    : (category.businesses_count ?? category.count ?? 0);

  return (
    <Link
      to={`/bizneset?kategoria=${category.slug || category.id}`}
      className="category-card"
      style={{ '--category-accent': category.color || '#0d9488' }}
      aria-label={`${tr('Shiko bizneset në kategorinë')} ${category.name}`}
    >
      <div
        className="cat-icon-badge"
        style={{
          backgroundColor: `${category.color || '#0d9488'}15`,
          color: category.color || '#0d9488'
        }}
      >
        <IconComponent size={24} />
      </div>

      <h3 className="cat-card-title">{category.name}</h3>
      <p className="cat-card-desc">{category.description}</p>

      <div className="cat-card-footer">
        <span className="cat-count">{count} {tr(count === 1 ? 'Biznes' : 'Biznese')}</span>
        <span className="cat-arrow">
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
