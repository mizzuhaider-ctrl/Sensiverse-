import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Cpu,
  Sparkles,
  HelpCircle,
  Crosshair,
  Target,
  Smartphone,
  ShieldCheck,
  Flame,
  Zap,
  CheckCircle2,
  Globe2,
  ArrowRight,
} from 'lucide-react';
import { playCyberClick } from '../utils/sound';
import { PHASE9_BRAZILIAN_PROFILES } from '../data/brazilSensiProfiles';
import { INDONESIAN_SENSI_PROFILES } from '../data/indonesiaSensiProfiles';

interface SEOGuideSectionProps {
  onNavigate?: (path: string, hash?: string) => void;
  onOpenBrazilianSensi?: () => void;
  onOpenIndonesianSensi?: () => void;
}

const GUIDE_ANCHORS = [
  { id: 'ff_india', anchorId: 'guide-ff-india', label: 'Free Fire India 🇮🇳' },
  { id: 'ff_max', anchorId: 'guide-ff-max', label: 'Free Fire MAX 🔥' },
  { id: 'firebutton', anchorId: 'guide-firebutton', label: 'Fire Button Science' },
  { id: 'hardware', anchorId: 'guide-hardware', label: 'Hardware Physics' },
] as const;

export const SEOGuideSection: React.FC<SEOGuideSectionProps> = ({
  onNavigate,
  onOpenBrazilianSensi,
  onOpenIndonesianSensi,
}) => {
  const handleInternalNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
    hash?: string
  ) => {
    if (!onNavigate) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    playCyberClick('click');
    onNavigate(path, hash);
  };
  const [collapsedFaqs, setCollapsedFaqs] = useState<Record<number, boolean>>({});
  const [activeGuide, setActiveGuide] = useState<
    'ff_india' | 'ff_max' | 'firebutton' | 'hardware'
  >('ff_india');

  const toggleFaq = (index: number) => {
    playCyberClick('click');
    setCollapsedFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const selectGuideJump = (
    tab: 'ff_india' | 'ff_max' | 'firebutton' | 'hardware',
    anchorId: string
  ) => {
    playCyberClick('click');
    setActiveGuide(tab);
    if (typeof document !== 'undefined') {
      const target = document.getElementById(anchorId);
      target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const brazilEditorial = PHASE9_BRAZILIAN_PROFILES[0];
  const indonesiaEditorial = INDONESIAN_SENSI_PROFILES[0];

  const faqs = [
    {
      q: 'Why does my Free Fire crosshair drag past the enemy head onto the sky?',
      a: 'This issue (called "Over-Drag") happens when your General sensitivity is too high for your phone\'s touch sampling rate, or when your fire button is positioned too high on the screen. On 120Hz/144Hz smartphones, your swipe registers twice as fast as on a 60Hz screen. Lowering your General sensitivity by 3-5% and keeping your fire button within the recommended 40–55% range (such as 50–54%) in the lower 18% of the display helps reduce excessive upward over-drag so manual swipes align more consistently with head level.',
    },
    {
      q: 'What is the exact difference between Free Fire India and Free Fire MAX sensitivity?',
      a: 'Both editions utilize the supported 0–200 in-game sensitivity scale. Free Fire India settings in SensiVerse are tailored starting recommendations calibrated around your specific phone screen size and refresh rate, while Free Fire MAX profiles incorporate high-resolution rendering swipe pacing.',
    },
    {
      q: 'How does SensiVerse calibrate Free Fire India settings?',
      a: 'SensiVerse uses your phone\'s physical display dimensions, touch sampling rate, and selected playstyle to calculate an optimal starting profile. These recommended baselines prevent chest-lock or over-drag, giving you a balanced foundation to fine-tune in the Training Ground.',
    },
    {
      q: 'How does Touch Sampling Rate affect mobile gaming drag speed?',
      a: 'Touch sampling rate is the number of times per second (e.g. 180Hz, 240Hz, 360Hz, or 720Hz) your phone screen polls your finger for touch input. High touch sampling rate eliminates the tiny microscopic delays between micro-adjustments, meaning vertical upward drag registers immediately without dead-zones.',
    },
    {
      q: 'Does changing Smallest Width (DPI) in Android Developer Options improve sensitivity?',
      a: 'You can play effectively with no DPI changes using your phone\'s stock Smallest Width, because SensiVerse\'s 0–200 sensitivity settings already calibrate for screen size and refresh rate. If you prefer Developer Options DPI tuning, keeping Android Minimum Width between 411 and 460 gives smoother micro-swiping without UI glitching.',
    },
    {
      q: 'Why should claw players use a different sensitivity than thumb players in Free Fire?',
      a: '2-Finger Thumb players must perform all actions (aiming, jumping, shooting, camera rotation) with just two thumbs, which requires higher camera sensitivity to turn 180 degrees quickly. 3-Finger and 4-Finger Claw players have dedicated fingers for shooting and movement, allowing them to use lower, more disciplined sensitivity with better micro-tracking.',
    },
    {
      q: 'Why does SensiVerse recommend a 40% to 55% Fire Button size range?',
      a: 'Based on SensiVerse’s HUD geometry and hardware-based recommendations, fire buttons smaller than 40% can increase missed taps and thumb slip during fast encounters, while sizes exceeding 55% leave less vertical drag runway before reaching physical phone bezels. You can still customize the slider anywhere from 10% to 100%.',
    },
    {
      q: 'Why does Apple iPhone show iOS Retina PPI instead of Android DPI on SensiVerse?',
      a: 'Android devices support Developer Options Smallest Width (DPI) scaling across SensiVerse’s verified 320–800 catalog DPI range (with 411–460 recommended for balanced swipe precision). Apple iPhones do not expose an Android-style DPI developer setting in iOS, so SensiVerse calibrates iPhone sensitivity around native Retina pixel density (PPI) and touch response rather than unsafe system overrides.',
    },
    {
      q: 'How do 60 FPS and 90 FPS settings affect Free Fire MAX sensitivity calibration?',
      a: 'Higher frame rates shorten frame intervals (16.6ms at 60 FPS versus 11.1ms at 90 FPS), making vertical drag swipes feel slightly faster visually. Using verified hardware and release-tier checks, SensiVerse offers 90 FPS calibration on eligible 90Hz+ gaming phones and recent flagships while capping 60Hz panels and budget processors at 60 FPS.',
    },
    {
      q: 'Should I use different sensitivity for Shotguns (M1887), SMGs (MP40), and Snipers (AWM)?',
      a: 'Yes. Shotgun (M1887, M1014) and Pistol (Desert Eagle) profiles prioritize crisp initial upward General flick speed with slightly larger 48%–54% fire button sizing, SMG profiles (MP40, UMP) tune General and Red Dot for rapid 3–5 bullet drag bursts, AR and Marksman classes stabilize sustained spray and 2X/4X climb, and Sniper profiles damp Sniper Scope velocity (52–68 range) for steady AWM tracking.',
    },
  ];

  return (
    <section aria-labelledby="seo-guides-heading" className="w-full my-8 space-y-6">
      {/* Educational Guides Container — All 4 guides visibly rendered in initial SSR HTML */}
      <div className="bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
        {/* Section Header & Quick-Jump Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="seo-guides-heading" className="text-lg sm:text-xl font-bold font-cyber text-white">
                MOBILE ESPORTS SENSITIVITY &amp; TOUCH ARCHITECTURE GUIDES
              </h2>
              <p className="text-xs text-zinc-400 font-mono-code">
                Hardware-based calibration principles for Free Fire, Free Fire MAX 🔥 &amp; Free Fire India 🇮🇳 (60Hz–185Hz)
              </p>
            </div>
          </div>

          <nav
            aria-label="Sensitivity Guide Sections"
            className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-zinc-800/80 overflow-x-auto"
          >
            {GUIDE_ANCHORS.map((item) => (
              <a
                key={item.id}
                href={`#${item.anchorId}`}
                onClick={(e) => {
                  e.preventDefault();
                  selectGuideJump(item.id, item.anchorId);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeGuide === item.id
                    ? item.id === 'ff_india'
                      ? 'bg-amber-400 text-black font-bold shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                      : 'bg-[#00FF66] text-black font-bold shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Guide 1: Free Fire India */}
        <article
          id="guide-ff-india"
          className={`space-y-4 rounded-xl p-4 sm:p-5 bg-black/40 border transition-colors ${
            activeGuide === 'ff_india' ? 'border-amber-400/40' : 'border-zinc-800/80'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
            <div className="flex items-center gap-2 text-[#00FF66]">
              <span className="text-base">🇮🇳</span>
              <h3 className="font-cyber font-bold text-sm sm:text-base text-white">
                Free Fire India: Sensitivity Calibration &amp; Headshot Guide
              </h3>
            </div>
            <span className="text-[10px] font-mono-code text-[#00FF66] bg-[#00FF66]/10 px-2.5 py-1 rounded-lg border border-[#00FF66]/30 shrink-0 font-bold uppercase tracking-wider w-fit">
              Recommended Starting Point
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Free Fire India sensitivity settings provide a balanced starting point calculated around your{' '}
            <a href="#device-selector" className="text-[#00FF66] hover:underline underline-offset-2">
              phone&apos;s screen size and refresh rate
            </a>
            . Engineered for responsive drag-headshot control, these{' '}
            <a href="#step-6-results" className="text-[#00FF66] hover:underline underline-offset-2">
              baseline values
            </a>{' '}
            help prevent your crosshair from dragging over enemy heads or locking onto chest armor. Test your settings for 5–10 minutes in the{' '}
            <a href="#training-ground" className="text-[#00FF66] hover:underline underline-offset-2">
              Training Ground
            </a>{' '}
            to dial in your thumb flick before jumping into ranked games.
          </p>

          <div className="p-3 rounded-xl bg-[#00FF66]/5 border border-[#00FF66]/30 text-xs text-zinc-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">Starting Point Notice:</strong> Every player&apos;s thumb pressure, screen protector, and swipe distance are unique. Apply these recommendations first, then make gradual 2–3 point micro-adjustments in practice matches.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-black/60 border border-[#00FF66]/20 hover:border-[#00FF66]/40 transition-colors space-y-2">
              <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                Phone-Specific Settings
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Calculated directly from your screen dimensions and display refresh rate. High refresh displays receive stabilized{' '}
                <a href="#step-6-results" className="text-zinc-200 hover:text-[#00FF66] underline underline-offset-2">
                  General sensitivity
                </a>{' '}
                to keep your swipe steady and responsive.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-[#00FF66]/20 hover:border-[#00FF66]/40 transition-colors space-y-2">
              <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Drag Headshot Control
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Harmonizes General and Red Dot values so your crosshair climbs smoothly from chest to head hitbox without over-dragging into the sky or sticking to torso armor.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-[#00FF66]/20 hover:border-[#00FF66]/40 transition-colors space-y-2">
              <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5" />
                Training Ground Testing
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Spend 5 to 10 minutes testing stationary one-taps and running drag-shots. Confirm your{' '}
                <a href="#fire-button-hud" className="text-zinc-200 hover:text-[#00FF66] underline underline-offset-2">
                  fire button size
                </a>{' '}
                and fine-tune your upward thumb flick with target dummies.
              </p>
            </div>
          </div>
        </article>

        {/* Guide 2: Free Fire MAX */}
        <article
          id="guide-ff-max"
          className={`space-y-4 rounded-xl p-4 sm:p-5 bg-black/40 border transition-colors ${
            activeGuide === 'ff_max' ? 'border-[#00FF66]/50' : 'border-zinc-800/80'
          }`}
        >
          <div className="flex items-center gap-2 text-[#00FF66] border-b border-zinc-800/80 pb-2">
            <Flame className="w-4 h-4" />
            <h3 className="font-cyber font-bold text-sm sm:text-base text-white">
              Free Fire MAX: Drag Headshot Physics &amp; Thumb Runway Optimization
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            In Free Fire and Free Fire MAX—whether playing with stock no-DPI settings or tuned Android Smallest Width—headshot consistency does not depend on auto-aim or random configs. It is governed strictly by the mechanical relationship between{' '}
            <strong className="text-white">General Sensitivity</strong>,{' '}
            <strong className="text-white">Vertical Drag Speed</strong>, and the available{' '}
            <strong className="text-white">physical screen runway</strong> before your thumb hits the top phone bezel.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
              <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                General &amp; Red Dot Drag
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                General sensitivity controls non-scoped camera velocity. High touch sampling screens (360Hz+) require disciplined baseline balancing to prevent overdrag past the neck hitbox, while 60Hz panels compensate with stronger flick acceleration.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
              <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5" />
                Fire Button Sizing (40%–55%)
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Keeping your fire button within the recommended 40% to 55% range in the bottom 16%–18% quadrant helps preserve generous vertical drag runway (often ~50mm+ on mainstream displays). Oversized buttons (60%+) can restrict upward thumb travel during rapid drag shots.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
              <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                2X &amp; 4X Scope Tracking
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mid-range scope sensitivities must balance bullet spread reset intervals with horizontal target tracking. Setting 2X slightly higher than 4X compensates for narrower optical zoom field-of-view deceleration.
              </p>
            </div>
          </div>
        </article>

        {/* Guide 3: Fire Button Science & Drag Headshot Mechanics */}
        <article
          id="guide-firebutton"
          className={`space-y-4 rounded-xl p-4 sm:p-5 bg-black/40 border transition-colors ${
            activeGuide === 'firebutton' ? 'border-[#00FF66]/50' : 'border-zinc-800/80'
          }`}
        >
          <div className="flex items-center gap-2 text-[#00FF66] border-b border-zinc-800/80 pb-2">
            <Target className="w-4 h-4" />
            <h3 className="font-cyber font-bold text-sm sm:text-base text-white">
              Fire Button Layout: HUD Button Sizing, Runway Mechanics &amp; Headshot-Focused Settings
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            In Free Fire and Free Fire MAX, the size and screen coordinate placement of your{' '}
            <a href="#fire-button-hud" className="text-[#00FF66] hover:underline underline-offset-2">
              right-hand fire button
            </a>{' '}
            dictate drag distance, initial contact acceleration, and target locking consistency.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
              <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Button Sizing: 42%–52% Sweetspot
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Buttons sized below 38% increase miss-clicks during rapid engagements, while buttons over 58% consume too much vertical travel distance before registering drag momentum, stalling crosshairs on the neck or chest.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
              <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Bottom Quadrant Placement
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Positioning the fire button within the bottom 14%–18% of the right HUD gives thumbs a clean 55mm to 65mm upward runway. This prevents running out of screen real estate during high-speed drag flicks.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
              <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Straight vs J-Drag Profiles
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Use straight vertical drags for stationary or head-on targets at mid-range. For lateral sprinting enemies, initiate a curved J-drag: flick slightly downward then smoothly curve toward the enemy&apos;s running direction.
              </p>
            </div>
          </div>
        </article>

        {/* Guide 4: Hardware Physics (Verified 60-185Hz & Up to 2880Hz Touch Polling) */}
        <article
          id="guide-hardware"
          className={`space-y-4 rounded-xl p-4 sm:p-5 bg-black/40 border transition-colors ${
            activeGuide === 'hardware' ? 'border-[#00FF66]/50' : 'border-zinc-800/80'
          }`}
        >
          <div className="flex items-center gap-2 text-[#00FF66] border-b border-zinc-800/80 pb-2">
            <Cpu className="w-4 h-4" />
            <h3 className="font-cyber font-bold text-sm sm:text-base text-white">
              Hardware-Based Recommendations: Refresh Rates (60Hz–185Hz), Touch Polling &amp; Input Latency
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Copying professional player sensitivity numbers without matching their display specs is the #1 cause of aiming inconsistency. Display hardware dictates the exact relationship between physical touch and in-game camera rotation across SensiVerse&apos;s{' '}
            <a
              href="/phones"
              onClick={(e) => handleInternalNav(e, '/phones')}
              className="text-[#00FF66] hover:underline underline-offset-2 font-semibold"
            >
              1,089 supported models and 26 smartphone brands
            </a>
            .
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
              <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                60Hz to 185Hz Display Frame Intervals
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                At 60Hz, a frame renders every 16.6ms; at 90Hz, 11.1ms; at 120Hz, 8.3ms; at 144Hz, 6.9ms; at 165Hz, 6.0ms; and down to 5.4ms on 185Hz esports panels. Faster frame cadence gives your hand quicker visual feedback, so SensiVerse dampens high-refresh curves to prevent over-flicking.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
              <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Touch Polling Rate (Up to 2880Hz Instant Sampling)
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Touch sampling measures how many times per second a digitizer scans finger movement—spanning mainstream 180Hz–480Hz panels up to 720Hz–2880Hz instant touch polling on verified gaming phones. High-polling screens use steadier drag slopes to avoid micro-jitter.
              </p>
            </div>
          </div>
        </article>
      </div>

      {/* Regional Benchmark Summaries (Verified Brazil & Indonesia Data) */}
      <section
        aria-labelledby="regional-presets-heading"
        data-testid="regional-presets-summary"
        className="bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66]">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="regional-presets-heading" className="text-lg sm:text-xl font-bold font-cyber text-white">
                BRAZILIAN 🇧🇷 &amp; INDONESIAN 🇮🇩 BENCHMARK RANGES
              </h2>
              <p className="text-xs text-zinc-400 font-mono-code">
                Audited 0–200 community editorial guide ranges — strictly isolated from hardware calibration defaults
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Brazil Editorial Summary */}
          <div className="p-4 rounded-xl bg-black/50 border border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
              <h3 className="font-cyber font-bold text-sm text-white">
                🇧🇷 {brazilEditorial.name}
              </h3>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66]">
                {brazilEditorial.badgeLabel}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Source: <strong className="text-white">{brazilEditorial.sourceName}</strong>. Selected baseline values inside published hardware tier ranges (not claimed as official Garena or private pro-player configs):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono-code">
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">General</span>
                <strong className="text-[#00FF66]">{brazilEditorial.values.general}</strong>
                <span className="text-[10px] text-zinc-400 block">Range {brazilEditorial.publishedRanges?.general}</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">Red Dot</span>
                <strong className="text-white">{brazilEditorial.values.redDot}</strong>
                <span className="text-[10px] text-zinc-400 block">Range {brazilEditorial.publishedRanges?.redDot}</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">2x / 4x</span>
                <strong className="text-white">
                  {brazilEditorial.values.scope2x} / {brazilEditorial.values.scope4x}
                </strong>
                <span className="text-[10px] text-zinc-400 block">Sniper {brazilEditorial.values.sniperScope}</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">Fire Button</span>
                <strong className="text-[#00FF66]">{brazilEditorial.values.fireButtonSizePercent}%</strong>
                <span className="text-[10px] text-zinc-400 block">Range {brazilEditorial.publishedRanges?.fireButton}</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Built for Brazil (<strong className="text-zinc-200">sensibilidade Free Fire para subir capa</strong>, sem DPI or Menor Largura DPI, and <strong className="text-zinc-200">tamanho do botão de atirar</strong>), plus internal heuristic 120Hz ProMotion (General {PHASE9_BRAZILIAN_PROFILES[1].values.general}) and 60Hz Standard (General {PHASE9_BRAZILIAN_PROFILES[2].values.general}) starting estimates.
            </p>
            {onOpenBrazilianSensi && (
              <button
                type="button"
                onClick={() => {
                  playCyberClick('click');
                  onOpenBrazilianSensi();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-[#00FF66]/50 text-xs font-mono-code text-[#00FF66] transition-colors cursor-pointer"
              >
                <span>Open Brazilian Sensi Lab (3 Presets)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Indonesia Editorial Summary */}
          <div className="p-4 rounded-xl bg-black/50 border border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
              <h3 className="font-cyber font-bold text-sm text-white">
                🇮🇩 {indonesiaEditorial.name}
              </h3>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66]">
                {indonesiaEditorial.badgeLabel}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Source: <strong className="text-white">{indonesiaEditorial.sourceName}</strong>. Selected values within published Indonesian editorial ranges for fast rush drag control and scope stability:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono-code">
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">General</span>
                <strong className="text-[#00FF66]">{indonesiaEditorial.values.general}</strong>
                <span className="text-[10px] text-zinc-400 block">Range {indonesiaEditorial.publishedRanges?.general}</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">Red Dot</span>
                <strong className="text-white">{indonesiaEditorial.values.redDot}</strong>
                <span className="text-[10px] text-zinc-400 block">Range {indonesiaEditorial.publishedRanges?.redDot}</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">2x / 4x</span>
                <strong className="text-white">
                  {indonesiaEditorial.values.scope2x} / {indonesiaEditorial.values.scope4x}
                </strong>
                <span className="text-[10px] text-zinc-400 block">Sniper {indonesiaEditorial.values.sniperScope}</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">Fire Button</span>
                <strong className="text-[#00FF66]">{indonesiaEditorial.values.fireButtonSizePercent}%</strong>
                <span className="text-[10px] text-zinc-400 block">Range {indonesiaEditorial.publishedRanges?.fireButton}</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Tuned for Indonesia &amp; SEA (<strong className="text-zinc-200">sensitivitas Free Fire auto headshot</strong>, tanpa DPI, and <strong className="text-zinc-200">ukuran tombol tembak FF</strong>), plus 120Hz Rusher (General {INDONESIAN_SENSI_PROFILES[1].values.general}) and 60Hz Stability (General {INDONESIAN_SENSI_PROFILES[2].values.general}) adaptations with single-click Revert.
            </p>
            {onOpenIndonesianSensi && (
              <button
                type="button"
                onClick={() => {
                  playCyberClick('click');
                  onOpenIndonesianSensi();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-[#00FF66]/50 text-xs font-mono-code text-[#00FF66] transition-colors cursor-pointer"
              >
                <span>Open Indonesian Sensi Lab (3 Presets)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Worldwide LATAM, PH/US/EU & Weapon/HUD Quick Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-black/50 border border-zinc-800 space-y-2">
            <h3 className="font-cyber font-bold text-xs sm:text-sm text-[#00FF66]">
              🌎 LATAM (MX, CO, AR), PH, US &amp; EUROPE SENSITIVITY CALIBRATION
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Players across Mexico, Colombia, Argentina, Spain (<strong className="text-white">sensibilidad Free Fire para dar todo rojo</strong>, <strong className="text-white">sin DPI</strong>, y <strong className="text-white">botón de disparo 42%–54%</strong>), the Philippines, USA, India, and Europe can calibrate exact 0–200 sliders by{' '}
              <a
                href="/phones"
                onClick={(e) => handleInternalNav(e, '/phones')}
                className="text-[#00FF66] hover:underline underline-offset-2"
              >
                phone brand &amp; model
              </a>{' '}
              with 2-finger thumb or 3/4-finger{' '}
              <a href="#fire-button-hud" className="text-[#00FF66] hover:underline underline-offset-2">
                HUD layout coordinates
              </a>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-zinc-800 space-y-2">
            <h3 className="font-cyber font-bold text-xs sm:text-sm text-[#00FF66]">
              🎯 WEAPON-CLASS SENSITIVITY &amp; SCOPE COMPARISON
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Compare calibrated sensitivity across all 6 weapon roles in the{' '}
              <a href="#step-6-results" className="text-[#00FF66] hover:underline underline-offset-2">
                live generator
              </a>{' '}
              or per-device{' '}
              <a
                href="/phones"
                onClick={(e) => handleInternalNav(e, '/phones')}
                className="text-[#00FF66] hover:underline underline-offset-2"
              >
                phone guides
              </a>
              : <strong className="text-white">SMG</strong> (MP40, UMP), <strong className="text-white">Shotgun</strong> (M1887, M1014), <strong className="text-white">AR</strong> (AK, M4A1, SCAR), <strong className="text-white">Sniper</strong> (AWM, M82B), <strong className="text-white">Pistol</strong> (Desert Eagle), and <strong className="text-white">Marksman</strong> (Woodpecker, SVD).
            </p>
          </div>
        </div>
      </section>

      {/* SEO FAQ Accordion — All 10 answers visibly accessible in initial SSR HTML */}
      <div id="faq" className="bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-[#00FF66]" />
          <h2 className="text-lg sm:text-xl font-bold font-cyber text-white">
            FREQUENTLY ASKED QUESTIONS (FAQ)
          </h2>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {faqs.map((faq, idx) => {
            const isCollapsed = Boolean(collapsedFaqs[idx]);
            return (
              <div key={idx} className="py-3">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={!isCollapsed}
                  className="w-full flex items-center justify-between text-left gap-3 py-1.5 cursor-pointer group"
                >
                  <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-[#00FF66] transition-colors">
                    {faq.q}
                  </span>
                  <div className="shrink-0 text-zinc-400 group-hover:text-[#00FF66]">
                    {!isCollapsed ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                <div
                  className={
                    isCollapsed
                      ? 'hidden'
                      : 'mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed pr-4'
                  }
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
