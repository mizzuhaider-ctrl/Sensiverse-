import { WeaponCategory } from '../types';

export interface WeaponCategoryInfo {
  id: WeaponCategory;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  combatRole: string;
  representativeGuns: string[];
  optimalDistance: string;
  dragTechniqueRecommended: string;
  recommendedFireButtonRange: string;
  icon: string;
}

export const WEAPON_CATEGORIES: Record<WeaponCategory, WeaponCategoryInfo> = {
  smg: {
    id: 'smg',
    name: 'SMG',
    badge: 'Drag-Headshot Profile',
    tagline: 'High fire-rate drag headshots before bullet spread bloom',
    description: 'One starting profile designed for drag-headshot play across SMG weapons. Generates elevated General and Red Dot flick responsiveness so rapid vertical swipes register clean headshots within the first 3–5 bullets.',
    combatRole: 'Close-to-Mid Range Rapid Drag',
    representativeGuns: ['MP40', 'UMP', 'Thompson', 'MAC10', 'Bizon'],
    optimalDistance: '5m – 20m',
    dragTechniqueRecommended: 'Fast Straight Vertical Drag or High J-Drag',
    recommendedFireButtonRange: '46% – 49%',
    icon: '⚡',
  },
  shotgun: {
    id: 'shotgun',
    name: 'Shotgun',
    badge: 'One-Tap & Close Drag Profile',
    tagline: 'Close-range one-tap and aggressive drag headshots',
    description: 'One profile for close-range one-tap and drag headshots. Calibrates maximum initial General camera acceleration with a slightly enlarged fire button in the lower display quadrant to ensure huge upward thumb flick runway.',
    combatRole: 'Point-Blank Burst & 1-Tap Jump Flicks',
    representativeGuns: ['M1887', 'M1014', 'MAG-7', 'SPAS12', 'Charge Buster'],
    optimalDistance: '2m – 10m',
    dragTechniqueRecommended: 'Rotational Drag / Deep J-Drag Flick',
    recommendedFireButtonRange: '50% – 54%',
    icon: '💥',
  },
  ar: {
    id: 'ar',
    name: 'AR',
    badge: 'Aiming & Recoil Control Profile',
    tagline: 'Mid-range bullet spray stabilization and scope tracking',
    description: 'One profile for aiming and recoil control. Damps General sensitivity slightly while balancing 2X and 4X optical tracking, preventing sustained full-auto spray from kicking above the enemy head.',
    combatRole: 'Mid-to-Long Range Sustained Burst',
    representativeGuns: ['AK', 'M4A1', 'SCAR', 'GROZA', 'XM8', 'AN94'],
    optimalDistance: '15m – 50m',
    dragTechniqueRecommended: 'Gentle Controlled Drag & Pull-Down Stabilization',
    recommendedFireButtonRange: '48% – 52%',
    icon: '🎯',
  },
  sniper: {
    id: 'sniper',
    name: 'Sniper',
    badge: 'Scope Precision Profile',
    tagline: 'Pixel-accurate optical tracking and fast-switch aiming',
    description: 'One profile for scope precision. Features precision-damped Sniper Scope sensitivity (52–68 range) to eliminate crosshair jitter and pixel skipping during high-magnification targeting and quick-switch shots.',
    combatRole: 'Long Range Precision Optical Sniping',
    representativeGuns: ['AWM', 'M82B', 'Kar98k', 'Treatment Sniper'],
    optimalDistance: '40m – 120m',
    dragTechniqueRecommended: 'Quick-Scope Micro-Flick & Center-Dot Pre-Aim',
    recommendedFireButtonRange: '48% – 51%',
    icon: '🔭',
  },
  pistol: {
    id: 'pistol',
    name: 'Pistol',
    badge: 'Accurate Aiming Profile',
    tagline: 'First-shot accuracy and crisp one-tap headshot alignment',
    description: 'One profile for accurate aiming. Calibrates sharp Red Dot alignment and crisp General camera velocity to give maximum accuracy on single-tap pistols in Clash Squad first rounds and early battle royale.',
    combatRole: 'Single-Tap Headshot Taps & CQC Secondary',
    representativeGuns: ['Desert Eagle', 'M500', 'USP', 'G18', 'Mini Uzi'],
    optimalDistance: '3m – 25m',
    dragTechniqueRecommended: 'Instant Quick-Lift Drag / Tap-and-Flick',
    recommendedFireButtonRange: '48% – 51%',
    icon: '🔫',
  },
  marksman: {
    id: 'marksman',
    name: 'Marksman',
    badge: 'Controlled Aiming Profile',
    tagline: 'Rhythmic semi-auto headshots without vertical drift',
    description: 'One profile for precision and controlled aiming. Perfectly balances Red Dot and 4X scope stability for semi-automatic rhythmic tapping, preventing reticle bloom and excessive vertical climb between shots.',
    combatRole: 'Mid-to-Long Range High-Damage Rhythmic Taps',
    representativeGuns: ['Woodpecker', 'SVD', 'AC80', 'SKS'],
    optimalDistance: '20m – 60m',
    dragTechniqueRecommended: 'Rhythmic Micro-Drag & Reticle Reset Interval',
    recommendedFireButtonRange: '48% – 52%',
    icon: '🎖️',
  },
};

export const WEAPON_CATEGORY_LIST: WeaponCategory[] = [
  'smg',
  'shotgun',
  'ar',
  'sniper',
  'pistol',
  'marksman',
];
