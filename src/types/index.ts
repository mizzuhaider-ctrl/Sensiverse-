export type GameId = 'freefire_india' | 'freefire_max' | 'freefire' | 'bgmi' | 'pubg' | 'codm';

export type GripStyle = '2finger' | '3finger' | '4finger' | 'gyro_hybrid' | 'gyro_full';

export type Playstyle = 'onetap' | 'drag' | 'recoil' | 'rusher' | 'balanced' | 'sniper';

export type WeaponCategory = 'smg' | 'shotgun' | 'ar' | 'sniper' | 'pistol' | 'marksman';

export type VerificationStatus = 'verified' | 'partially_verified' | 'custom';

export type EvidenceCategory = 
  | 'official_manufacturer' 
  | 'published_reference' 
  | 'algorithmic_estimate' 
  | 'physically_tested';

export interface PhoneModel {
  id: string;
  brand: string;
  name: string;
  series?: string;
  releaseYear?: number | null;
  region?: string | null;
  screenSize: number; // inches e.g. 6.67
  aspectRatio?: string; // e.g. '19.5:9', '20:9', '19.3:9'
  resolution?: string | null;
  refreshRate: number; // 60, 90, 120, 144, 165, 185
  touchSamplingRate: number | null; // Hz (e.g. 180, 240, 360, 480, 720, 960) or null if undocumented
  touchSamplingRateVerified?: boolean; // true if documented by manufacturer, false if estimated
  chipset?: string | null;
  gpu?: string | null;
  nativePpi?: number | null;
  recommendedDpi: number; // Developer options Smallest Width / DPI calibration index
  hasHardwareGyro?: boolean;
  maxGameFps?: {
    freefire?: number;
    bgmi?: number;
    pubg?: number;
    codm?: number;
  };
  category: 'flagship' | 'gaming' | 'midrange' | 'budget';
  specsSource?: string;
  researchDate?: string;
  verificationStatus: VerificationStatus;
  isDiscontinued?: boolean;
  popular?: boolean;
}

export interface FreeFireSensi {
  general: number; // 0 - 200 (Free Fire MAX OB44-OB46 official scale)
  redDot: number; // 0 - 200
  scope2x: number; // 0 - 200
  scope4x: number; // 0 - 200
  sniperScope: number; // 0 - 200
  freeLook: number; // 0 - 200
}

export interface ScopeSensiMap {
  thirdPersonNoScope: number; // 1 - 300 (or up to 400 for gyro)
  firstPersonNoScope: number;
  redDot: number;
  scope2x: number;
  scope3x: number;
  scope4x: number;
  scope6x: number;
  scope8x: number;
}

export interface BgmiPubgSensi {
  camera: ScopeSensiMap;
  ads: ScopeSensiMap;
  gyroscope: ScopeSensiMap;
  gyroAds: ScopeSensiMap;
  freeLook: {
    thirdPerson: number;
    cameraParachute: number;
    firstPerson: number;
  };
}

export interface CodmScopeMap {
  standard: number; // 1 - 300
  ads: number;
  tacticalScope: number;
  sniperScope: number;
  scope3x: number;
  scope4x: number;
  scope6x: number;
  scope8x: number;
}

export interface CodmModeSensi {
  rotationMode: 'fixed_speed' | 'speed_accel' | 'distance_accel';
  accelerationValue: number; // 0-300, usually 100-140 if accel active
  camera: CodmScopeMap;
  firingAds: CodmScopeMap;
  gyroscope: CodmScopeMap;
  gyroFiring: CodmScopeMap;
}

export interface CodmSensi {
  activeMode: 'mp' | 'br';
  mp: CodmModeSensi;
  br: CodmModeSensi;
  // Flattened active mode accessors for backwards compatibility
  rotationMode: 'fixed_speed' | 'speed_accel' | 'distance_accel';
  accelerationValue: number;
  camera: CodmScopeMap;
  firingAds: CodmScopeMap;
  gyroscope: CodmScopeMap;
  gyroFiring: CodmScopeMap;
}

export type SensitivityOutput = 
  | { gameId: 'freefire_india'; data: FreeFireSensi }
  | { gameId: 'freefire'; data: FreeFireSensi }
  | { gameId: 'freefire_max'; data: FreeFireSensi }
  | { gameId: 'bgmi'; data: BgmiPubgSensi }
  | { gameId: 'pubg'; data: BgmiPubgSensi }
  | { gameId: 'codm'; data: CodmSensi };

export interface AimTelemetry {
  aimSpeed: 'slower' | 'balanced' | 'faster';
  dragControl: 'smaller' | 'similar' | 'larger';
  overshootRisk: 'low' | 'medium' | 'high';
  recoilControl: 'stable' | 'climbing' | 'excessive_pull';
  confidenceScore: number; // 0 to 100%
  evidenceCategory: EvidenceCategory;
  reasons: string[];
  screenDragRunwayMm: number;
  latencyEstimationExplanation: string;
}

export interface FireButtonConfig {
  sizePercent: number; // e.g. 52%
  positionX: number; // percentage from right
  positionY: number; // percentage from bottom
  joystickSize: number; // e.g. 65%
  dragTechnique: 'straight' | 'j_drag' | 'rotation' | 'pull_down';
  dragTechniqueName: string;
  dragTip: string;
  hudLayoutType: '2finger' | '3finger' | '4finger';
  recommendedRange: { min: number; max: number };
  dominantFinger: 'right_thumb' | 'left_index' | 'right_index';
}

export interface CalibrationResult {
  sensitivity: SensitivityOutput;
  fireButton: FireButtonConfig;
  telemetry: AimTelemetry;
  weaponCategory?: WeaponCategory;
}

export interface SavedPreset {
  id: string;
  name: string;
  timestamp: number;
  gameId: GameId;
  phoneBrand: string;
  phoneModel: string;
  refreshRate: number;
  touchSamplingRate: number | null;
  gripStyle: GripStyle;
  playstyle: Playstyle;
  weaponCategory?: WeaponCategory;
  selectedFps?: number;
  sensitivity: SensitivityOutput;
  fireButton: FireButtonConfig;
  telemetry?: AimTelemetry;
  notes?: string;
}

export type IssueDiagnosticType = 
  | 'overshooting'
  | 'slow_aim'
  | 'shaky_aim'
  | 'recoil_problems'
  | 'drag_over_head'
  | 'stick_to_chest'
  | 'recoil_climbing'
  | 'gyro_jittery'
  | 'slow_flick_180'
  | 'sniper_missing';

export interface DiagnosticQuestionnaire {
  selectedFps: number;
  hasTriedTrainingGround: boolean;
  shotsAttempted?: number;
  shotsHeadshots?: number;
  primaryProblem: IssueDiagnosticType;
  currentFireButtonSize?: number;
}
