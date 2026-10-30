import { PhoneModel } from '../types';
import { 
  ALL_VERIFIED_PHONES, 
  ALL_BRANDS, 
  getModelsForBrand, 
  getBrandsForCategory,
  getDatabaseStatistics,
  CUSTOM_DEVICE_TEMPLATE 
} from './phones/index';

export const PHONE_DATABASE: PhoneModel[] = ALL_VERIFIED_PHONES;

export const POPULAR_BRANDS = ALL_BRANDS;

export function getModelsByBrand(brand: string, categoryFilter?: 'all' | 'gaming'): PhoneModel[] {
  return getModelsForBrand(brand, categoryFilter);
}

export { getBrandsForCategory };

export function searchPhoneModels(query: string): PhoneModel[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return PHONE_DATABASE.slice(0, 20);
  return PHONE_DATABASE.filter(p => 
    p.name.toLowerCase().includes(clean) || 
    p.brand.toLowerCase().includes(clean)
  );
}

export { getDatabaseStatistics, CUSTOM_DEVICE_TEMPLATE };
