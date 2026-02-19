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
  disasterAlertFilter: string[];
  onDisasterAlertFilterChange: (value: string[]) => void;
  disasterTypeFilter: string[];
  onDisasterTypeFilterChange: (value: string[]) => void;
  firesVisible: boolean;
  onToggleFires: () => void;
  fireCount: number;
  fireConfidenceFilter: string;
  onFireConfidenceFilterChange: (value: string) => void;
  fireIntensity: number;
  onFireIntensityChange: (value: number) => void;
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
}

const MAGNITUDE_STEPS = [4.5, 5.0, 5.5, 6.0, 6.5, 7.0];
const TIMESPAN_OPTIONS = [
  { label: "1h", value: "1h" },
  { label: "6h", value: "6h" },
  { label: "24h", value: "24h" },
  { label: "48h", value: "48h" },
];
const CONFIDENCE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Nominal+", value: "nominal" },
  { label: "High only", value: "high" },
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
      <DisasterGroup
        disastersVisible={props.disastersVisible}
        onToggleDisasters={props.onToggleDisasters}
        disasterCount={props.disasterCount}
        alertFilter={props.disasterAlertFilter}
        onAlertFilterChange={props.onDisasterAlertFilterChange}
        disasterTypeFilter={props.disasterTypeFilter}
        onDisasterTypeFilterChange={props.onDisasterTypeFilterChange}
        firesVisible={props.firesVisible}
        onToggleFires={props.onToggleFires}
        fireCount={props.fireCount}
        fireConfidenceFilter={props.fireConfidenceFilter}
        onFireConfidenceFilterChange={props.onFireConfidenceFilterChange}
        fireIntensity={props.fireIntensity}
        onFireIntensityChange={props.onFireIntensityChange}
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
    </div>
  );
}

/* ── Reusable toggle ── */

function LayerToggle({
  visible, onToggle, label, eventCount, accentColor, children,
}: {
  visible: boolean; onToggle: () => void; label: string; eventCount: number;
  accentColor: string; children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
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
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-5" />
        )}
      </div>
      {visible && expanded && children && (
        <div className="mt-2 pl-6">{children}</div>
      )}
    </div>
  );
}

/* ── Earthquake ── */

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

/* ── Disasters (parent group with sub-layers) ── */

