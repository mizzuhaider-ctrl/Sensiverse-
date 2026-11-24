import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Crosshair,
  Cpu,
  Flame,
  Gauge,
  Monitor,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  FreeFireSensi,
  GameId,
  GripStyle,
  PhoneModel,
  Playstyle,
  WeaponCategory,
} from '../types';
import {
  BRAND_SLUG_ENTRIES,
  TOP_50_PHONE_ROUTES,
  buildBrandPath,
  buildPhonesHubPath,
  findTopPhoneRouteById,
  getComparableTopPhoneRoutes,
} from '../utils/slugs';
import {
  getCachedBrandPhones,
  loadBrandPhones,
} from '../data/phones/asyncLoader';
import {
  calculatePresetVariation,
  calculateSensitivity,
} from '../utils/sensitivityEngine';
import { getDeviceFpsCapability } from '../utils/fpsEngine';
import { WEAPON_CATEGORIES, WEAPON_CATEGORY_LIST } from '../data/weapons';
import {
  getBrandSeoMetadata,
  getPhoneSeoMetadata,
  ParsedAppRoute,
  PRODUCTION_CANONICAL_HOME,
  PRODUCTION_CANONICAL_ORIGIN,
  syncDocumentCanonical,
} from '../utils/seo';
import { playCyberClick } from '../utils/sound';

export interface PhoneCatalogPagesProps {
  route: Extract<ParsedAppRoute, { type: 'phones_hub' | 'brand' | 'phone' }>;
  onNavigate: (path: string, hash?: string) => void;
  onSelectPhoneInGenerator: (phone: PhoneModel, game?: GameId) => void;
  initialBrandModels?: PhoneModel[];
  initialPhoneModel?: PhoneModel | null;
}

function computePhoneDefaultOutput(
  phone: PhoneModel,
  gameId: GameId = 'freefire_india',
  grip: GripStyle = '2finger',
  playstyle: Playstyle = 'onetap',
  weaponCategory: WeaponCategory = 'smg',
  explicitFps?: number
) {
  const capability = getDeviceFpsCapability(phone, gameId);
  const targetFps =
    explicitFps ??
    (capability.availableFps.includes(60)
      ? 60
      : capability.recommendedDefaultFps || 60);
  return phone.customSensitivityPreset
    ? calculatePresetVariation(gameId, phone, grip, playstyle, targetFps, weaponCategory, 0)
    : calculateSensitivity(gameId, phone, grip, playstyle, targetFps, 1.0, weaponCategory, 0);
}

function getVerifiedGyroLabel(phone: PhoneModel): string | null {
  if (phone.gyroscopeType === 'PHYSICAL_HARDWARE') return 'Physical Hardware Gyro';
  if (phone.gyroscopeType === 'VIRTUAL_SOFTWARE_ONLY') return 'Virtual / Software Gyro';
  if (phone.hasHardwareGyro === true) return 'Hardware Gyroscope';
  if (phone.hasHardwareGyro === false) return 'No Hardware Gyroscope';
  return null;
}

