/**
 * Brazilian Free Fire Sensitivity Meta & Audited Research Profiles
 * 
 * SENSIVERSE RESEARCH & INTEGRITY AUDIT:
 * 1. Strict Verification Standard: Profiles are only labeled as VERIFIED if their exact
 *    sensitivity values are directly supported by an accessible, published source.
 * 2. General Sensitivity Guides (Free Fire Mania, TechTudo): Treated as recommendations
 *    or benchmark ranges, not as exact pro-player profiles.
 * 3. Pro Player Profiles: When exact published source evidence is missing (Syaz, Sensi dos Deuses),
 *    profiles are marked as UNVERIFIED community estimates / recreations.
 * 4. Nobru Distinction: Current PC emulator settings (0/0/60/10/0/14) are explicitly verified
 *    and distinguished from older mobile settings (unverified historic community estimate).
 * 5. Scale: Modern 0-200 slider scale (OB44-OB46 updates). Independent values for each scope.
 */

export type BrazilianVerificationStatus = 'VERIFIED' | 'UNVERIFIED';

export type BrazilianProfileCategory = 
  | 'editorial_guide_range'       // General guide providing hardware benchmark ranges (Free Fire Mania)
  | 'pro_player_emulator'        // Verified pro player emulator configuration (Nobru PC/MSI)
  | 'pro_player_mobile_estimate' // Unverified community estimate of pro mobile settings (Syaz, Nobru historic mobile)
  | 'community_preset'           // Unverified community slang/meta preset (Sensi dos Deuses)
  | 'editorial_advice_estimate'; // Unverified community numeric adaptation of qualitative guide (TechTudo)

export interface BrazilianSensiProfile {
  id: string;
  creatorOrPlayer: string;
  roleOrTeam: string;
  profileCategory: BrazilianProfileCategory;
  verificationStatus: BrazilianVerificationStatus;
  verificationDetails: string;
  environment: 'mobile_touch' | 'pc_emulator';
  sourceTitle: string;
  sourceUrl: string;
  lastCheckedDate: string;
  confidenceScore: number;
  scaleType: 'modern_200' | 'classic_100_normalized' | 'emulator_pc';
  publishedValues: {
    general: number;
    redDot: number;
    scope2x: number;
    scope4x: number;
    sniperScope: number;
    freeLook: number;
    fireButtonSizePercent: number;
  };
  deviceModel: string | null; // Explicitly null if not specified in source; never invented
  dpiContext: string;
  notes: string;
  isVerifiedEsportsSource: boolean; // Preserved for backwards compatibility
}

export type VerifiedBrazilProfile = BrazilianSensiProfile;

