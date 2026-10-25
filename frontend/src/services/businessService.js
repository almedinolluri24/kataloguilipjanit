import { CATEGORIES, SETTLEMENTS, INITIAL_BUSINESSES, INITIAL_ADVERTISEMENTS } from '../data/mockData';

const STORAGE_KEYS = {
  BUSINESSES: 'katalogu_lipjan_businesses',
  CATEGORIES: 'katalogu_lipjan_categories',
  SETTLEMENTS: 'katalogu_lipjan_settlements',
  ADS: 'katalogu_lipjan_advertisements'
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}:`, e);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing localStorage for key ${key}:`, e);
  }
}

export const businessService = {
  // Businesses
  getAllBusinesses(includeUnpublished = false) {
    const list = safeGet(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    if (includeUnpublished) return list;
    return list.filter((b) => b.status === 'published');
  },

  getBusinessById(id) {
    const list = safeGet(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    return list.find((b) => String(b.id) === String(id) || b.slug === id) || null;
  },

  createBusiness(businessData) {
    const list = safeGet(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    const newId = `b-${Date.now()}`;
    const slug = (businessData.name || 'biznes')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newBusiness = {
      ...businessData,
      id: newId,
      slug: `${slug}-${Math.floor(Math.random() * 900 + 100)}`,
      rating: businessData.rating ? Number(businessData.rating) : 5.0,
      reviewCount: businessData.reviewCount ? Number(businessData.reviewCount) : 1,
      status: businessData.status || 'published',
      featured: Boolean(businessData.featured),
      isDemo: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newBusiness, ...list];
    safeSet(STORAGE_KEYS.BUSINESSES, updated);
    return newBusiness;
  },

  updateBusiness(id, updateData) {
    const list = safeGet(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    const index = list.findIndex((b) => String(b.id) === String(id));
    if (index === -1) return null;

    const updatedItem = {
      ...list[index],
      ...updateData,
      id: list[index].id, // protect id
      updatedAt: new Date().toISOString().split('T')[0]
    };

    list[index] = updatedItem;
    safeSet(STORAGE_KEYS.BUSINESSES, [...list]);
    return updatedItem;
  },

  deleteBusiness(id) {
    const list = safeGet(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    const filtered = list.filter((b) => String(b.id) !== String(id));
    safeSet(STORAGE_KEYS.BUSINESSES, filtered);
    return true;
  },

  // Categories & Settlements
  getCategories() {
    return safeGet(STORAGE_KEYS.CATEGORIES, CATEGORIES);
  },

  getCategoryById(id) {
    const cats = this.getCategories();
    return cats.find((c) => c.id === id || c.slug === id) || null;
  },

  getSettlements() {
    return safeGet(STORAGE_KEYS.SETTLEMENTS, SETTLEMENTS);
  },

  getSettlementById(id) {
    const sets = this.getSettlements();
    return sets.find((s) => s.id === id) || null;
  },

  // Advertisements
  getAdvertisements(includeInactive = false) {
    const ads = safeGet(STORAGE_KEYS.ADS, INITIAL_ADVERTISEMENTS);
    if (includeInactive) return ads;
    return ads.filter((ad) => ad.status === 'active');
  },

  createAdvertisement(adData) {
    const ads = safeGet(STORAGE_KEYS.ADS, INITIAL_ADVERTISEMENTS);
    const newAd = {
      ...adData,
      id: `ad-${Date.now()}`,
      status: adData.status || 'active'
    };
    const updated = [newAd, ...ads];
    safeSet(STORAGE_KEYS.ADS, updated);
    return newAd;
  },

  updateAdvertisement(id, updateData) {
    const ads = safeGet(STORAGE_KEYS.ADS, INITIAL_ADVERTISEMENTS);
    const index = ads.findIndex((a) => String(a.id) === String(id));
    if (index === -1) return null;

    ads[index] = { ...ads[index], ...updateData };
    safeSet(STORAGE_KEYS.ADS, [...ads]);
    return ads[index];
  },

  deleteAdvertisement(id) {
    const ads = safeGet(STORAGE_KEYS.ADS, INITIAL_ADVERTISEMENTS);
    const filtered = ads.filter((a) => String(a.id) !== String(id));
    safeSet(STORAGE_KEYS.ADS, filtered);
    return true;
  },

  // Reset to defaults
  resetToDefaults() {
    safeSet(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
    safeSet(STORAGE_KEYS.CATEGORIES, CATEGORIES);
    safeSet(STORAGE_KEYS.SETTLEMENTS, SETTLEMENTS);
    safeSet(STORAGE_KEYS.ADS, INITIAL_ADVERTISEMENTS);
    return true;
  }
};