export const PhoneCatalogPages: React.FC<PhoneCatalogPagesProps> = ({
  route,
  onNavigate,
  onSelectPhoneInGenerator,
  initialBrandModels,
  initialPhoneModel,
}) => {
  const activeBrand = route.type === 'brand' || route.type === 'phone' ? route.brand : null;

  const [brandModels, setBrandModels] = useState<PhoneModel[]>(() => {
    if (initialBrandModels && initialBrandModels.length > 0) {
      return initialBrandModels;
    }
    if (activeBrand) {
      return getCachedBrandPhones(activeBrand, 'all') || [];
    }
    return [];
  });

  const [isLoadingBrand, setIsLoadingBrand] = useState<boolean>(() => {
    if (!activeBrand) return false;
    if (initialBrandModels && initialBrandModels.length > 0) return false;
    return !getCachedBrandPhones(activeBrand, 'all');
  });

  const [activeGameTab, setActiveGameTab] = useState<'freefire_india' | 'freefire_max'>('freefire_india');

  useEffect(() => {
    if (!activeBrand) {
      setBrandModels([]);
      setIsLoadingBrand(false);
      return;
    }

    if (initialBrandModels && initialBrandModels.length > 0) {
      setBrandModels(initialBrandModels);
      setIsLoadingBrand(false);
      return;
    }

    const cached = getCachedBrandPhones(activeBrand, 'all');
    if (cached && cached.length > 0) {
      setBrandModels(cached);
      setIsLoadingBrand(false);
      return;
    }

    let cancelled = false;
    setIsLoadingBrand(true);
    loadBrandPhones(activeBrand, 'all')
      .then((models) => {
        if (!cancelled) {
          setBrandModels(models);
          setIsLoadingBrand(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoadingBrand(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeBrand, initialBrandModels]);

  const matchedPhone = useMemo<PhoneModel | null>(() => {
    if (route.type !== 'phone') return null;
    if (initialPhoneModel) return initialPhoneModel;
    if (brandModels.length === 0) return null;

    if (route.topEntry) {
      const byTopId = brandModels.find((p) => p.id === route.topEntry!.id);
      if (byTopId) return byTopId;
    }

    const targetSlug = route.modelSlug;
    return (
      brandModels.find(
        (p) =>
          p.name
            .trim()
            .toLowerCase()
            .replace(/\+/g, '-plus-')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') === targetSlug
      ) || null
    );
  }, [route, brandModels, initialPhoneModel]);

  const brandStats = useMemo(() => {
    if (brandModels.length === 0) return null;
    const hzValues = brandModels.map((m) => m.refreshRate || 60);
    const dpiValues = brandModels.map((m) => m.recommendedDpi || 411);
    const ppiValues = brandModels.map((m) => m.nativePpi || m.recommendedDpi || 460);
    const gamingCount = brandModels.filter((m) => m.category === 'gaming').length;
    return {
      count: brandModels.length,
      minHz: Math.min(...hzValues),
      maxHz: Math.max(...hzValues),
      minDpi: Math.min(...dpiValues),
      maxDpi: Math.max(...dpiValues),
      minPpi: Math.min(...ppiValues),
      maxPpi: Math.max(...ppiValues),
      gamingCount,
    };
  }, [brandModels]);

  // Sync dynamic document metadata when chunk loads on client brand/phone routes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (route.type === 'brand' && brandStats) {
      const meta = getBrandSeoMetadata(route.brand, route.brandSlug, brandStats);
      syncDocumentCanonical(route.path, '', {
        title: meta.title,
        description: meta.description,
        breadcrumbs: [
          { name: 'Home', url: PRODUCTION_CANONICAL_HOME },
          { name: 'Phones', url: `${PRODUCTION_CANONICAL_ORIGIN}/phones` },
          { name: route.brand, url: meta.canonicalUrl },
        ],
      });
    } else if (route.type === 'phone' && matchedPhone) {
      const baseline = computePhoneDefaultOutput(matchedPhone, 'freefire_india', '2finger', 'onetap');
      const meta = getPhoneSeoMetadata(matchedPhone.name, matchedPhone.brand, route.path, {
        dpi: matchedPhone.recommendedDpi,
        ppi: matchedPhone.nativePpi ?? undefined,
        hz: matchedPhone.refreshRate ?? undefined,
        screenSize: matchedPhone.screenSize ?? undefined,
        fireBtn: baseline.fireButton.sizePercent,
      });
      syncDocumentCanonical(route.path, '', {
        title: meta.title,
        description: meta.description,
        breadcrumbs: route.isIndexablePhone
          ? [
              { name: 'Home', url: PRODUCTION_CANONICAL_HOME },
              { name: 'Phones', url: `${PRODUCTION_CANONICAL_ORIGIN}/phones` },
              { name: route.brand, url: `${PRODUCTION_CANONICAL_ORIGIN}${buildBrandPath(route.brand)}` },
              { name: matchedPhone.name, url: `${PRODUCTION_CANONICAL_ORIGIN}${route.path}` },
            ]
          : undefined,
      });
    }
  }, [route, brandStats, matchedPhone]);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
    hash?: string
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    playCyberClick('click');
    onNavigate(path, hash);
  };

  const renderHubPage = () => (
    <article className="space-y-8">
      <div className="border-b border-zinc-800/80 pb-6 space-y-4">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-mono-code text-zinc-400">
          <a href="/" onClick={(e) => handleLinkClick(e, '/')} className="hover:text-[#00FF66] transition-colors">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#00FF66]">Phone Brands Directory</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-[#00FF66]/50 text-xs font-mono-code text-zinc-200 hover:text-[#00FF66] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>Back to Sensitivity Generator</span>
          </a>
          <span className="text-[11px] font-mono-code px-2.5 py-1 rounded-md bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66]">
            26 Primary Brands • 1,089 Verified Profiles
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <h1 className="text-2xl sm:text-3xl font-black font-cyber text-white tracking-tight">
            FREE FIRE &amp; MAX PHONE SENSITIVITY DIRECTORY
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
            Browse hardware-calibrated 0–200 Free Fire, Free Fire MAX, and Free Fire India sensitivity settings, no-DPI or Android Smallest Width (DPI) baselines, 2/3/4-finger HUD layouts, weapon-class charts, and fire button profiles across all 26 smartphone brands. Built for global players in Brazil (<em>sensibilidade</em>), LATAM &amp; Spain (<em>sensibilidad sin DPI</em>), Indonesia (<em>sensitivitas FF</em>), India, USA, Philippines, and Europe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1" data-testid="hub-calibration-highlights">
          <div className="p-3.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
            <span className="text-[11px] font-cyber font-bold text-[#00FF66] block">
              NO-DPI, ANDROID DPI &amp; IOS RETINA PPI
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Every model supports stock no-DPI play or optional Android Smallest Width (DPI) tuning—while Apple iPhone profiles calibrate strictly around native iOS Retina PPI.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
            <span className="text-[11px] font-cyber font-bold text-[#00FF66] block">
              2/3/4-FINGER HUD &amp; FIRE BUTTON
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Compare 2-finger thumb and 3/4-finger claw HUD coordinates, joystick sizing, and lower-quadrant 40%–55% fire button sizing tuned per screen diagonal.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
            <span className="text-[11px] font-cyber font-bold text-[#00FF66] block">
              6-CLASS WEAPON SENSITIVITY MATRIX
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Inspect tailored drag speeds for SMG (MP40, UMP), Shotgun (M1887), AR (AK, SCAR), Sniper (AWM), Pistol (Desert Eagle), and Marksman rifles.
            </p>
          </div>
        </div>
      </div>

      {/* All 26 Brand Pages */}
      <section aria-labelledby="all-brands-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 id="all-brands-heading" className="text-lg sm:text-xl font-bold font-cyber text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#00FF66]" />
            <span>Browse All 26 Smartphone Brands</span>
          </h2>
          <span className="text-[11px] font-mono-code text-zinc-400">
            Select a brand to inspect every supported model &amp; DPI chart
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {BRAND_SLUG_ENTRIES.map((entry) => {
            const topCount = TOP_50_PHONE_ROUTES.filter((p) => p.brand === entry.brand).length;
            return (
              <a
                key={entry.slug}
                href={entry.path}
                onClick={(e) => handleLinkClick(e, entry.path)}
                className="group p-3.5 rounded-xl bg-black/60 border border-zinc-800 hover:border-[#00FF66]/60 hover:bg-[#07120c] transition-all flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-cyber font-bold text-sm text-white group-hover:text-[#00FF66] transition-colors">
                    {entry.brand}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#00FF66] shrink-0" />
                </div>
                <span className="text-[11px] font-mono-code text-zinc-400">
                  {topCount > 0 ? `${topCount} featured + full chart` : 'Full brand sensitivity chart'}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* Top 50 Popular Phone Pages */}
      <section aria-labelledby="top-50-heading" className="space-y-4 pt-2 border-t border-zinc-800/80">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 id="top-50-heading" className="text-lg sm:text-xl font-bold font-cyber text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#00FF66]" />
            <span>Top 50 Popular Free Fire Headshot Phones</span>
          </h2>
          <span className="text-[11px] font-mono-code text-zinc-400">
            Direct hardware-calibrated sensitivity, DPI &amp; fire button guides
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOP_50_PHONE_ROUTES.map((item) => (
            <a
              key={item.id}
              href={item.path}
              onClick={(e) => handleLinkClick(e, item.path)}
              className="group p-3.5 rounded-xl bg-black/50 border border-zinc-800 hover:border-[#00FF66]/60 transition-all flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#00FF66] block">
                  {item.brand}
                </span>
                <span className="font-semibold text-sm text-white group-hover:text-[#00FF66] transition-colors truncate block">
                  {item.name}
                </span>
              </div>
              <span className="text-[11px] font-mono-code text-zinc-400 group-hover:text-[#00FF66] shrink-0">
                View Specs →
              </span>
            </a>
          ))}
        </div>
      </section>
    </article>
  );

  const renderBrandPage = (brandRoute: Extract<ParsedAppRoute, { type: 'brand' }>) => {
    const isAppleBrand = brandRoute.brand.trim().toLowerCase() === 'apple';
    const popularModels = brandModels.filter((m) => findTopPhoneRouteById(m.id) !== null);
    const defaultBrandPhone = popularModels[0] || brandModels[0] || null;

    return (
      <article className="space-y-7">
        <div className="border-b border-zinc-800/80 pb-6 space-y-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-mono-code text-zinc-400">
            <a href="/" onClick={(e) => handleLinkClick(e, '/')} className="hover:text-[#00FF66] transition-colors">
              Home
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <a
              href={buildPhonesHubPath()}
              onClick={(e) => handleLinkClick(e, buildPhonesHubPath())}
              className="hover:text-[#00FF66] transition-colors"
            >
              Phones
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#00FF66]">{brandRoute.brand}</span>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-[#00FF66]/50 text-xs font-mono-code text-zinc-200 hover:text-[#00FF66] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Back to Sensitivity Generator</span>
            </a>

            {defaultBrandPhone && (
              <button
                type="button"
                onClick={() => {
                  playCyberClick('calibrate');
                  onSelectPhoneInGenerator(defaultBrandPhone, 'freefire_india');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-cyber font-bold text-xs shadow-[0_0_15px_rgba(0,255,102,0.35)] transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Customize {brandRoute.brand} Live</span>
              </button>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black font-cyber text-white tracking-tight">
              {isAppleBrand
                ? 'APPLE IPHONE FREE FIRE & MAX SENSITIVITY & IOS TOUCH'
                : `${brandRoute.brand.toUpperCase()} FREE FIRE & MAX SENSITIVITY & DPI`}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
              {isAppleBrand
                ? `Device-calibrated 0–200 headshot sensitivity settings for Free Fire, Free Fire MAX & Free Fire India, native iOS Retina PPI display scaling, and fire button HUD sizing across ${brandStats ? `${brandStats.count} verified Apple iPhone models` : 'Apple iPhone models'}.`
                : `Device-calibrated 0–200 headshot sensitivity settings (usable with stock no-DPI or Android Smallest Width DPI) for Free Fire, Free Fire MAX & Free Fire India, plus fire button HUD sizing across ${brandStats ? `${brandStats.count} verified ${brandRoute.brand} smartphones` : `${brandRoute.brand} smartphones`}.`}
            </p>
          </div>

          {brandStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">Verified Models</span>
                <span className="text-base sm:text-lg font-cyber font-bold text-[#00FF66]">{brandStats.count} Devices</span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">Refresh Rate Range</span>
                <span className="text-base sm:text-lg font-cyber font-bold text-white">
                  {brandStats.minHz === brandStats.maxHz ? `${brandStats.maxHz}Hz` : `${brandStats.minHz}Hz–${brandStats.maxHz}Hz`}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">
                  {isAppleBrand ? 'iOS Display Scaling' : 'Recommended DPI'}
                </span>
                <span className="text-base sm:text-lg font-cyber font-bold text-white">
                  {isAppleBrand
                    ? brandStats.minPpi === brandStats.maxPpi
                      ? `${brandStats.maxPpi} PPI`
                      : `${brandStats.minPpi}–${brandStats.maxPpi} PPI`
                    : brandStats.minDpi === brandStats.maxDpi
                      ? brandStats.maxDpi
                      : `${brandStats.minDpi}–${brandStats.maxDpi}`}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">Esports / Gaming Tier</span>
                <span className="text-base sm:text-lg font-cyber font-bold text-white">{brandStats.gamingCount} Models</span>
              </div>
            </div>
          )}

          {brandStats && (
            <div
              data-testid="brand-calibration-guide"
              className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs text-zinc-300 leading-relaxed"
            >
              <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800/90 space-y-1">
                <span className="text-[11px] font-cyber font-bold text-[#00FF66] block">
                  {isAppleBrand ? 'Native iOS Retina Touch Scaling' : `${brandRoute.brand} No-DPI vs DPI Tuning`}
                </span>
                <p className="text-zinc-300">
                  {isAppleBrand
                    ? `SensiVerse calibrates all ${brandStats.count} Apple iPhone profiles around ${brandStats.minPpi === brandStats.maxPpi ? `${brandStats.maxPpi} PPI` : `${brandStats.minPpi}–${brandStats.maxPpi} PPI`} native Retina touch response and ${brandStats.minHz}Hz–${brandStats.maxHz}Hz frame pacing—no unsafe system overrides required.`
                    : `All ${brandStats.count} ${brandRoute.brand} baselines work smoothly with stock no-DPI scaling (0–200 in-game sliders), or optional ${brandStats.minDpi === brandStats.maxDpi ? brandStats.maxDpi : `${brandStats.minDpi}–${brandStats.maxDpi}`} Developer Options width across ${brandStats.minHz === brandStats.maxHz ? `${brandStats.maxHz}Hz` : `${brandStats.minHz}Hz–${brandStats.maxHz}Hz`} displays.`}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800/90 space-y-1">
                <span className="text-[11px] font-cyber font-bold text-[#00FF66] block">
                  HUD Layout &amp; Fire Button Range
                </span>
                <p className="text-zinc-300">
                  Pair 2-finger thumb or 3/4-finger claw HUD layouts with a 40%–55% lower-quadrant Fire Button to preserve upward drag runway during close-range duels.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800/90 space-y-1">
                <span className="text-[11px] font-cyber font-bold text-[#00FF66] block">
                  Weapons &amp; Live Customization
                </span>
                <p className="text-zinc-300">
                  Compare Free Fire India and Free Fire MAX values below or{' '}
                  <a
                    href="/?game=freefire_max"
                    onClick={(e) => handleLinkClick(e, '/', '#step-6-results')}
                    className="text-[#00FF66] hover:underline font-semibold"
                  >
                    tune SMG (MP40), Shotgun (M1887), AR &amp; AWM scopes live
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </div>

        {popularModels.length > 0 && (
          <section aria-labelledby="brand-popular-heading" className="space-y-3">
            <h2 id="brand-popular-heading" className="text-base sm:text-lg font-bold font-cyber text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#00FF66]" />
              <span>Dedicated {brandRoute.brand} Headshot Sensitivity Guides</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {popularModels.map((phone) => {
                const topRoute = findTopPhoneRouteById(phone.id)!;
                const baseline = computePhoneDefaultOutput(phone, 'freefire_india', '2finger', 'onetap');
                const maxBaseline = computePhoneDefaultOutput(phone, 'freefire_max', '2finger', 'onetap');
                const ffData = baseline.sensitivity.data as FreeFireSensi;
                const ffMaxData = maxBaseline.sensitivity.data as FreeFireSensi;
                return (
                  <a
                    key={phone.id}
                    href={topRoute.path}
                    onClick={(e) => handleLinkClick(e, topRoute.path)}
                    className="group p-4 rounded-xl bg-[#07110b] border border-[#00FF66]/30 hover:border-[#00FF66] transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-cyber font-bold text-sm text-white group-hover:text-[#00FF66]">
                        {phone.name}
                      </span>
                      <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66]">
                        {phone.refreshRate}Hz
                      </span>
                    </div>
                    <div className="text-[11px] font-mono-code text-zinc-400 flex flex-wrap gap-x-3 gap-y-1">
                      <span>FF India: <strong className="text-zinc-200">{ffData.general}/{ffData.redDot}</strong></span>
                      <span>FF MAX: <strong className="text-zinc-200">{ffMaxData.general}/{ffMaxData.redDot}</strong></span>
                      <span>
                        {isAppleBrand ? 'Retina:' : 'DPI:'}{' '}
                        <strong className="text-zinc-200">
                          {isAppleBrand ? `${phone.nativePpi || phone.recommendedDpi} PPI` : phone.recommendedDpi}
                        </strong>
                      </span>
                      <span>Fire: <strong className="text-[#00FF66]">{baseline.fireButton.sizePercent}%</strong></span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <section aria-labelledby="brand-models-table-heading" className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 id="brand-models-table-heading" className="text-base sm:text-lg font-bold font-cyber text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00FF66]" />
              <span>All {brandRoute.brand} Models — Free Fire, MAX &amp; India Baseline Chart</span>
            </h2>
            <span className="text-[11px] font-mono-code text-zinc-400">
              2-Finger Thumb • One-Tap Headshot • 0–200 Scale
            </span>
          </div>

          {isLoadingBrand ? (
            <div className="p-8 rounded-xl bg-black/50 border border-zinc-800 text-center text-xs font-mono-code text-zinc-400">
              Loading {brandRoute.brand} device profiles...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-black/50">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/90 text-[10px] font-mono-code uppercase text-zinc-400">
                    <th className="py-3 px-3.5">Phone Model</th>
                    <th className="py-3 px-2.5">Display</th>
                    <th className="py-3 px-2.5">FF India (Gen/RD)</th>
                    <th className="py-3 px-2.5">FF MAX (Gen/RD)</th>
                    <th className="py-3 px-2.5">2x / 4x</th>
                    <th className="py-3 px-2.5">{isAppleBrand ? 'iOS PPI' : 'DPI'}</th>
                    <th className="py-3 px-2.5">Fire Btn</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {brandModels.map((phone) => {
                    const out = computePhoneDefaultOutput(phone, 'freefire_india', '2finger', 'onetap');
                    const maxOut = computePhoneDefaultOutput(phone, 'freefire_max', '2finger', 'onetap');
                    const data = out.sensitivity.data as FreeFireSensi;
                    const maxData = maxOut.sensitivity.data as FreeFireSensi;
                    const topRoute = findTopPhoneRouteById(phone.id);
                    return (
                      <tr key={phone.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-2.5 px-3.5 font-medium text-white">
                          {topRoute ? (
                            <a
                              href={topRoute.path}
                              onClick={(e) => handleLinkClick(e, topRoute.path)}
                              className="text-[#00FF66] hover:underline font-semibold"
                            >
                              {phone.name}
                            </a>
                          ) : (
                            <span>{phone.name}</span>
                          )}
                          {phone.chipset && (
                            <span className="block text-[10px] text-zinc-500 font-mono-code">
                              {phone.chipset}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 font-mono-code text-zinc-300 whitespace-nowrap">
                          {phone.screenSize}&quot; • {phone.refreshRate}Hz
                        </td>
                        <td className="py-2.5 px-2.5 font-mono-code font-bold text-[#00FF66] whitespace-nowrap">
                          {data.general} / {data.redDot}
                        </td>
                        <td className="py-2.5 px-2.5 font-mono-code text-zinc-200 whitespace-nowrap">
                          {maxData.general} / {maxData.redDot}
                        </td>
                        <td className="py-2.5 px-2.5 font-mono-code text-zinc-300 whitespace-nowrap">
                          {data.scope2x} / {data.scope4x}
                        </td>
                        <td className="py-2.5 px-2.5 font-mono-code text-zinc-300">
                          {isAppleBrand ? `${phone.nativePpi || phone.recommendedDpi} PPI` : phone.recommendedDpi}
                        </td>
                        <td className="py-2.5 px-2.5 font-mono-code text-zinc-200">
                          {out.fireButton.sizePercent}%
                        </td>
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <a
                            href={`/?game=freefire_india&phone=${encodeURIComponent(phone.id)}`}
                            onClick={(e) => {
                              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                                return;
                              }
                              e.preventDefault();
                              playCyberClick('calibrate');
                              onSelectPhoneInGenerator(phone, 'freefire_india');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-[#00FF66] text-zinc-200 hover:text-black border border-zinc-700 hover:border-[#00FF66] text-[11px] font-mono-code transition-colors"
                          >
                            Calibrate
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Cross-Brand Crawl Links */}
        <section aria-label="Other Smartphone Brands" className="pt-4 border-t border-zinc-800/80 space-y-2.5">
          <h2 className="text-xs font-mono-code uppercase tracking-wider text-zinc-400">
            Browse Other Brands
          </h2>
          <div className="flex flex-wrap gap-2">
            {BRAND_SLUG_ENTRIES.map((entry) => (
              <a
                key={entry.slug}
                href={entry.path}
                onClick={(e) => handleLinkClick(e, entry.path)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono-code border transition-colors ${
                  entry.brand === brandRoute.brand
                    ? 'bg-[#00FF66] text-black border-[#00FF66] font-bold'
                    : 'bg-black/50 text-zinc-300 border-zinc-800 hover:border-[#00FF66]/40 hover:text-[#00FF66]'
                }`}
              >
                {entry.brand}
              </a>
            ))}
          </div>
        </section>
      </article>
    );
  };

  const renderPhonePage = (phoneRoute: Extract<ParsedAppRoute, { type: 'phone' }>) => {
    if (isLoadingBrand && !matchedPhone) {
      return (
        <div className="p-8 rounded-xl bg-black/50 border border-zinc-800 text-center text-xs font-mono-code text-zinc-400">
          Loading {phoneRoute.brand} hardware profile...
        </div>
      );
    }

    if (!matchedPhone) {
      return (
        <div className="space-y-4 p-6 rounded-xl bg-black/60 border border-zinc-800">
          <h1 className="text-xl sm:text-2xl font-cyber font-bold text-white">
            Phone Model Not Found
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            The requested model path could not be matched to a catalog record under {phoneRoute.brand}. Browse all verified {phoneRoute.brand} devices or launch the custom spec generator.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={buildBrandPath(phoneRoute.brand)}
              onClick={(e) => handleLinkClick(e, buildBrandPath(phoneRoute.brand))}
              className="px-4 py-2 rounded-lg bg-[#00FF66] text-black font-cyber font-bold text-xs"
            >
              View All {phoneRoute.brand} Phones
            </a>
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono-code text-xs"
            >
              Open Sensitivity Generator
            </a>
          </div>
        </div>
      );
    }

    const phone = matchedPhone;
    const isIosDevice = (phone.brand || '').trim().toLowerCase() === 'apple';
    const validFps = getDeviceFpsCapability(phone, activeGameTab).availableFps;
    const hz = phone.refreshRate ?? 60;
    const screenSize = phone.screenSize ?? 6.67;
    const iosPpi = phone.nativePpi || phone.recommendedDpi;
    const activePlaystyles: Array<{ id: Playstyle; label: string }> = [
      { id: 'onetap', label: 'One-Tap Headshot' },
      { id: 'drag', label: 'Drag Headshot' },
      { id: 'recoil', label: 'Recoil Control' },
    ];
    const activeGrips: Array<{ id: GripStyle; label: string }> = [
      { id: '2finger', label: '2-Finger Thumb' },
      { id: '3finger', label: '3-Finger Claw' },
      { id: '4finger', label: '4-Finger Claw' },
    ];

    const primaryOutput = computePhoneDefaultOutput(phone, activeGameTab, '2finger', 'onetap');
    const verifiedGyroLabel = getVerifiedGyroLabel(phone);
    const siblingPopular = brandModels
      .filter((m) => m.id !== phone.id && findTopPhoneRouteById(m.id) !== null)
      .slice(0, 6);
    const comparablePhones =
      siblingPopular.length < 4
        ? getComparableTopPhoneRoutes(
            phone.id,
            phone.brand,
            hz,
            phone.category,
            Math.max(0, 6 - siblingPopular.length)
          )
        : [];

    const refreshAdvice =
      hz >= 144
        ? `At ${hz}Hz, frames update every ${(1000 / hz).toFixed(1)}ms, making upward drag input register very quickly. Keep General balanced to avoid skyward over-drag.`
        : hz >= 120
          ? `Its ${hz}Hz display keeps vertical drag smooth and responsive. Starting near the calibrated General value prevents crosshair overshoot on close-range SMGs.`
          : isIosDevice
            ? `At ${hz}Hz, slightly firmer upward drag velocity works best for one-tap headshots using native iOS touch response (${iosPpi} PPI)—no external touch scaling overrides needed.`
            : `At ${hz}Hz, slightly firmer upward drag velocity works best for one-tap headshots without relying on unsafe DPI jumps.`;

    const runwayAdvice =
      screenSize >= 6.7
        ? `With a large ${screenSize}" display, your thumb has generous vertical swipe runway—${primaryOutput.fireButton.sizePercent}% fire button placement in the lower 18% prevents bezel clipping.`
        : `With a compact ${screenSize}" panel, placing the fire button at ${primaryOutput.fireButton.sizePercent}% preserves crisp vertical travel from chest to head level.`;

    return (
      <article className="space-y-7">
        <div className="border-b border-zinc-800/80 pb-6 space-y-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs font-mono-code text-zinc-400">
            <a href="/" onClick={(e) => handleLinkClick(e, '/')} className="hover:text-[#00FF66] transition-colors">
              Home
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <a
              href={buildPhonesHubPath()}
              onClick={(e) => handleLinkClick(e, buildPhonesHubPath())}
              className="hover:text-[#00FF66] transition-colors"
            >
              Phones
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <a
              href={buildBrandPath(phone.brand)}
              onClick={(e) => handleLinkClick(e, buildBrandPath(phone.brand))}
              className="hover:text-[#00FF66] transition-colors"
            >
              {phone.brand}
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#00FF66]">{phone.name}</span>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <a
              href={buildBrandPath(phone.brand)}
              onClick={(e) => handleLinkClick(e, buildBrandPath(phone.brand))}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-[#00FF66]/50 text-xs font-mono-code text-zinc-200 hover:text-[#00FF66] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>All {phone.brand} Sensitivity Profiles</span>
            </a>

            <button
              type="button"
              onClick={() => {
                playCyberClick('calibrate');
                onSelectPhoneInGenerator(phone, activeGameTab);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-cyber font-bold text-xs shadow-[0_0_16px_rgba(0,255,102,0.4)] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customize {phone.name} in Live Generator</span>
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] uppercase">
                {phone.brand} • {phone.releaseYear || 2024}
              </span>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#00FF66]" />
                {phone.verificationStatus === 'verified' ? 'Verified Hardware Specs' : 'Calibrated Spec Profile'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-cyber text-white tracking-tight">
              {isIosDevice
                ? `${phone.name} FREE FIRE & MAX SENSITIVITY, IOS TOUCH & FIRE BUTTON`
                : `${phone.name} FREE FIRE & MAX SENSITIVITY, DPI & FIRE BUTTON`}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
              {isIosDevice ? (
                <>
                  Engine-calibrated 0–200 headshot sensitivity settings for <strong className="text-white">{phone.name}</strong> ({screenSize}&quot; {hz}Hz{phone.chipset ? `, ${phone.chipset}` : ''}) across Free Fire, Free Fire MAX &amp; Free Fire India, tuned for native iOS Retina display scaling ({iosPpi} PPI) and {primaryOutput.fireButton.sizePercent}% fire button sizing.
                </>
              ) : (
                <>
                  Engine-calibrated 0–200 headshot sensitivity settings for <strong className="text-white">{phone.name}</strong> ({screenSize}&quot; {hz}Hz{phone.chipset ? `, ${phone.chipset}` : ''}) across Free Fire, Free Fire MAX &amp; Free Fire India, supporting stock no-DPI settings or {phone.recommendedDpi} Android Smallest Width (DPI) and {primaryOutput.fireButton.sizePercent}% fire button sizing.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Hardware Telemetry Cards */}
        <section aria-labelledby="hardware-specs-heading" className="space-y-3">
          <h2 id="hardware-specs-heading" className="text-base sm:text-lg font-bold font-cyber text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#00FF66]" />
            <span>{phone.name} Hardware Calibration Specs</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
              <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">Display Size</span>
              <span className="text-sm font-cyber font-bold text-white">{phone.screenSize}&quot;</span>
              {phone.resolution && <span className="text-[10px] font-mono-code text-zinc-500 block">{phone.resolution}</span>}
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
              <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">Refresh Rate</span>
              <span className="text-sm font-cyber font-bold text-[#00FF66]">{phone.refreshRate}Hz</span>
              <span className="text-[10px] font-mono-code text-zinc-500 block">
                Touch: {phone.touchSamplingRate ? `${phone.touchSamplingRate}Hz` : 'Standard Polling'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
              <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">
                {isIosDevice ? 'iOS Display Scaling' : 'Recommended DPI'}
              </span>
              <span className="text-sm font-cyber font-bold text-[#00FF66]">
                {isIosDevice ? `${iosPpi} PPI` : phone.recommendedDpi}
              </span>
              <span className="text-[10px] font-mono-code text-zinc-500 block">
                {isIosDevice ? 'Native iOS Retina Display' : 'Android Smallest Width'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
              <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">Fire Button</span>
              <span className="text-sm font-cyber font-bold text-white">{primaryOutput.fireButton.sizePercent}%</span>
              <span className="text-[10px] font-mono-code text-zinc-500 block">Safe 40%–55% Zone</span>
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
              <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">Target FPS &amp; Sensors</span>
              <span className="text-sm font-cyber font-bold text-white">{validFps.join(' / ')} FPS</span>
              <span className="text-[10px] font-mono-code text-zinc-500 block">
                {phone.aspectRatio || '20:9'} Ratio
                {verifiedGyroLabel ? ` • ${verifiedGyroLabel}` : ''}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
              <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">
                Processor{phone.gpu ? ' & GPU' : ''}
              </span>
              <span className="text-xs font-semibold text-white block truncate" title={phone.chipset || 'Mobile SoC'}>
                {phone.chipset || 'Verified Mobile SoC'}
              </span>
              {phone.gpu && (
                <span className="text-[10px] font-mono-code text-[#00FF66]/90 block truncate" title={phone.gpu}>
                  GPU: {phone.gpu}
                </span>
              )}
              <span className="text-[10px] font-mono-code text-zinc-500 block">
                {phone.nativePpi ? `${phone.nativePpi} PPI` : `${phone.category} tier`}
              </span>
            </div>
          </div>
        </section>

        {/* Sensitivity Matrix by Game & Playstyle */}
        <section aria-labelledby="phone-sensi-matrix-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="phone-sensi-matrix-heading" className="text-base sm:text-lg font-bold font-cyber text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-[#00FF66]" />
              <span>0–200 Calibrated Sensitivity Settings ({phone.name})</span>
            </h2>

            <div className="inline-flex p-1 rounded-lg bg-black border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  playCyberClick('click');
                  setActiveGameTab('freefire_india');
                }}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  activeGameTab === 'freefire_india'
                    ? 'bg-[#00FF66] text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Free Fire India 🇮🇳
              </button>
              <button
                type="button"
                onClick={() => {
                  playCyberClick('click');
                  setActiveGameTab('freefire_max');
                }}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  activeGameTab === 'freefire_max'
                    ? 'bg-[#00FF66] text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Free Fire MAX 🔥
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activePlaystyles.map((style) => {
              const res = computePhoneDefaultOutput(phone, activeGameTab, '2finger', style.id);
              const d = res.sensitivity.data as FreeFireSensi;
              const rows: Array<[string, number]> = [
                ['General', d.general],
                ['Red Dot', d.redDot],
                ['2x Scope', d.scope2x],
                ['4x Scope', d.scope4x],
                ['Sniper Scope', d.sniperScope],
                ['Free Look', d.freeLook],
              ];
              return (
                <div key={style.id} className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h3 className="font-cyber font-bold text-sm text-[#00FF66]">{style.label}</h3>
                    <span className="text-[10px] font-mono-code text-zinc-400">
                      Fire: {res.fireButton.sizePercent}%
                    </span>
                  </div>
                  <dl className="space-y-1.5 text-xs font-mono-code">
                    {rows.map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between">
                        <dt className="text-zinc-400">{label}</dt>
                        <dd className="text-white font-bold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>

          {/* Static Dual-Engine Matrix: Both Free Fire India & Free Fire MAX rendered in initial HTML */}
          <div className="pt-2 space-y-3" data-testid="dual-game-sensitivity-matrix">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-cyber font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#00FF66]" />
                <span>Free Fire India &amp; Free Fire MAX Complete 0–200 Matrix ({phone.name})</span>
              </h3>
              <span className="text-[11px] font-mono-code text-zinc-400">
                2-Finger Thumb • Global Free Fire, MAX &amp; India Comparison
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-black/50">
              <table className="w-full text-left border-collapse text-xs font-mono-code">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/90 text-[10px] uppercase text-zinc-400">
                    <th className="py-2.5 px-3">Game Engine</th>
                    <th className="py-2.5 px-2.5">Playstyle</th>
                    <th className="py-2.5 px-2">General</th>
                    <th className="py-2.5 px-2">Red Dot</th>
                    <th className="py-2.5 px-2">2x</th>
                    <th className="py-2.5 px-2">4x</th>
                    <th className="py-2.5 px-2">Sniper</th>
                    <th className="py-2.5 px-2">Free Look</th>
                    <th className="py-2.5 px-3 text-right">Fire Btn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {(['freefire_india', 'freefire_max'] as const).map((gId) =>
                    activePlaystyles.map((style) => {
                      const out = computePhoneDefaultOutput(phone, gId, '2finger', style.id);
                      const d = out.sensitivity.data as FreeFireSensi;
                      const gameLabel = gId === 'freefire_india' ? 'Free Fire India' : 'Free Fire MAX';
                      return (
                        <tr
                          key={`${gId}-${style.id}`}
                          data-game-engine={gId}
                          data-playstyle={style.id}
                          className="hover:bg-zinc-900/40 transition-colors"
                        >
                          <td className="py-2 px-3 font-semibold text-white whitespace-nowrap">{gameLabel}</td>
                          <td className="py-2 px-2.5 text-zinc-300 whitespace-nowrap">{style.label}</td>
                          <td className="py-2 px-2 font-bold text-[#00FF66]">{d.general}</td>
                          <td className="py-2 px-2 text-white">{d.redDot}</td>
                          <td className="py-2 px-2 text-zinc-200">{d.scope2x}</td>
                          <td className="py-2 px-2 text-zinc-200">{d.scope4x}</td>
                          <td className="py-2 px-2 text-zinc-300">{d.sniperScope}</td>
                          <td className="py-2 px-2 text-zinc-300">{d.freeLook}</td>
                          <td className="py-2 px-3 text-right text-[#00FF66] font-bold">{out.fireButton.sizePercent}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Grip Style, HUD Positioning & Aim Telemetry */}
        <section aria-labelledby="grip-comparison-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800 space-y-3" data-testid="hud-positioning-panel">
            <h2 id="grip-comparison-heading" className="text-sm sm:text-base font-cyber font-bold text-white flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-[#00FF66]" />
              <span>2/3/4-Finger HUD Layout, Grip &amp; Fire Button Positioning</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-code border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] uppercase text-zinc-400">
                    <th className="py-2 pr-2">Grip Style</th>
                    <th className="py-2 px-2">Gen / RD</th>
                    <th className="py-2 px-2">Fire Btn</th>
                    <th className="py-2 px-2">HUD Placement</th>
                    <th className="py-2 pl-2">Joystick</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {activeGrips.map((grip) => {
                    const out = computePhoneDefaultOutput(phone, activeGameTab, grip.id, 'onetap');
                    const d = out.sensitivity.data as FreeFireSensi;
                    return (
                      <tr key={grip.id}>
                        <td className="py-2 pr-2 text-zinc-200 whitespace-nowrap">{grip.label}</td>
                        <td className="py-2 px-2 text-[#00FF66] font-bold whitespace-nowrap">
                          {d.general} / <span className="text-white">{d.redDot}</span>
                        </td>
                        <td className="py-2 px-2 text-zinc-200 whitespace-nowrap">{out.fireButton.sizePercent}%</td>
                        <td className="py-2 px-2 text-zinc-300 whitespace-nowrap">
                          {out.fireButton.positionX}% R / {out.fireButton.positionY}% B
                        </td>
                        <td className="py-2 pl-2 text-zinc-300 whitespace-nowrap">{out.fireButton.joystickSize}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono-code text-[11px]">
                <span>
                  Recommended HUD:{' '}
                  <strong className="text-[#00FF66]">
                    {primaryOutput.fireButton.positionX}% from right, {primaryOutput.fireButton.positionY}% from bottom
                  </strong>
                </span>
                <span className="text-zinc-400">
                  Safe Zone: {primaryOutput.fireButton.recommendedRange.min}%–{primaryOutput.fireButton.recommendedRange.max}%
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                <strong className="text-white">{primaryOutput.fireButton.dragTechniqueName}:</strong>{' '}
                {primaryOutput.fireButton.dragTip}
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800 space-y-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed" data-testid="device-latency-telemetry">
            <h2 className="text-sm sm:text-base font-cyber font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#00FF66]" />
              <span>Device Touch, Latency &amp; Drag Telemetry</span>
            </h2>
            <p>{refreshAdvice}</p>
            <p>{runwayAdvice}</p>
            <p className="text-xs font-mono-code text-zinc-200 bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-2.5">
              {primaryOutput.telemetry.latencyEstimationExplanation}
            </p>
            {primaryOutput.telemetry.reasons.length > 0 && (
              <ul className="space-y-1 text-xs text-zinc-300 pl-1">
                {primaryOutput.telemetry.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] mt-1.5 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="text-xs font-mono-code text-zinc-400 flex flex-wrap gap-x-3 gap-y-1 pt-1">
              <span>Drag Runway: <strong className="text-white">{primaryOutput.telemetry.screenDragRunwayMm}mm</strong></span>
              <span>Aim Speed: <strong className="text-white uppercase">{primaryOutput.telemetry.aimSpeed}</strong></span>
              <span>Drag Control: <strong className="text-white uppercase">{primaryOutput.telemetry.dragControl}</strong></span>
              <span>Overshoot Risk: <strong className="text-[#00FF66] uppercase">{primaryOutput.telemetry.overshootRisk}</strong></span>
              <span>Confidence: <strong className="text-white">{primaryOutput.telemetry.confidenceScore}%</strong></span>
              {phone.gpu && <span>GPU: <strong className="text-white">{phone.gpu}</strong></span>}
              {verifiedGyroLabel && <span>Gyro: <strong className="text-white">{verifiedGyroLabel}</strong></span>}
            </div>
            {validFps.length > 1 && (
              <div className="pt-1 text-[11px] font-mono-code text-zinc-300 border-t border-zinc-800/80 flex flex-wrap gap-x-3 gap-y-1">
                <span className="text-zinc-400">Multi-FPS Scaling:</span>
                {validFps.map((fpsVal) => {
                  const fOut = computePhoneDefaultOutput(phone, activeGameTab, '2finger', 'onetap', 'smg', fpsVal);
                  const fd = fOut.sensitivity.data as FreeFireSensi;
                  return (
                    <span key={fpsVal}>
                      <strong className="text-[#00FF66]">{fpsVal} FPS</strong> ({fd.general}/{fd.redDot}, Fire {fOut.fireButton.sizePercent}%)
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Weapon-Class Calibration Guidance */}
        <section aria-labelledby="weapon-class-guidance-heading" className="space-y-3" data-testid="weapon-class-guidance">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="weapon-class-guidance-heading" className="text-base sm:text-lg font-bold font-cyber text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00FF66]" />
              <span>Weapon-Class Sensitivity Comparison ({phone.name})</span>
            </h2>
            <span className="text-[11px] font-mono-code text-zinc-400">
              {activeGameTab === 'freefire_india' ? 'Free Fire India' : 'Free Fire MAX'} • SMG vs Shotgun vs AR vs Sniper (0–200)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {WEAPON_CATEGORY_LIST.map((weaponId) => {
              const info = WEAPON_CATEGORIES[weaponId];
              const wOut = computePhoneDefaultOutput(phone, activeGameTab, '2finger', 'onetap', weaponId);
              const wd = wOut.sensitivity.data as FreeFireSensi;
              return (
                <div
                  key={weaponId}
                  data-weapon-category={weaponId}
                  className="p-4 rounded-xl bg-black/50 border border-zinc-800 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-cyber font-bold text-sm text-[#00FF66]">{info.name}</h3>
                      <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {info.optimalDistance}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono-code text-zinc-400">
                      Weapons: <span className="text-zinc-200">{info.representativeGuns.slice(0, 4).join(', ')}</span>
                    </p>
                    <div className="grid grid-cols-5 gap-1 pt-1 text-center font-mono-code text-[11px]">
                      <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800/80">
                        <span className="block text-[9px] text-zinc-500 uppercase">Gen</span>
                        <strong className="text-[#00FF66]">{wd.general}</strong>
                      </div>
                      <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800/80">
                        <span className="block text-[9px] text-zinc-500 uppercase">RD</span>
                        <strong className="text-white">{wd.redDot}</strong>
                      </div>
                      <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800/80">
                        <span className="block text-[9px] text-zinc-500 uppercase">2x</span>
                        <strong className="text-zinc-200">{wd.scope2x}</strong>
                      </div>
                      <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800/80">
                        <span className="block text-[9px] text-zinc-500 uppercase">4x</span>
                        <strong className="text-zinc-200">{wd.scope4x}</strong>
                      </div>
                      <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800/80">
                        <span className="block text-[9px] text-zinc-500 uppercase">Awp</span>
                        <strong className="text-zinc-300">{wd.sniperScope}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/70 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-mono-code text-zinc-400">
                      <span>Fire: <strong className="text-white">{wOut.fireButton.sizePercent}%</strong></span>
                      <span>{wOut.fireButton.dragTechniqueName}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">{wOut.fireButton.dragTip}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Related Models (Same Brand + Comparable Cross-Brand Fallback) */}
        {(siblingPopular.length > 0 || comparablePhones.length > 0) && (
          <section aria-labelledby="sibling-models-heading" className="pt-4 border-t border-zinc-800/80 space-y-4">
            {siblingPopular.length > 0 && (
              <div className="space-y-2.5">
                <h2 id="sibling-models-heading" className="text-sm font-cyber font-bold text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#00FF66]" />
                  <span>More Popular {phone.brand} Sensitivity Profiles</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {siblingPopular.map((sib) => {
                    const topRoute = findTopPhoneRouteById(sib.id)!;
                    return (
                      <a
                        key={sib.id}
                        href={topRoute.path}
                        onClick={(e) => handleLinkClick(e, topRoute.path)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-[#00FF66]/50 text-xs font-mono-code text-zinc-300 hover:text-[#00FF66] transition-colors"
                      >
                        {sib.name}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {comparablePhones.length > 0 && (
              <div className="space-y-2.5" data-testid="comparable-phone-links">
                <h2
                  id={siblingPopular.length === 0 ? 'sibling-models-heading' : undefined}
                  className="text-sm font-cyber font-bold text-white flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-[#00FF66]" />
                  <span>Comparable Cross-Brand Sensitivity Profiles ({hz}Hz / {phone.category} tier)</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {comparablePhones.map((comp) => (
                    <a
                      key={comp.id}
                      href={comp.path}
                      onClick={(e) => handleLinkClick(e, comp.path)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-[#00FF66]/50 text-xs font-mono-code text-zinc-300 hover:text-[#00FF66] transition-colors"
                    >
                      {comp.name}{' '}
                      <span className="text-zinc-500">({comp.brand} • {comp.refreshRate}Hz)</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </article>
    );
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="bg-[#08100b]/95 border border-zinc-800 rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00FF66]/40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#00FF66]/40 pointer-events-none" />

        {route.type === 'phones_hub' && renderHubPage()}
        {route.type === 'brand' && renderBrandPage(route)}
        {route.type === 'phone' && renderPhonePage(route)}
      </div>
    </section>
  );
};
