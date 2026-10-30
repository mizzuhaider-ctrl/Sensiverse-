import React from 'react';
import { 
  Gauge, 
  Activity, 
  ShieldCheck, 
  Crosshair, 
  Maximize2, 
  Info,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { AimTelemetry, PhoneModel } from '../types';

interface AimTelemetryCardProps {
  telemetry: AimTelemetry;
  phone: PhoneModel;
}

export const AimTelemetryCard: React.FC<AimTelemetryCardProps> = ({
  telemetry,
  phone,
}) => {
  const getSpeedColor = (speed: AimTelemetry['aimSpeed']) => {
    switch (speed) {
      case 'faster': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'slower': return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
      case 'balanced': return 'text-[#00FF66] bg-[#00FF66]/10 border-[#00FF66]/30';
    }
  };

  const getRiskColor = (risk: AimTelemetry['overshootRisk']) => {
    switch (risk) {
      case 'low': return 'text-[#00FF66] bg-[#00FF66]/10 border-[#00FF66]/30';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'high': return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
    }
  };

  const getEvidenceLabel = (category: AimTelemetry['evidenceCategory']) => {
    switch (category) {
      case 'official_manufacturer': return 'Official Manufacturer Specs';
      case 'published_reference': return 'Published Esport Benchmark';
      case 'algorithmic_estimate': return 'Algorithmic Touch Physics';
      case 'physically_tested': return 'Physically Lab Tested';
    }
  };

  return (
    <div className="w-full bg-[#08100b]/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Corner cyber accent */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#00FF66]/30 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00FF66]" />
          <h3 className="text-sm sm:text-base font-bold font-cyber text-white">
            AIM MOVEMENT & TOUCH TELEMETRY
          </h3>
        </div>

        {/* Evidence Category Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] font-mono-code text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" />
          <span>{getEvidenceLabel(telemetry.evidenceCategory)}</span>
          <span className="text-[#00FF66] font-bold">({telemetry.confidenceScore}%)</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-3">
        {/* Metric 1: Aim Speed */}
        <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/90 flex flex-col justify-between">
          <span className="text-[10px] font-mono-code text-zinc-400 uppercase tracking-wider">
            Aim Speed Output
          </span>
          <div className="mt-1 flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold font-cyber uppercase px-2 py-0.5 rounded border ${getSpeedColor(telemetry.aimSpeed)}`}>
              {telemetry.aimSpeed}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Flick & rotation responsiveness
          </p>
        </div>

        {/* Metric 2: Drag Control Requirement */}
        <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/90 flex flex-col justify-between">
          <span className="text-[10px] font-mono-code text-zinc-400 uppercase tracking-wider">
            Physical Drag Movement
          </span>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold font-cyber uppercase px-2 py-0.5 rounded border text-[#00FF66] bg-[#00FF66]/10 border-[#00FF66]/30">
              {telemetry.dragControl}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Runway: ~{telemetry.screenDragRunwayMm}mm diagonal
          </p>
        </div>

        {/* Metric 3: Overshoot Risk */}
        <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/90 flex flex-col justify-between">
          <span className="text-[10px] font-mono-code text-zinc-400 uppercase tracking-wider">
            Overshoot Risk
          </span>
          <div className="mt-1 flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold font-cyber uppercase px-2 py-0.5 rounded border ${getRiskColor(telemetry.overshootRisk)}`}>
              {telemetry.overshootRisk}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Based on {phone.refreshRate}Hz display clarity
          </p>
        </div>

        {/* Metric 4: Recoil Compensation */}
        <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/90 flex flex-col justify-between">
          <span className="text-[10px] font-mono-code text-zinc-400 uppercase tracking-wider">
            Recoil Profile
          </span>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold font-cyber uppercase px-2 py-0.5 rounded border text-zinc-200 bg-zinc-800 border-zinc-700">
              {telemetry.recoilControl}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Spray pull-down velocity
          </p>
        </div>
      </div>

      {/* Latency & Hardware Insights */}
      <div className="mt-3 p-3 rounded-xl bg-black/40 border border-zinc-800/80 text-xs text-zinc-300">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[#00FF66] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-mono-code text-zinc-400">
              {telemetry.latencyEstimationExplanation}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px]">
              {telemetry.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-[#00FF66]" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
