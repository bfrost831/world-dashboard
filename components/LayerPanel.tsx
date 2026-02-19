"use client";

import { useState } from "react";

interface LayerPanelProps {
  earthquakesVisible: boolean;
  onToggleEarthquakes: () => void;
  eventCount: number;
  minMagnitude: number;
  onMinMagnitudeChange: (value: number) => void;
  disastersVisible: boolean;
  onToggleDisasters: () => void;
  disasterCount: number;
  newsVisible: boolean;
  onToggleNews: () => void;
  newsCount: number;
  newsTimespan: string;
  onNewsTimespanChange: (value: string) => void;
  conflictsVisible: boolean;
  onToggleConflicts: () => void;
  conflictCount: number;
  conflictTypeFilter: string[];
  onConflictTypeFilterChange: (value: string[]) => void;
  allConflictTypes: string[];
  firesVisible: boolean;
  onToggleFires: () => void;
  fireCount: number;
  fireConfidenceFilter: string;
  onFireConfidenceFilterChange: (value: string) => void;
  fireIntensity: number;
  onFireIntensityChange: (value: number) => void;
}

const MAGNITUDE_STEPS = [4.5, 5.0, 5.5, 6.0, 6.5, 7.0];
const TIMESPAN_OPTIONS = [
  { label: "1h", value: "1h" },
  { label: "6h", value: "6h" },
  { label: "24h", value: "24h" },
  { label: "48h", value: "48h" },
];

export default function LayerPanel(props: LayerPanelProps) {
  return (
    <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md rounded-lg p-4 min-w-[220px] border border-white/10 space-y-2">
      <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
        Layers
      </h3>
      <EarthquakeLayer
        visible={props.earthquakesVisible}
        onToggle={props.onToggleEarthquakes}
        eventCount={props.eventCount}
        minMagnitude={props.minMagnitude}
        onMinMagnitudeChange={props.onMinMagnitudeChange}
      />
      <DisasterLayer
        visible={props.disastersVisible}
        onToggle={props.onToggleDisasters}
        eventCount={props.disasterCount}
      />
      <NewsLayer
        visible={props.newsVisible}
        onToggle={props.onToggleNews}
        eventCount={props.newsCount}
        timespan={props.newsTimespan}
        onTimespanChange={props.onNewsTimespanChange}
      />
      <ConflictLayer
        visible={props.conflictsVisible}
        onToggle={props.onToggleConflicts}
        eventCount={props.conflictCount}
        typeFilter={props.conflictTypeFilter}
        onTypeFilterChange={props.onConflictTypeFilterChange}
        allTypes={props.allConflictTypes}
      />
      <FireLayer
        visible={props.firesVisible}
        onToggle={props.onToggleFires}
        eventCount={props.fireCount}
        confidenceFilter={props.fireConfidenceFilter}
        onConfidenceFilterChange={props.onFireConfidenceFilterChange}
        intensity={props.fireIntensity}
        onIntensityChange={props.onFireIntensityChange}
      />
    </div>
  );
}

function LayerToggle({
  visible, onToggle, label, eventCount, accentColor, children, defaultExpanded = false,
}: {
  visible: boolean; onToggle: () => void; label: string; eventCount: number;
  accentColor: string; children?: React.ReactNode; defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-white/80">
        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors flex-1">
          <input type="checkbox" checked={visible} onChange={onToggle} className={accentColor} />
          {label}
          <span className="ml-auto text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/50">
            {eventCount}
          </span>
        </label>
        {visible && children ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-white/30 hover:text-white/60 transition-colors text-base px-1 w-5 text-center"
            title={expanded ? "Collapse" : "Expand settings"}
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-5" />
        )}
      </div>
      {visible && expanded && children && (
        <div className="mt-3 pl-6">{children}</div>
      )}
    </div>
  );
}

function EarthquakeLayer({ visible, onToggle, eventCount, minMagnitude, onMinMagnitudeChange }: {
  visible: boolean; onToggle: () => void; eventCount: number;
  minMagnitude: number; onMinMagnitudeChange: (v: number) => void;
}) {
  return (
    <LayerToggle visible={visible} onToggle={onToggle} label="Earthquakes" eventCount={eventCount} accentColor="accent-orange-500">
      <div className="flex items-center justify-between text-xs text-white/50 mb-1">
        <span>Min magnitude</span>
        <span className="text-orange-400 font-mono">M{minMagnitude.toFixed(1)}</span>
      </div>
      <input
        type="range" min={0} max={MAGNITUDE_STEPS.length - 1} step={1}
        value={MAGNITUDE_STEPS.indexOf(minMagnitude)}
        onChange={(e) => onMinMagnitudeChange(MAGNITUDE_STEPS[parseInt(e.target.value)])}
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500"
      />
      <div className="flex justify-between text-[10px] text-white/30 mt-0.5">
        <span>4.5</span><span>7.0</span>
      </div>
    </LayerToggle>
  );
}

