"use client";

import { useState } from "react";

interface LayerPanelProps {
  earthquakesVisible: boolean;
  onToggleEarthquakes: () => void;
  eventCount: number;
  minMagnitude: number;
  onMinMagnitudeChange: (value: number) => void;
}

const MAGNITUDE_STEPS = [4.5, 5.0, 5.5, 6.0, 6.5, 7.0];

export default function LayerPanel({
  earthquakesVisible,
  onToggleEarthquakes,
  eventCount,
  minMagnitude,
  onMinMagnitudeChange,
}: LayerPanelProps) {
  return (
    <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md rounded-lg p-4 min-w-[200px] border border-white/10">
      <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
        Layers
      </h3>
      <EarthquakeLayer
        visible={earthquakesVisible}
        onToggle={onToggleEarthquakes}
        eventCount={eventCount}
        minMagnitude={minMagnitude}
        onMinMagnitudeChange={onMinMagnitudeChange}
      />
    </div>
  );
}

function EarthquakeLayer({
  visible,
  onToggle,
  eventCount,
  minMagnitude,
  onMinMagnitudeChange,
}: {
  visible: boolean;
  onToggle: () => void;
  eventCount: number;
  minMagnitude: number;
  onMinMagnitudeChange: (v: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-white/80">
        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors flex-1">
          <input
            type="checkbox"
            checked={visible}
            onChange={onToggle}
            className="accent-orange-500"
          />
          Earthquakes
          <span className="ml-auto text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/50">
            {eventCount}
          </span>
        </label>
        {visible && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-white/30 hover:text-white/60 transition-colors text-base px-1"
            title={expanded ? "Collapse" : "Expand settings"}
          >
            {expanded ? "▾" : "▸"}
          </button>
        )}
      </div>
      {visible && expanded && (
        <div className="mt-3 pl-6">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1">
            <span>Min magnitude</span>
            <span className="text-orange-400 font-mono">M{minMagnitude.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={MAGNITUDE_STEPS.length - 1}
            step={1}
            value={MAGNITUDE_STEPS.indexOf(minMagnitude)}
            onChange={(e) => onMinMagnitudeChange(MAGNITUDE_STEPS[parseInt(e.target.value)])}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-[10px] text-white/30 mt-0.5">
            <span>4.5</span>
            <span>7.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
