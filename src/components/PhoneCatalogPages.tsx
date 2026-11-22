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
} from '../types';
import {
  BRAND_SLUG_ENTRIES,
  TOP_50_PHONE_ROUTES,
  buildBrandPath,
  buildPhonesHubPath,
  findTopPhoneRouteById,
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
  playstyle: Playstyle = 'onetap'
) {
  const capability = getDeviceFpsCapability(phone, gameId);
  const targetFps = capability.availableFps.includes(60)
    ? 60
    : capability.recommendedDefaultFps || 60;
  return phone.customSensitivityPreset
    ? calculatePresetVariation(gameId, phone, grip, playstyle, targetFps, 'smg', 0)
    : calculateSensitivity(gameId, phone, grip, playstyle, targetFps, 1.0, 'smg', 0);
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
            FREE FIRE INDIA &amp; MAX PHONE SENSITIVITY DIRECTORY
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
            Browse hardware-calibrated 0–200 Free Fire India and Free Fire MAX sensitivity profiles, recommended Android Smallest Width (DPI), and fire button HUD settings organized across all 26 supported smartphone brands and top flagship gaming models.
          </p>
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
                ? 'APPLE IPHONE FREE FIRE INDIA & MAX SENSITIVITY & IOS TOUCH'
                : `${brandRoute.brand.toUpperCase()} FREE FIRE INDIA & MAX SENSITIVITY & DPI`}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
              {isAppleBrand
                ? `Device-calibrated 0–200 sensitivity baselines, native iOS Retina PPI display scaling, and fire button HUD sizing across ${brandStats ? `${brandStats.count} verified Apple iPhone models` : 'Apple iPhone models'}.`
                : `Device-calibrated 0–200 sensitivity baselines, Android Smallest Width (DPI) recommendations, and fire button HUD sizing across ${brandStats ? `${brandStats.count} verified ${brandRoute.brand} smartphones` : `${brandRoute.brand} smartphones`}.`}
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
                  {isAppleBrand ? 'iOS Retina PPI' : 'Recommended DPI'}
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
                const ffData = baseline.sensitivity.data as FreeFireSensi;
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
                      <span>General: <strong className="text-zinc-200">{ffData.general}</strong></span>
                      <span>Red Dot: <strong className="text-zinc-200">{ffData.redDot}</strong></span>
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
              <span>All {brandRoute.brand} Models — Free Fire India Baseline Chart</span>
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
                    <th className="py-3 px-2.5">General</th>
                    <th className="py-3 px-2.5">Red Dot</th>
                    <th className="py-3 px-2.5">2x / 4x</th>
                    <th className="py-3 px-2.5">{isAppleBrand ? 'iOS PPI' : 'DPI'}</th>
                    <th className="py-3 px-2.5">Fire Btn</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {brandModels.map((phone) => {
                    const out = computePhoneDefaultOutput(phone, 'freefire_india', '2finger', 'onetap');
                    const data = out.sensitivity.data as FreeFireSensi;
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
                        <td className="py-2.5 px-2.5 font-mono-code font-bold text-[#00FF66]">
                          {data.general}
                        </td>
                        <td className="py-2.5 px-2.5 font-mono-code text-zinc-200">{data.redDot}</td>
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
    const siblingPopular = brandModels
      .filter((m) => m.id !== phone.id && findTopPhoneRouteById(m.id) !== null)
      .slice(0, 6);

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
                ? `${phone.name} FREE FIRE INDIA & MAX SENSITIVITY, IOS TOUCH & FIRE BUTTON`
                : `${phone.name} FREE FIRE INDIA & MAX SENSITIVITY, DPI & FIRE BUTTON`}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
              {isIosDevice ? (
                <>
                  Engine-calibrated 0–200 headshot sensitivity settings for <strong className="text-white">{phone.name}</strong> ({screenSize}&quot; {hz}Hz{phone.chipset ? `, ${phone.chipset}` : ''}), tuned for native iOS Retina display scaling ({iosPpi} PPI) and {primaryOutput.fireButton.sizePercent}% fire button sizing.
                </>
              ) : (
                <>
                  Engine-calibrated 0–200 headshot sensitivity settings for <strong className="text-white">{phone.name}</strong> ({screenSize}&quot; {hz}Hz{phone.chipset ? `, ${phone.chipset}` : ''}), with {phone.recommendedDpi} Android Smallest Width (DPI) and {primaryOutput.fireButton.sizePercent}% fire button sizing.
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
              <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">Target FPS</span>
              <span className="text-sm font-cyber font-bold text-white">{validFps.join(' / ')} FPS</span>
              <span className="text-[10px] font-mono-code text-zinc-500 block">{phone.aspectRatio || '20:9'} Ratio</span>
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
              <span className="text-[10px] font-mono-code text-zinc-400 uppercase block">Processor</span>
              <span className="text-xs font-semibold text-white block truncate" title={phone.chipset || 'Mobile SoC'}>
                {phone.chipset || 'Verified Mobile SoC'}
              </span>
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
        </section>

        {/* Grip Style & Aim Telemetry Comparison */}
        <section aria-labelledby="grip-comparison-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800 space-y-3">
            <h2 id="grip-comparison-heading" className="text-sm sm:text-base font-cyber font-bold text-white flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-[#00FF66]" />
              <span>Thumb vs Claw Grip Profiles</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-code border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] uppercase text-zinc-400">
                    <th className="py-2 pr-2">Grip Style</th>
                    <th className="py-2 px-2">General</th>
                    <th className="py-2 px-2">Red Dot</th>
                    <th className="py-2 pl-2">Fire Btn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {activeGrips.map((grip) => {
                    const out = computePhoneDefaultOutput(phone, activeGameTab, grip.id, 'onetap');
                    const d = out.sensitivity.data as FreeFireSensi;
                    return (
                      <tr key={grip.id}>
                        <td className="py-2 pr-2 text-zinc-200">{grip.label}</td>
                        <td className="py-2 px-2 text-[#00FF66] font-bold">{d.general}</td>
                        <td className="py-2 px-2 text-white">{d.redDot}</td>
                        <td className="py-2 pl-2 text-zinc-300">{out.fireButton.sizePercent}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-black/50 border border-zinc-800 space-y-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-sm sm:text-base font-cyber font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#00FF66]" />
              <span>Device Touch &amp; Drag Calibration Notes</span>
            </h2>
            <p>{refreshAdvice}</p>
            <p>{runwayAdvice}</p>
            <p className="text-xs font-mono-code text-zinc-400">
              Drag Runway: {primaryOutput.telemetry.screenDragRunwayMm}mm • Overshoot Risk:{' '}
              <span className="text-[#00FF66]">{primaryOutput.telemetry.overshootRisk}</span> • Calibration Confidence:{' '}
              <span className="text-white">{primaryOutput.telemetry.confidenceScore}%</span>
            </p>
          </div>
        </section>

        {/* Related Models under Same Brand */}
        {siblingPopular.length > 0 && (
          <section aria-labelledby="sibling-models-heading" className="pt-4 border-t border-zinc-800/80 space-y-3">
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