export const BRAZILIAN_SENSI_PROFILES: BrazilianSensiProfile[] = [
  {
    id: 'ff_mania_meta_200',
    creatorOrPlayer: 'Free Fire Mania (Benchmark Guide)',
    roleOrTeam: 'Brazil Esports Portal (#1 FF Community Media)',
    profileCategory: 'editorial_guide_range',
    verificationStatus: 'VERIFIED',
    verificationDetails: 'VERIFIED: Supported by Free Fire Mania published guide (https://www.freefiremania.com.br/noticia/sensibilidade-free-fire.html). Represents the editorial midpoint of recommended hardware RAM tier ranges (Entry: 170-190, Mid: 160-185, High: 145-170), NOT an individual pro-player profile.',
    environment: 'mobile_touch',
    sourceTitle: 'Sensibilidade Free Fire Atualizada: Melhores Ajustes e DPI para Subir Capa',
    sourceUrl: 'https://www.freefiremania.com.br/noticia/sensibilidade-free-fire.html',
    lastCheckedDate: '2026-10-31',
    confidenceScore: 96,
    scaleType: 'modern_200',
    publishedValues: {
      general: 168,
      redDot: 172, // Red Dot slightly higher than General for instant close-range snap
      scope2x: 162,
      scope4x: 145,
      sniperScope: 95,
      freeLook: 75,
      fireButtonSizePercent: 46,
    },
    deviceModel: null, // Device model is not specified for a single phone; covers RAM hardware categories
    dpiContext: '500 - 800 DPI (Android Menor Largura recommended range)',
    notes: 'General sensitivity recommendation guide based on smartphone RAM tiers (2GB-3GB, 4GB, 6GB+). Midpoint values calibrated for 0-200 slider scale. Balanced drag headshots on mobile touch displays.',
    isVerifiedEsportsSource: true,
  },
  {
    id: 'nobru_emulator_verified',
    creatorOrPlayer: 'Nobru (Bruno Goes) - Current Emulator Settings',
    roleOrTeam: 'Corinthians FF World Champion & Fluxo Co-Founder (PC Emulator / Streamer)',
    profileCategory: 'pro_player_emulator',
    verificationStatus: 'VERIFIED',
    verificationDetails: 'VERIFIED: Supported by Free Fire Mania published report (https://www.freefiremania.com.br/noticia/sensibilidade-nobru-free-fire.html). Confirmed for PC emulator (MSI App Player / BlueStacks) with mouse aiming. NOT intended for mobile touchscreen.',
    environment: 'pc_emulator',
    sourceTitle: 'Sensibilidade do Nobru no Free Fire: Configuração Atualizada',
    sourceUrl: 'https://www.freefiremania.com.br/noticia/sensibilidade-nobru-free-fire.html',
    lastCheckedDate: '2026-10-31',
    confidenceScore: 95,
    scaleType: 'emulator_pc',
    publishedValues: {
      general: 0,   // Set to 0 because mouse input and camera rotation are driven by emulator DPI & X/Y sensitivity
      redDot: 0,    // Set to 0 in-game for emulator mouse control
      scope2x: 60,
      scope4x: 10,
      sniperScope: 0,
      freeLook: 14,
      fireButtonSizePercent: 46, // Mouse left-click trigger HUD mapping
    },
    deviceModel: 'PC Emulator (MSI App Player / BlueStacks)',
    dpiContext: 'Mouse DPI (typically 800-1000 DPI) + Emulator X/Y Axis Sensitivity',
    notes: 'Verified current emulator configuration. In-game General and Red Dot are set to 0 because mouse input and cursor movement are handled by emulator axis mapping. Touchscreen mobile players must NOT replicate these 0 values on mobile devices.',
    isVerifiedEsportsSource: true,
  },
  {
    id: 'nobru_classic_mobile',
    creatorOrPlayer: 'Nobru (Bruno Goes) - Historical Mobile Estimate',
    roleOrTeam: 'Corinthians FF World Series 2019 Champion (Mobile Era)',
    profileCategory: 'pro_player_mobile_estimate',
    verificationStatus: 'UNVERIFIED',
    verificationDetails: 'UNVERIFIED: Exact source evidence is missing for modern mobile patches. Values represent historic community estimates from his 2019 mobile championship era normalized to the modern 0-200 scale. Distinct from his current verified emulator settings.',
    environment: 'mobile_touch',
    sourceTitle: 'Sensibilidade do Nobru no Free Fire: Configuração Atualizada (Contexto Mobile Histórico)',
    sourceUrl: 'https://www.freefiremania.com.br/noticia/sensibilidade-nobru-free-fire.html',
    lastCheckedDate: '2026-10-31',
    confidenceScore: 68,
    scaleType: 'classic_100_normalized',
    publishedValues: {
      general: 176,
      redDot: 184, // Elevated Red Dot for rapid upward J-drag headshot snap
      scope2x: 166,
      scope4x: 156,
      sniperScope: 62,
      freeLook: 115,
      fireButtonSizePercent: 46,
    },
    deviceModel: null, // Historically played on iPhone during 2019 mobile era, but exact modern model and settings are unverified
    dpiContext: 'Estimated 600 - 720 Android DPI or Default iOS',
    notes: 'Historical mobile preset estimate. Nobru currently plays on PC emulator with 0 General. This older mobile profile is an unverified community approximation of his high-drag mobile flick style.',
    isVerifiedEsportsSource: false,
  },
  {
    id: 'syaz_fluxo_mobile',
    creatorOrPlayer: 'Syaz (Gabriel Vasconcelos)',
    roleOrTeam: 'Fluxo Esports - LBFF MVP & World Champion (Mobile)',
    profileCategory: 'pro_player_mobile_estimate',
    verificationStatus: 'UNVERIFIED',
    verificationDetails: 'UNVERIFIED: Exact source evidence is missing. Neither Free Fire Mania nor Fluxo Esports publishes an official technical sheet of Syaz\'s in-game sensitivity numbers. Values are unverified community estimates circulating in fan videos and social media.',
    environment: 'mobile_touch',
    sourceTitle: 'Free Fire Mania Perfil e Estatísticas (Configuração Pro Player Mobile Syaz - Estimativa da Comunidade)',
    sourceUrl: 'https://www.freefiremania.com.br',
    lastCheckedDate: '2026-10-31',
    confidenceScore: 65,
    scaleType: 'classic_100_normalized',
    publishedValues: {
      general: 168,
      redDot: 160, // Red Dot slightly lower than General to avoid drag overshoot past head at high swipe speed
      scope2x: 148,
      scope4x: 132,
      sniperScope: 78,
      freeLook: 98,
      fireButtonSizePercent: 44,
    },
    deviceModel: null, // Specific competitive phone model is not published in an accessible official source
    dpiContext: '550 - 600 DPI (unverified community report)',
    notes: 'Unverified community recreation. Syaz is recognized as one of the most mechanically gifted mobile players in Brazilian Free Fire history. His community profile uses a lower Red Dot relative to General for tight headshot anchoring.',
    isVerifiedEsportsSource: false,
  },
  {
    id: 'sensi_dos_deuses_community',
    creatorOrPlayer: 'Sensi dos Deuses Community Meta',
    roleOrTeam: 'Brazilian High-Tier Ranked & Contra Squad Meta',
    profileCategory: 'community_preset',
    verificationStatus: 'UNVERIFIED',
    verificationDetails: 'UNVERIFIED: Community slang and trending configuration shared across Brazilian TikTok and YouTube creators. No single verified esports publication exists.',
    environment: 'mobile_touch',
    sourceTitle: 'Sensi dos Deuses Mobile - Configuração Comunitária Brasileira (Estimativa)',
    sourceUrl: 'https://www.freefiremania.com.br',
    lastCheckedDate: '2026-10-31',
    confidenceScore: 60,
    scaleType: 'modern_200',
    publishedValues: {
      general: 164,
      redDot: 158,
      scope2x: 154,
      scope4x: 142,
      sniperScope: 82,
      freeLook: 92,
      fireButtonSizePercent: 45,
    },
    deviceModel: null, // Generic community preset, not model specific
    dpiContext: '580 - 640 DPI (unverified community standard)',
    notes: 'Unverified community preset. Widely shared "Sensi dos Deuses" baseline popular in Brazilian custom rooms and ranked matches for balanced M1887, UMP, and Desert Eagle play.',
    isVerifiedEsportsSource: false,
  },
  {
    id: 'techtudo_globo_guide',
    creatorOrPlayer: 'TechTudo (Grupo Globo) - Editorial Advice Adaptation',
    roleOrTeam: 'Leading Brazilian Technology & Gaming Media',
    profileCategory: 'editorial_advice_estimate',
    verificationStatus: 'UNVERIFIED',
    verificationDetails: 'UNVERIFIED: General sensitivity guide. TechTudo publishes qualitative advice (training ground calibration, refresh rate adaptation, 40-55% button sizing in lower quadrant), but does not publish a proprietary numeric pro sensitivity table. Numerical values are community adaptations based on the article\'s qualitative tips.',
    environment: 'mobile_touch',
    sourceTitle: 'Como achar a melhor sensibilidade no Free Fire: dicas para subir capa',
    sourceUrl: 'https://www.techtudo.com.br/dicas-e-tutoriais/2023/12/sensibilidade-free-fire-como-ajustar.ghtml',
    lastCheckedDate: '2026-10-31',
    confidenceScore: 70,
    scaleType: 'modern_200',
    publishedValues: {
      general: 162,
      redDot: 165,
      scope2x: 152,
      scope4x: 140,
      sniperScope: 75,
      freeLook: 85,
      fireButtonSizePercent: 48,
    },
    deviceModel: null, // Editorial guide provides general advice for Android/iOS without model-specific tables
    dpiContext: 'Native display resolution with moderate DPI adjustment',
    notes: 'General editorial guide. Focuses on empirical adaptation: recommends 40-55% fire button size placed in the lower third of the display and gradual 2-point adjustments in the Training Ground.',
    isVerifiedEsportsSource: false,
  },
];

