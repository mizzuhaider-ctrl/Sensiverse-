import React from 'react';
import { Target, Zap, ShieldCheck, Crosshair, Cpu, Gauge } from 'lucide-react';
import { playCyberClick } from '../utils/sound';
import { LiveActivityCounter } from './LiveActivityCounter';

interface HeroSectionProps {
  onScrollToGenerator: () => void;
  selectedDeviceName: string;
  selectedGameName: string;
  fireButtonSize: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onScrollToGenerator,
  selectedDeviceName,
  selectedGameName,
  fireButtonSize,
}) => {
  return (
    <section className="relative w-full py-8 md:py-14 px-4 sm:px-6 overflow-hidden cyber-grid border-b border-zinc-900" style={{ isolation: 'isolate' }}>
      {/* Background ambient neon glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-[#00FF66]/10 rounded-full blur-[70px] sm:blur-[110px] pointer-events-none" />
      <div className="absolute top-0 right-4 sm:right-10 w-48 sm:w-64 h-48 sm:h-64 bg-[#00cc52]/5 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Heading and Value Proposition */}
        <div className="lg:col-span-7 space-y-5 text-center lg:text-left w-full">
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#00FF66]/40 shadow-[0_0_12px_rgba(0,255,102,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
              <span className="text-xs font-mono-code text-[#00FF66] uppercase tracking-wider font-semibold">
                Esports Touch Calibration v3.4
              </span>
            </div>

            <LiveActivityCounter />
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black font-cyber tracking-tight text-white leading-[1.1] w-full">
            PERFECT <span className="text-[#00FF66] drop-shadow-[0_0_20px_rgba(0,255,102,0.6)]">SENSI</span> FOR YOUR PHONE.
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 w-full max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Stop copying random pro settings that don’t match your screen. SensiVerse calculates mathematically balanced sensitivity, fire button sizing, and claw layouts calibrated specifically to your phone’s <span className="text-[#00FF66] font-semibold">refresh rate</span>, <span className="text-[#00FF66] font-semibold">touch sampling rate</span>, and screen dimensions.
          </p>

          {/* Key Metric Highlights - Fully responsive feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-2 w-full max-w-lg mx-auto lg:mx-0">
            <div className="p-3 sm:p-3.5 rounded-xl bg-black/70 border border-zinc-800/80 hover:border-[#00FF66]/30 transition-colors text-left sm:text-left flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
              <div className="flex items-center gap-1.5 text-[#00FF66]">
                <Gauge className="w-4 h-4 shrink-0" />
                <span className="font-cyber font-bold text-xs sm:text-sm">60-165Hz</span>
              </div>
              <p className="text-[11px] text-zinc-400">Frame Sync Calibrated</p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-black/70 border border-zinc-800/80 hover:border-[#00FF66]/30 transition-colors text-left sm:text-left flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
              <div className="flex items-center gap-1.5 text-[#00FF66]">
                <Cpu className="w-4 h-4 shrink-0" />
                <span className="font-cyber font-bold text-xs sm:text-sm">720Hz Touch</span>
              </div>
              <p className="text-[11px] text-zinc-400">Input Latency Tuned</p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-black/70 border border-zinc-800/80 hover:border-[#00FF66]/30 transition-colors text-left sm:text-left flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
              <div className="flex items-center gap-1.5 text-[#00FF66]">
                <Crosshair className="w-4 h-4 shrink-0" />
                <span className="font-cyber font-bold text-xs sm:text-sm">Anti-Overdrag</span>
              </div>
              <p className="text-[11px] text-zinc-400">Precision Trajectory</p>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full">
            <button
              onClick={() => {
                playCyberClick('calibrate');
                onScrollToGenerator();
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#00FF66] hover:bg-[#00e65c] text-black font-cyber font-black tracking-wide text-sm shadow-[0_0_25px_rgba(0,255,102,0.5)] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>CALIBRATE MY DEVICE NOW</span>
            </button>

            <div className="text-[11px] text-zinc-400 font-mono-code flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>No login • 100% Free • Safe & Fair-Play</span>
            </div>
          </div>

        </div>

        {/* Right Column: 3D Holographic Cyber Phone Preview Card */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="relative w-full max-w-[320px] xs:max-w-[350px] sm:max-w-[380px] aspect-[9/16] min-h-[440px] max-h-[500px] bg-gradient-to-b from-[#08120b] to-[#040806] rounded-[32px] p-4 border-2 border-[#00FF66]/40 shadow-[0_0_40px_rgba(0,255,102,0.25)] flex flex-col justify-between overflow-hidden group">
            
            {/* Top Phone Speaker / Camera Notch */}
            <div className="w-full flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                <span className="text-[10px] font-mono-code text-zinc-400">SENSI-HUD</span>
              </div>
              <div className="w-20 h-3.5 bg-black rounded-full border border-zinc-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-700" />
              </div>
              <span className="text-[10px] font-mono-code text-[#00FF66]">120 FPS</span>
            </div>

            {/* Radar / Crosshair 3D Simulation Center */}
            <div className="relative my-auto flex flex-col items-center justify-center">
              {/* Radar Rings */}
              <div className="relative w-44 h-44 rounded-full border border-[#00FF66]/20 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-[#00FF66]/30 flex items-center justify-center animate-pulse">
                  <div className="w-20 h-20 rounded-full border border-[#00FF66]/40 flex items-center justify-center">
                    <Crosshair className="w-8 h-8 text-[#00FF66] animate-spin" style={{ animationDuration: '14s' }} />
                  </div>
                </div>

                {/* Radar Sweep Needle */}
                <div 
                  className="absolute inset-0 rounded-full border-t-2 border-[#00FF66] opacity-40 animate-spin"
                  style={{ animationDuration: '4s' }}
                />

                {/* Physical Touch Runway Telemetry */}
                <div className="absolute -top-1 right-8 px-2 py-0.5 rounded bg-black/80 border border-[#00FF66] text-[9px] font-mono-code text-[#00FF66] shadow-[0_0_8px_rgba(0,255,102,0.6)]">
                  RUNWAY: 54mm
                </div>
              </div>

              {/* Live active profile overlay */}
              <div className="mt-4 text-center px-4 py-2 rounded-xl bg-black/80 border border-zinc-800 backdrop-blur-md w-full">
                <p className="text-[11px] font-cyber text-zinc-400 uppercase tracking-wider">
                  Target Config
                </p>
                <p className="text-sm font-bold text-white truncate">
                  {selectedDeviceName}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1 text-[10px] font-mono-code text-[#00FF66]">
                  <span>{selectedGameName}</span>
                  <span>•</span>
                  <span>Low Drag Friction</span>
                </div>
              </div>
            </div>

            {/* Bottom HUD Virtual Fire Button preview in mini */}
            <div className="w-full flex items-center justify-between px-2 pb-1 border-t border-zinc-900 pt-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400">
                  🕹️
                </div>
                <span className="text-[10px] text-zinc-400 font-mono-code">Move: 65%</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#00FF66] font-mono-code">Fire: {fireButtonSize}%</span>
                <div 
                  style={{ 
                    width: `${Math.round(30 + ((fireButtonSize - 40) / 15) * 14)}px`, 
                    height: `${Math.round(30 + ((fireButtonSize - 40) / 15) * 14)}px` 
                  }}
                  className="rounded-full bg-[#00FF66]/20 border-2 border-[#00FF66] flex items-center justify-center text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.5)] transition-all animate-pulse"
                >
                  <Target className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Subtle glow border line on hover */}
            <div className="absolute inset-0 rounded-[30px] border border-[#00FF66]/20 pointer-events-none group-hover:border-[#00FF66]/60 transition-colors" />
          </div>
        </div>

      </div>
    </section>
  );
};
