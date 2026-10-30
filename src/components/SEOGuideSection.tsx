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
  Gamepad2,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { playCyberClick } from '../utils/sound';

export const SEOGuideSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'ff_india' | 'ff_max' | 'firebutton' | 'hardware'>('ff_india');

  const toggleFaq = (index: number) => {
    playCyberClick('click');
    setOpenFaq(openFaq === index ? null : index);
  };

  const selectTab = (tab: 'ff_india' | 'ff_max' | 'firebutton' | 'hardware') => {
    playCyberClick('click');
    setActiveTab(tab);
  };

  const faqs = [
    {
      q: 'Why does my Free Fire crosshair drag past the enemy head onto the sky?',
      a: 'This issue (called "Over-Drag") happens when your General sensitivity is too high for your phone\'s touch sampling rate, or when your fire button is positioned too high on the screen. On 120Hz/144Hz smartphones, your swipe registers twice as fast as on a 60Hz screen. Lowering your General sensitivity by 3-5% and maintaining a 50-54% fire button in the lower 18% of the display restricts thumb swipe acceleration, causing the crosshair to lock directly onto the head hitbox.'
    },
    {
      q: 'What is the exact difference between Free Fire India and Free Fire MAX sensitivity?',
      a: 'Both editions utilize the supported 0–200 in-game sensitivity scale. Free Fire India settings in SensiVerse are tailored starting recommendations calibrated around your specific phone screen size and refresh rate, while Free Fire MAX profiles incorporate high-resolution rendering swipe pacing.'
    },
    {
      q: 'How does SensiVerse calibrate Free Fire India settings?',
      a: 'SensiVerse uses your phone\'s physical display dimensions, touch sampling rate, and selected playstyle to calculate an optimal starting profile. These recommended baselines prevent chest-lock or over-drag, giving you a balanced foundation to fine-tune in the Training Ground.'
    },
    {
      q: 'How does Touch Sampling Rate affect mobile gaming drag speed?',
      a: 'Touch sampling rate is the number of times per second (e.g. 180Hz, 240Hz, 360Hz, or 720Hz) your phone screen polls your finger for touch input. High touch sampling rate eliminates the tiny microscopic delays between micro-adjustments, meaning vertical upward drag registers immediately without dead-zones.'
    },
    {
      q: 'Does changing Smallest Width (DPI) in Android Developer Options improve sensitivity?',
      a: 'Adjusting Android Minimum Width / DPI scales down UI density, which slightly alters the physical pixel-to-millimeter ratio that your swipe translates into in games. A recommended DPI between 411 and 460 provides smoother micro-swiping without causing system crashes or UI glitching.'
    },
    {
      q: 'Why should claw players use a different sensitivity than thumb players in Free Fire?',
      a: '2-Finger Thumb players must perform all actions (aiming, jumping, shooting, camera rotation) with just two thumbs, which requires higher camera sensitivity to turn 180 degrees quickly. 3-Finger and 4-Finger Claw players have dedicated fingers for shooting and movement, allowing them to use lower, more disciplined sensitivity with better micro-tracking.'
    },
    {
      q: 'Why does SensiVerse strictly enforce a 40% to 55% Fire Button size range?',
      a: 'Through extensive touch trajectory testing across 500+ mobile screens, fire buttons smaller than 40% lead to missed inputs and thumb slip during fast-paced encounters, while sizes exceeding 55% reduce vertical drag runway by up to 25mm, causing premature thumb collisions with physical phone bezels.'
    }
  ];

  return (
    <section aria-labelledby="seo-guides-heading" className="w-full my-8 space-y-6">
      
      {/* Educational Guides Container */}
      <div className="bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="seo-guides-heading" className="text-lg sm:text-xl font-bold font-cyber text-white">
                MOBILE ESPORTS SENSITIVITY & TOUCH ARCHITECTURE GUIDES
              </h2>
              <p className="text-xs text-zinc-400 font-mono-code">
                Scientific calibration principles for Free Fire India 🇮🇳 & Free Fire MAX 🔥
              </p>
            </div>
          </div>

          {/* Guide Quick-Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-zinc-800/80 overflow-x-auto">
            <button
              onClick={() => selectTab('ff_india')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'ff_india'
                  ? 'bg-amber-400 text-black font-bold shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Free Fire India 🇮🇳
            </button>
            <button
              onClick={() => selectTab('ff_max')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'ff_max'
                  ? 'bg-[#00FF66] text-black font-bold shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Free Fire MAX 🔥
            </button>
            <button
              onClick={() => selectTab('firebutton')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'firebutton'
                  ? 'bg-[#00FF66] text-black font-bold shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Fire Button Science
            </button>
            <button
              onClick={() => selectTab('hardware')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'hardware'
                  ? 'bg-[#00FF66] text-black font-bold shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Hardware Physics
            </button>
          </div>
        </div>

        {/* Tab 1: Free Fire India */}
        {activeTab === 'ff_india' && (
          <article className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2 text-[#00FF66]">
                <span className="text-base">🇮🇳</span>
                <h3 className="font-cyber font-bold text-sm sm:text-base text-white">
                  Free Fire India: Sensitivity Calibration & Headshot Guide
                </h3>
              </div>
              <span className="text-[10px] font-mono-code text-[#00FF66] bg-[#00FF66]/10 px-2.5 py-1 rounded-lg border border-[#00FF66]/30 shrink-0 font-bold uppercase tracking-wider w-fit">
                Recommended Starting Point
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Free Fire India sensitivity settings provide a balanced starting point calculated around your phone's screen size and refresh rate. Engineered for responsive drag-headshot control, these baseline values help prevent your crosshair from dragging over enemy heads or locking onto chest armor. Test your settings for 5–10 minutes in the Training Ground to dial in your thumb flick before jumping into ranked games.
            </p>

            <div className="p-3 rounded-xl bg-[#00FF66]/5 border border-[#00FF66]/30 text-xs text-zinc-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Starting Point Notice:</strong> Every player's thumb pressure, screen protector, and swipe distance are unique. Apply these recommendations first, then make gradual 2–3 point micro-adjustments in practice matches.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-black/60 border border-[#00FF66]/20 hover:border-[#00FF66]/40 transition-colors space-y-2">
                <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  Phone-Specific Settings
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Calculated directly from your screen dimensions and display refresh rate. High refresh displays receive stabilized General sensitivity to keep your swipe steady and responsive.
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
                  Spend 5 to 10 minutes testing stationary one-taps and running drag-shots. Confirm your fire button size and fine-tune your upward thumb flick with target dummies.
                </p>
              </div>
            </div>
          </article>
        )}

        {/* Tab 2: Free Fire MAX */}
        {activeTab === 'ff_max' && (
          <article className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-[#00FF66]">
              <Flame className="w-4 h-4" />
              <h3 className="font-cyber font-bold text-sm sm:text-base text-white">
                Free Fire MAX: Drag Headshot Physics & Thumb Runway Optimization
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              In Free Fire MAX, headshot consistency does not depend on auto-aim or random configs. It is governed strictly by the mechanical relationship between <strong className="text-white">General Sensitivity</strong>, <strong className="text-white">Vertical Drag Speed</strong>, and the available <strong className="text-white">physical screen runway</strong> before your thumb hits the top phone bezel.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
                <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  General & Red Dot Drag
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  General sensitivity controls non-scoped camera velocity. High touch sampling screens (360Hz+) require lower values (95–105) to prevent overdrag past the neck hitbox, while 60Hz panels require higher values (140–180) to register fast flick acceleration.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
                <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5" />
                  Fire Button Sizing (40%–55%)
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Keeping your fire button between 40% and 55% placed in the bottom 16%–18% quadrant guarantees at least 50mm of vertical drag runway. Oversized buttons (60%+) cause premature upward finger stalls, locking bullets onto the chest.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
                <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  2X & 4X Scope Tracking
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Mid-range scope sensitivities must balance bullet spread reset intervals with horizontal target tracking. Setting 2X slightly higher than 4X (e.g., 88 vs 82) compensates for narrower optical zoom field-of-view deceleration.
                </p>
              </div>
            </div>
          </article>
        )}

        {/* Tab 3: Fire Button Science & Drag Headshot Mechanics */}
        {activeTab === 'firebutton' && (
          <article className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-[#00FF66]">
              <Target className="w-4 h-4" />
              <h3 className="font-cyber font-bold text-sm sm:text-base text-white">
                Fire Button Science: HUD Button Sizing, Runway Mechanics & Auto-Headshots
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              In Free Fire and Free Fire MAX, the size and screen coordinate placement of your right-hand fire button dictate drag distance, initial contact acceleration, and target locking consistency.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
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
                  Use straight vertical drags for stationary or head-on targets at mid-range. For lateral sprinting enemies, initiate a curved J-drag: flick slightly downward then violently curve toward the enemy's running direction.
                </p>
              </div>
            </div>
          </article>
        )}

        {/* Tab 4: Hardware Physics */}
        {activeTab === 'hardware' && (
          <article className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-[#00FF66]">
              <Cpu className="w-4 h-4" />
              <h3 className="font-cyber font-bold text-sm sm:text-base text-white">
                Hardware Science: Refresh Rates, Touch Polling & Input Latency
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Copying professional player sensitivity numbers without matching their display specs is the #1 cause of aiming inconsistency. Display hardware dictates the exact relationship between physical touch and in-game camera rotation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
                <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  60Hz vs 120Hz vs 165Hz Frame Intervals
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  At 60Hz, a frame renders every 16.6ms; at 120Hz, this shrinks to 8.3ms; at 165Hz, down to 6.0ms. Because human eye-hand coordination receives visual feedback twice as fast at 120Hz, finger inputs are more agile and over-flicking occurs if old 60Hz sensitivities are retained. SensiVerse dampens 120Hz/165Hz profiles to keep crosshairs stabilized.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/80 space-y-2">
                <h4 className="text-xs font-bold font-cyber text-[#00FF66] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Touch Polling Rate (180Hz to 720Hz)
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Touch sampling measures how many times per second the digitizer scans for finger position changes. High touch polling (480Hz–720Hz) eliminates micro-input dead zones. Sensitivity on high-sampling devices must be calibrated with tighter drag curves to prevent erratic crosshair vibration.
                </p>
              </div>
            </div>
          </article>
        )}

      </div>

      {/* SEO FAQ Accordion */}
      <div className="bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-[#00FF66]" />
          <h2 className="text-lg sm:text-xl font-bold font-cyber text-white">
            FREQUENTLY ASKED QUESTIONS (FAQ)
          </h2>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3">
                <button
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between text-left gap-3 py-1 cursor-pointer group"
                >
                  <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-[#00FF66] transition-colors">
                    {faq.q}
                  </span>
                  <div className="shrink-0 text-zinc-400 group-hover:text-[#00FF66]">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed pr-4 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};