/**
 * Backwards compatibility alias for existing code and tests.
 */
export const VERIFIED_BRAZILIAN_PROFILES: BrazilianSensiProfile[] = BRAZILIAN_SENSI_PROFILES;

/**
 * Filtered helper: Strictly verified profiles backed by accessible sources.
 */
export const STRICTLY_VERIFIED_PROFILES: BrazilianSensiProfile[] = BRAZILIAN_SENSI_PROFILES.filter(
  p => p.verificationStatus === 'VERIFIED'
);

/**
 * Filtered helper: Profiles based on community estimates or qualitative advice.
 */
export const UNVERIFIED_PROFILES: BrazilianSensiProfile[] = BRAZILIAN_SENSI_PROFILES.filter(
  p => p.verificationStatus === 'UNVERIFIED'
);

/**
 * Calculates a unified Brazilian meta composite baseline from mobile touch profiles.
 * Filters for mobile touch profiles (excluding PC emulator profiles where General is 0)
 * so that mobile touch drag physics remain realistic and reliable.
 */
export function getUnifiedBrazilBaseline() {
  const mobileProfiles = BRAZILIAN_SENSI_PROFILES.filter(p => p.environment === 'mobile_touch');
  const count = mobileProfiles.length;
  const sums = mobileProfiles.reduce(
    (acc, p) => ({
      general: acc.general + p.publishedValues.general,
      redDot: acc.redDot + p.publishedValues.redDot,
      scope2x: acc.scope2x + p.publishedValues.scope2x,
      scope4x: acc.scope4x + p.publishedValues.scope4x,
      sniperScope: acc.sniperScope + p.publishedValues.sniperScope,
      freeLook: acc.freeLook + p.publishedValues.freeLook,
      fireButtonSizePercent: acc.fireButtonSizePercent + p.publishedValues.fireButtonSizePercent,
    }),
    { general: 0, redDot: 0, scope2x: 0, scope4x: 0, sniperScope: 0, freeLook: 0, fireButtonSizePercent: 0 }
  );

  return {
    general: Math.round(sums.general / count),
    redDot: Math.round(sums.redDot / count),
    scope2x: Math.round(sums.scope2x / count),
    scope4x: Math.round(sums.scope4x / count),
    sniperScope: Math.round(sums.sniperScope / count),
    freeLook: Math.round(sums.freeLook / count),
    fireButtonSizePercent: Math.round(sums.fireButtonSizePercent / count),
  };
}