function DisasterGroup({
  disastersVisible, onToggleDisasters, disasterCount,
  alertFilter, onAlertFilterChange,
  disasterTypeFilter, onDisasterTypeFilterChange,
  firesVisible, onToggleFires, fireCount,
  fireConfidenceFilter, onFireConfidenceFilterChange,
  fireIntensity, onFireIntensityChange,
}: {
  disastersVisible: boolean; onToggleDisasters: () => void; disasterCount: number;
  alertFilter: string[]; onAlertFilterChange: (v: string[]) => void;
  disasterTypeFilter: string[]; onDisasterTypeFilterChange: (v: string[]) => void;
  firesVisible: boolean; onToggleFires: () => void; fireCount: number;
  fireConfidenceFilter: string; onFireConfidenceFilterChange: (v: string) => void;
  fireIntensity: number; onFireIntensityChange: (v: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalCount = disasterCount + fireCount;
  const anyVisible = disastersVisible || firesVisible;

  const toggleAll = () => {
    if (anyVisible) {
      onToggleDisasters();
      if (firesVisible) onToggleFires();
    } else {
      if (!disastersVisible) onToggleDisasters();
      if (!firesVisible) onToggleFires();
    }
  };

  return (
    <div>
      {/* Group header */}
      <div className="flex items-center gap-2 text-sm text-white/80">
        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors flex-1">
          <input type="checkbox" checked={anyVisible} onChange={toggleAll} className="accent-green-500" />
          Disasters
          <span className="ml-auto text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/50">
            {totalCount}
          </span>
        </label>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-white/30 hover:text-white/60 transition-colors text-base px-1 w-5 text-center"
        >
          {expanded ? "▾" : "▸"}
        </button>
      </div>

      {/* Sub-layers */}
      {expanded && (
        <div className="mt-2 pl-4 space-y-2 border-l border-white/5 ml-2">
          {/* GDACS Alerts sub-layer */}
          <GdacsSublayer
            visible={disastersVisible}
            onToggle={onToggleDisasters}
            count={disasterCount}
            alertFilter={alertFilter}
            onAlertFilterChange={onAlertFilterChange}
            typeFilter={disasterTypeFilter}
            onTypeFilterChange={onDisasterTypeFilterChange}
          />

          {/* Wildfires sub-layer */}
          <WildfireSublayer
            visible={firesVisible}
            onToggle={onToggleFires}
            count={fireCount}
            confidenceFilter={fireConfidenceFilter}
            onConfidenceFilterChange={onFireConfidenceFilterChange}
            intensity={fireIntensity}
            onIntensityChange={onFireIntensityChange}
          />
        </div>
      )}
    </div>
  );
}

const ALERT_LEVELS = ["Green", "Orange", "Red"];
const DISASTER_TYPES = [
  { code: "TC", label: "Cyclones" },
  { code: "FL", label: "Floods" },
  { code: "VO", label: "Volcanoes" },
  { code: "DR", label: "Droughts" },
  { code: "WF", label: "Wildfires" },
];
const ALERT_COLORS: Record<string, string> = {
  Green: "bg-green-500",
  Orange: "bg-orange-500",
  Red: "bg-red-500",
};

function GdacsSublayer({
  visible, onToggle, count,
  alertFilter, onAlertFilterChange,
  typeFilter, onTypeFilterChange,
}: {
  visible: boolean; onToggle: () => void; count: number;
  alertFilter: string[]; onAlertFilterChange: (v: string[]) => void;
  typeFilter: string[]; onTypeFilterChange: (v: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const toggleAlert = (level: string) => {
    if (alertFilter.includes(level)) {
      onAlertFilterChange(alertFilter.filter((x) => x !== level));
    } else {
      onAlertFilterChange([...alertFilter, level]);
    }
  };

  const toggleType = (code: string) => {
    if (typeFilter.includes(code)) {
      onTypeFilterChange(typeFilter.filter((x) => x !== code));
    } else {
      onTypeFilterChange([...typeFilter, code]);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-white/60">
        <label className="flex items-center gap-2 cursor-pointer hover:text-white/80 flex-1">
          <input type="checkbox" checked={visible} onChange={onToggle} className="accent-green-500 scale-90" />
          Alerts (GDACS)
          <span className="ml-auto text-[10px] bg-white/10 rounded-full px-1.5 py-0.5 text-white/40">
            {count}
          </span>
        </label>
        {visible ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-white/30 hover:text-white/60 transition-colors text-xs px-1 w-4 text-center"
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4" />
        )}
      </div>
      {visible && expanded && (
        <div className="mt-2 pl-5 space-y-2">
          <div>
            <div className="text-[10px] text-white/40 mb-1">Alert level</div>
            <div className="flex gap-1">
              {ALERT_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleAlert(level)}
                  className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                    alertFilter.includes(level)
                      ? "bg-white/10 text-white/80"
                      : "bg-white/5 text-white/30"
                  } transition-colors`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${ALERT_COLORS[level]}`} />
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 mb-1">Event type</div>
            <div className="space-y-0.5">
              {DISASTER_TYPES.map(({ code, label }) => (
                <label key={code} className="flex items-center gap-2 text-[10px] text-white/50 cursor-pointer hover:text-white/70">
                  <input
                    type="checkbox"
                    checked={typeFilter.includes(code)}
                    onChange={() => toggleType(code)}
                    className="accent-green-500 scale-75"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WildfireSublayer({
  visible, onToggle, count,
  confidenceFilter, onConfidenceFilterChange,
  intensity, onIntensityChange,
}: {
  visible: boolean; onToggle: () => void; count: number;
  confidenceFilter: string; onConfidenceFilterChange: (v: string) => void;
  intensity: number; onIntensityChange: (v: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-white/60">
        <label className="flex items-center gap-2 cursor-pointer hover:text-white/80 flex-1">
          <input type="checkbox" checked={visible} onChange={onToggle} className="accent-red-500 scale-90" />
          🔥 Wildfires
          <span className="ml-auto text-[10px] bg-white/10 rounded-full px-1.5 py-0.5 text-white/40">
            {count}
          </span>
        </label>
        {visible ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-white/30 hover:text-white/60 transition-colors text-xs px-1 w-4 text-center"
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4" />
        )}
      </div>
      {visible && expanded && (
        <div className="mt-2 pl-5">
          <div className="text-[10px] text-white/40 mb-1">Confidence</div>
          <div className="flex gap-1 mb-2">
            {CONFIDENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onConfidenceFilterChange(opt.value)}
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  confidenceFilter === opt.value
                    ? "bg-red-500/30 text-red-300"
                    : "bg-white/5 text-white/40 hover:text-white/60"
                } transition-colors`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
            <span>Intensity</span>
            <span className="text-red-400 font-mono">{intensity.toFixed(1)}</span>
          </div>
          <input
            type="range" min={5} max={30} step={1}
            value={intensity * 10}
            onChange={(e) => onIntensityChange(parseInt(e.target.value) / 10)}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-red-500"
          />
        </div>
      )}
    </div>
  );
}

/* ── News ── */

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

/* ── Conflicts ── */

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
