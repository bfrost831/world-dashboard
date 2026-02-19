"use client";

interface LayerPanelProps {
  earthquakesVisible: boolean;
  onToggleEarthquakes: () => void;
  eventCount: number;
}

export default function LayerPanel({
  earthquakesVisible,
  onToggleEarthquakes,
  eventCount,
}: LayerPanelProps) {
  return (
    <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md rounded-lg p-4 min-w-[180px] border border-white/10">
      <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3">
        Layers
      </h3>
      <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80 hover:text-white transition-colors">
        <input
          type="checkbox"
          checked={earthquakesVisible}
          onChange={onToggleEarthquakes}
          className="accent-orange-500"
        />
        Earthquakes
        <span className="ml-auto text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/50">
          {eventCount}
        </span>
      </label>
    </div>
  );
}
