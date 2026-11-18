import React, { useState, useEffect, useRef } from 'react';

interface LiveActivityCounterProps {
  className?: string;
}

export const VISITOR_MIN_COUNT = 100;
export const VISITOR_MAX_COUNT = 679;

export interface VisitorWaveState {
  direction: 1 | -1;
  stepsRemaining: number;
}

/**
 * Generates a natural, non-repeating fluctuation step within [100, 679].
 * Uses variable-length directional waves and mixed gradual/moderate step sizes
 * so the counter rises and falls organically without fixed loops.
 */
export function computeNextVisitorCount(
  current: number,
  state: VisitorWaveState,
  randomFn: () => number = Math.random
): { nextCount: number; nextState: VisitorWaveState } {
  let { direction, stepsRemaining } = state;
  stepsRemaining -= 1;

  if (stepsRemaining <= 0) {
    if (current >= 560) {
      direction = randomFn() < 0.85 ? -1 : 1;
    } else if (current <= 185) {
      direction = randomFn() < 0.85 ? 1 : -1;
    } else {
      direction = randomFn() < 0.72 ? (direction === 1 ? -1 : 1) : direction;
    }
    stepsRemaining = Math.floor(randomFn() * 4) + 1; // 1 to 4 steps per mini-wave
  }

  // Enforce gentle turnaround near bounds
  if (current >= VISITOR_MAX_COUNT - 12) {
    direction = -1;
  } else if (current <= VISITOR_MIN_COUNT + 12) {
    direction = 1;
  }

  const roll = randomFn();
  let delta: number;
  if (roll < 0.15) {
    delta = Math.floor(randomFn() * 7) + 3; // Subtle drift: 3–9
  } else if (roll < 0.75) {
    delta = Math.floor(randomFn() * 19) + 10; // Gradual move: 10–28
  } else {
    delta = Math.floor(randomFn() * 26) + 27; // Moderate wave surge/drop: 27–52
  }

  let nextCount = current + direction * delta;

  if (nextCount > VISITOR_MAX_COUNT) {
    nextCount = VISITOR_MAX_COUNT - (Math.floor(randomFn() * 12) + 2);
    direction = -1;
  } else if (nextCount < VISITOR_MIN_COUNT) {
    nextCount = VISITOR_MIN_COUNT + (Math.floor(randomFn() * 12) + 2);
    direction = 1;
  }

  nextCount = Math.max(VISITOR_MIN_COUNT, Math.min(VISITOR_MAX_COUNT, nextCount));

  if (nextCount === current) {
    nextCount =
      current + direction <= VISITOR_MAX_COUNT && current + direction >= VISITOR_MIN_COUNT
        ? current + direction * (Math.floor(randomFn() * 8) + 4)
        : current - direction * (Math.floor(randomFn() * 8) + 4);
    nextCount = Math.max(VISITOR_MIN_COUNT, Math.min(VISITOR_MAX_COUNT, nextCount));
  }

  return {
    nextCount,
    nextState: { direction, stepsRemaining },
  };
}

export const LiveActivityCounter: React.FC<LiveActivityCounterProps> = ({ className = '' }) => {
  const MIN_COUNT = VISITOR_MIN_COUNT;
  const MAX_COUNT = VISITOR_MAX_COUNT;

  // On page load, initialize within a natural middle range inside [100, 679]
  const [initialCount] = useState<number>(() => {
    return Math.floor(Math.random() * (360 - 190 + 1)) + 190;
  });

  const [targetCount, setTargetCount] = useState<number>(initialCount);
  const [displayCount, setDisplayCount] = useState<number>(initialCount);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const displayCountRef = useRef<number>(initialCount);
  const waveStateRef = useRef<VisitorWaveState>({
    direction: Math.random() < 0.65 ? 1 : -1,
    stepsRemaining: Math.floor(Math.random() * 3) + 2,
  });

  // Smooth ease-out cubic interpolation towards targetCount
  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayCountRef.current;
    const duration = 800; // ms

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Smooth ease-out cubic curve for organic number rolling
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (targetCount - startValue) * easeProgress);

      // Strict boundary enforcement [100, 679]
      const clamped = Math.max(MIN_COUNT, Math.min(MAX_COUNT, current));
      displayCountRef.current = clamped;
      setDisplayCount(clamped);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateCount);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateCount);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [targetCount, MIN_COUNT, MAX_COUNT]);

  // Natural variable fluctuation with random intervals (no fixed or repeating pattern)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let pulseTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextUpdate = () => {
      const minInterval = 3500;
      const maxInterval = 13500;
      const delay = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;

      timeoutId = setTimeout(() => {
        setTargetCount((prev) => {
          const { nextCount, nextState } = computeNextVisitorCount(prev, waveStateRef.current);
          waveStateRef.current = nextState;
          return nextCount;
        });

        // Trigger subtle neon pulse glow
        setIsPulsing(true);
        if (pulseTimeoutId) clearTimeout(pulseTimeoutId);
        pulseTimeoutId = setTimeout(() => setIsPulsing(false), 800);

        scheduleNextUpdate();
      }, delay);
    };

    scheduleNextUpdate();

    return () => {
      clearTimeout(timeoutId);
      if (pulseTimeoutId) clearTimeout(pulseTimeoutId);
    };
  }, []);

  return (
    <div
      aria-label="Visitors active counter"
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-zinc-800 hover:border-[#00FF66]/40 transition-colors shadow-sm select-none ${className}`}
    >
      {/* Small glowing green beacon */}
      <span className="relative flex h-2 w-2 items-center justify-center shrink-0" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
      </span>

      {/* Active visitors counter and label */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm">
        <span className="font-cyber font-bold tracking-wide">
          <span
            className={`text-[#00FF66] drop-shadow-[0_0_8px_rgba(0,255,102,0.6)] transition-all duration-300 inline-block tabular-nums ${
              isPulsing ? 'scale-105 drop-shadow-[0_0_14px_rgba(0,255,102,0.95)]' : ''
            }`}
          >
            {displayCount.toLocaleString()}
          </span>
        </span>
        <span className="text-[9px] sm:text-[10px] font-mono-code text-[#00FF66] uppercase tracking-wider border-l border-zinc-800 pl-1.5">
          VISITORS ACTIVE
        </span>
      </div>
    </div>
  );
};
