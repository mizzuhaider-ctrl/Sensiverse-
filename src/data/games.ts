import { GameId } from '../types';

export interface GameInfo {
  id: GameId;
  name: string;
  tagline: string;
  badge: string;
  developer: string;
  engineStyle: 'fast_drag' | 'recoil_spray' | 'hybrid_movement';
  color: string;
  accent: string;
  features: string[];
  scopeLabels: Record<string, string>;
  fireButtonGuide: {
    recommendedRange: string;
    description: string;
  };
}

export const USER_FACING_GAMES: GameId[] = ['freefire_india', 'freefire_max'];

export const GAMES_DATA: Record<GameId, GameInfo> = {
  freefire_india: {
    id: 'freefire_india',
    name: 'Free Fire India 🇮🇳',
    tagline: 'Phone-specific starting sensitivity & drag-headshot control',
    badge: 'India Edition',
    developer: 'Garena',
    engineStyle: 'fast_drag',
    color: '#00FF66',
    accent: '#00FF66',
    features: [
      'Phone-Specific Starting Sensitivity',
      'Drag-Headshot Control Tuning',
      'Training Ground Testing Routine',
      'Optimal Fire Button Runway (40% - 55%)'
    ],
    scopeLabels: {
      general: 'General Sensitivity',
      redDot: 'Red Dot Sight',
      scope2x: '2x Scope',
      scope4x: '4x Scope',
      sniperScope: 'Sniper Scope (AWM/M82B)',
      freeLook: 'Free Look Eye'
    },
    fireButtonGuide: {
      recommendedRange: '40% - 55%',
      description: 'Strict 40% - 55% button sizing calibrated for Indian competitive rooms and drag flick runway before hitting top phone bezels.'
    }
  },
  freefire_max: {
    id: 'freefire_max',
    name: 'Free Fire MAX 🔥',
    tagline: 'Enhanced HD graphics & tournament verified drag-headshot engine',
    badge: 'OB46 Verified',
    developer: 'Garena',
    engineStyle: 'fast_drag',
    color: '#00FF66',
    accent: '#00FF66',
    features: [
      'Official FFWS Pro Standard (OB46)',
      'Verified Drag Headshot Scaling',
      'High-Refresh 60/90FPS Smoothing',
      'Fire Button Lift-Off Geometry'
    ],
    scopeLabels: {
      general: 'General Sensitivity',
      redDot: 'Red Dot Sight',
      scope2x: '2x Scope',
      scope4x: '4x Scope',
      sniperScope: 'Sniper Scope (AWM/M82B)',
      freeLook: 'Free Look Eye'
    },
    fireButtonGuide: {
      recommendedRange: '40% - 55%',
      description: 'Smaller buttons (40-52%) allow maximum thumb travel space for vertical upward drags to snap directly onto the opponent’s head hitbox.'
    }
  },
  freefire: {
    id: 'freefire',
    name: 'Free Fire',
    tagline: 'Standard drag-headshot dynamics & fast-response auto-aim',
    badge: 'FF OB45-OB46',
    developer: 'Garena',
    engineStyle: 'fast_drag',
    color: '#00FF66',
    accent: '#10b981',
    features: [
      'Auto-Aim Drag Calibration',
      'Red Dot Flick Response',
      'Sniper Quick-Switch Smoothing',
      'Fire Button Lift-Off Calculation'
    ],
    scopeLabels: {
      general: 'General Sensitivity',
      redDot: 'Red Dot Sight',
      scope2x: '2x Scope',
      scope4x: '4x Scope',
      sniperScope: 'Sniper Scope (AWM/M82B)',
      freeLook: 'Free Look Eye'
    },
    fireButtonGuide: {
      recommendedRange: '40% - 55%',
      description: 'Strict 40% - 55% button sizing ensures ample vertical swipe runway to snap directly onto the opponent’s head hitbox without colliding with physical phone bezels.'
    }
  },
  bgmi: {
    id: 'bgmi',
    name: 'BGMI',
    tagline: 'Precision ADS recoil spray & full gyro control',
    badge: 'BGMI 3.4+ / Krafton',
    developer: 'Krafton India',
    engineStyle: 'recoil_spray',
    color: '#00FF66',
    accent: '#06b6d4',
    features: [
      'Full Gyroscope Calibration (300-400%)',
      'ADS Spray Recoil Compensation',
      'Camera Tracking Multiplier',
      'M416 3x / 6x Converted Scope Tuning'
    ],
    scopeLabels: {
      thirdPersonNoScope: '3rd Person No Scope (Camera)',
      firstPersonNoScope: '1st Person No Scope',
      redDot: 'Red Dot & Holographic',
      scope2x: '2x Scope',
      scope3x: '3x Scope (Standard Spray)',
      scope4x: '4x Scope (DMR / Spray)',
      scope6x: '6x Scope (Full / Converted)',
      scope8x: '8x Scope (Bolt Action Sniper)'
    },
    fireButtonGuide: {
      recommendedRange: '58% - 70%',
      description: 'Right fire button (Thumb) or Left fire button (Index Finger). Thumb players need 62-68% for pull-down spray stability; Claw players place it top-left at 75-90%.'
    }
  },
  pubg: {
    id: 'pubg',
    name: 'PUBG Mobile',
    tagline: 'Global tournament recoil & ultra-low latency gyro',
    badge: 'PUBG Global 3.4+',
    developer: 'Level Infinite / Tencent',
    engineStyle: 'recoil_spray',
    color: '#00FF66',
    accent: '#f59e0b',
    features: [
      '90FPS & 120FPS Touch Alignment',
      'Advanced Gyro ADS Splitting',
      'Horizontal Recoil Stabilization',
      'CQC Close-Combat Micro-Flicks'
    ],
    scopeLabels: {
      thirdPersonNoScope: '3rd Person No Scope',
      firstPersonNoScope: '1st Person No Scope',
      redDot: 'Red Dot, Holographic, Iron Sight',
      scope2x: '2x Scope',
      scope3x: '3x Scope (M416 / ACE32)',
      scope4x: '4x Scope (M416 / Mini14)',
      scope6x: '6x Scope (Downscaled to 3x)',
      scope8x: '8x Scope (AWM / Kar98k / M24)'
    },
    fireButtonGuide: {
      recommendedRange: '60% - 72%',
      description: 'Optimized for high-speed touch responsiveness. Keep thumb pull-down unobstructed on lower right quadrant.'
    }
  },
  codm: {
    id: 'codm',
    name: 'COD Mobile',
    tagline: 'Speed acceleration & slide-cancel fast flicks',
    badge: 'Season 10 / Activision',
    developer: 'Activision',
    engineStyle: 'hybrid_movement',
    color: '#00FF66',
    accent: '#8b5cf6',
    features: [
      'Fixed Speed vs Distance Acceleration',
      'Sniper Quick-Scope ADS Balance',
      'Slide-Cancel Camera Multipliers',
      'BR & MP Dedicated Calibration'
    ],
    scopeLabels: {
      standard: 'Standard Sensitivity (Looking)',
      ads: 'ADS Sensitivity (Aim Down Sight)',
      tacticalScope: 'Tactical Scope (1.5x)',
      sniperScope: 'Sniper Scope (DL Q33 / Locus)',
      scope3x: '3x Tactical Scope',
      scope4x: '4x Tactical Scope',
      scope6x: '6x Scope',
      scope8x: '8x Scope (BR Sniper)'
    },
    fireButtonGuide: {
      recommendedRange: '52% - 65%',
      description: 'Claw players use 1-Tap ADS button top-left. Manual ADS + Hipfire setup should maintain a dedicated hip-fire button at 55% for quick shotgun / SMG close quarters.'
    }
  }
};