function DisasterLayer({ visible, onToggle, eventCount }: {
  visible: boolean; onToggle: () => void; eventCount: number;
}) {
  return (
    <LayerToggle visible={visible} onToggle={onToggle} label="Disasters" eventCount={eventCount} accentColor="accent-green-500" />
  );
}

function NewsLayer({ visible, onToggle, eventCount, timespan, onTimespanChange }: {
  visible: boolean; onToggle: () => void; eventCount: number;
  timespan: string; onTimespanChange: (v: string) => void;
}) {
  return (
    <LayerToggle visible={visible} onToggle={onToggle} label="News" eventCount={eventCount} accentColor="accent-cyan-500">
      <div className="text-xs text-white/50 mb-1">Timespan</div>
      <div className="flex gap-1">
        {TIMESPAN_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onTimespanChange(opt.value)}
            className={`text-[10px] px-2 py-0.5 rounded ${
              timespan === opt.value
                ? "bg-cyan-500/30 text-cyan-300"
                : "bg-white/5 text-white/40 hover:text-white/60"
            } transition-colors`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </LayerToggle>
  );
}

function ConflictLayer({ visible, onToggle, eventCount, typeFilter, onTypeFilterChange, allTypes }: {
  visible: boolean; onToggle: () => void; eventCount: number;
  typeFilter: string[]; onTypeFilterChange: (v: string[]) => void; allTypes: string[];
}) {
  const toggle = (t: string) => {
    if (typeFilter.includes(t)) {
      onTypeFilterChange(typeFilter.filter((x) => x !== t));
    } else {
      onTypeFilterChange([...typeFilter, t]);
    }
  };

  const shortLabels: Record<string, string> = {
    "Battles": "Battles",
    "Explosions/Remote violence": "Explosions",
    "Violence against civilians": "Violence",
    "Protests": "Protests",
    "Riots": "Riots",
    "Strategic developments": "Strategic",
  };

  return (
    <LayerToggle visible={visible} onToggle={onToggle} label="Conflicts" eventCount={eventCount} accentColor="accent-yellow-500">
      <div className="space-y-1">
        {allTypes.map((t) => (
          <label key={t} className="flex items-center gap-2 text-[11px] text-white/60 cursor-pointer hover:text-white/80">
            <input
              type="checkbox"
              checked={typeFilter.includes(t)}
              onChange={() => toggle(t)}
              className="accent-yellow-500 scale-90"
            />
            {shortLabels[t] || t}
          </label>
        ))}
      </div>
    </LayerToggle>
  );
}

const CONFIDENCE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Nominal+", value: "nominal" },
  { label: "High only", value: "high" },
];

function FireLayer({ visible, onToggle, eventCount, confidenceFilter, onConfidenceFilterChange, intensity, onIntensityChange }: {
  visible: boolean; onToggle: () => void; eventCount: number;
  confidenceFilter: string; onConfidenceFilterChange: (v: string) => void;
  intensity: number; onIntensityChange: (v: number) => void;
}) {
  return (
    <LayerToggle visible={visible} onToggle={onToggle} label="🔥 Wildfires" eventCount={eventCount} accentColor="accent-red-500">
      <div className="text-xs text-white/50 mb-1">Confidence</div>
      <div className="flex gap-1 mb-3">
        {CONFIDENCE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onConfidenceFilterChange(opt.value)}
            className={`text-[10px] px-2 py-0.5 rounded ${
              confidenceFilter === opt.value
                ? "bg-red-500/30 text-red-300"
                : "bg-white/5 text-white/40 hover:text-white/60"
            } transition-colors`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-white/50 mb-1">
        <span>Intensity</span>
        <span className="text-red-400 font-mono">{intensity.toFixed(1)}</span>
      </div>
      <input
        type="range" min={5} max={30} step={1}
        value={intensity * 10}
        onChange={(e) => onIntensityChange(parseInt(e.target.value) / 10)}
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-red-500"
      />
      <div className="flex justify-between text-[10px] text-white/30 mt-0.5">
        <span>0.5</span><span>3.0</span>
      </div>
    </LayerToggle>
  );
}
