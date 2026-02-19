"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GeoEvent, DisasterEvent, NewsEvent, ConflictEvent, FireDetection } from "@/lib/types";

let maplibregl: any = null;
let DeckOverlay: any = null;
let ScatterplotLayer: any = null;
let HeatmapLayer: any = null;

function magnitudeToColor(mag: number): [number, number, number, number] {
  const t = Math.min(Math.max((mag - 4.5) / 4, 0), 1);
  return [255, Math.round(255 * (1 - t * 0.7)), Math.round(80 * (1 - t)), 200];
}

function magnitudeToRadius(mag: number): number {
  return Math.pow(2, mag) * 100;
}

function disasterAlertColor(level: string): [number, number, number, number] {
  switch (level) {
    case "Red": return [239, 68, 68, 220];
    case "Orange": return [249, 115, 22, 200];
    default: return [34, 197, 94, 180];
  }
}

function disasterAlertRadius(level: string): number {
  switch (level) {
    case "Red": return 60000;
    case "Orange": return 40000;
    default: return 25000;
  }
}

function conflictColor(eventType: string): [number, number, number, number] {
  if (["Battles", "Explosions/Remote violence", "Violence against civilians"].includes(eventType)) {
    return [239, 68, 68, 180];
  }
  if (["Protests", "Riots"].includes(eventType)) {
    return [234, 179, 8, 180];
  }
  return [148, 163, 184, 160];
}

function conflictRadius(fatalities: number): number {
  if (fatalities === 0) return 8000;
  return 8000 + Math.sqrt(fatalities) * 6000;
}

type TooltipData = {
  x: number;
  y: number;
  content: { label: string; value: string }[];
  color: string;
};

interface GlobeProps {
  earthquakes: GeoEvent[];
  earthquakesVisible: boolean;
  disasters: DisasterEvent[];
  disastersVisible: boolean;
  news: NewsEvent[];
  newsVisible: boolean;
  conflicts: ConflictEvent[];
  conflictsVisible: boolean;
  conflictTypeFilter: string[];
  fires: FireDetection[];
  firesVisible: boolean;
  fireIntensity: number;
}

export default function Globe({
  earthquakes, earthquakesVisible,
  disasters, disastersVisible,
  news, newsVisible,
  conflicts, conflictsVisible,
  conflictTypeFilter,
  fires, firesVisible, fireIntensity,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const deckRef = useRef<any>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const mgl = await import("maplibre-gl");
      const deckMapbox = await import("@deck.gl/mapbox");
      const deckLayers = await import("@deck.gl/layers");
      const deckAgg = await import("@deck.gl/aggregation-layers");
      maplibregl = mgl.default || mgl;
      DeckOverlay = deckMapbox.MapboxOverlay;
      ScatterplotLayer = deckLayers.ScatterplotLayer;
      HeatmapLayer = deckAgg.HeatmapLayer;
      if (cancelled || !containerRef.current) return;
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [0, 20],
        zoom: 1.5,
        projection: "globe" as any,
        attributionControl: false,
      });
      const overlay = new DeckOverlay({ layers: [] });
      map.addControl(overlay);
      mapRef.current = map;
      deckRef.current = overlay;
      map.on("load", () => { if (!cancelled) setLoaded(true); });
    }
    init();
    return () => { cancelled = true; mapRef.current?.remove(); };
  }, []);

  useEffect(() => {
    if (!loaded || !deckRef.current || !ScatterplotLayer) return;

    const layers: any[] = [];

    if (firesVisible && HeatmapLayer && fires.length > 0) {
      layers.push(new HeatmapLayer({
        id: "fires-heatmap",
        data: fires,
        getPosition: (d: FireDetection) => [d.longitude, d.latitude],
        getWeight: (d: FireDetection) => d.frp || 1,
        radiusPixels: 30,
        intensity: fireIntensity,
        threshold: 0.1,
        opacity: 0.7,
        colorRange: [
          [255, 255, 178],
          [254, 204, 92],
          [253, 141, 60],
          [240, 59, 32],
          [189, 0, 38],
        ],
      }));
    }

    if (newsVisible) {
      layers.push(new ScatterplotLayer({
        id: "news",
        data: news,
        getPosition: (d: NewsEvent) => [d.longitude, d.latitude],
        getRadius: 5000,
        getFillColor: [56, 189, 248, 140] as [number, number, number, number],
        radiusMinPixels: 2,
        radiusMaxPixels: 5,
        pickable: true,
        onHover: (info: any) => {
          if (info.object) {
            const d = info.object as NewsEvent;
            setTooltip({
              x: info.x, y: info.y, color: "text-cyan-400",
              content: [
                { label: "", value: d.title || "News event" },
                { label: "Source", value: d.source },
                { label: "Date", value: new Date(d.time).toLocaleString() },
                { label: "Tone", value: d.tone.toFixed(1) },
              ],
            });
          } else setTooltip(null);
        },
      }));
    }

    if (conflictsVisible) {
      const filtered = conflicts.filter(c => conflictTypeFilter.includes(c.eventType));
      layers.push(new ScatterplotLayer({
        id: "conflicts",
        data: filtered,
        getPosition: (d: ConflictEvent) => [d.longitude, d.latitude],
        getRadius: (d: ConflictEvent) => conflictRadius(d.fatalities),
        getFillColor: (d: ConflictEvent) => conflictColor(d.eventType),
        radiusMinPixels: 3,
        radiusMaxPixels: 20,
        pickable: true,
        onHover: (info: any) => {
          if (info.object) {
            const d = info.object as ConflictEvent;
            setTooltip({
              x: info.x, y: info.y, color: "text-yellow-400",
              content: [
                { label: "", value: d.eventType },
                { label: "Sub-type", value: d.subEventType },
                { label: "Country", value: d.country },
                { label: "Date", value: new Date(d.time).toLocaleString() },
                { label: "Fatalities", value: String(d.fatalities) },
                { label: "Notes", value: d.notes.length > 120 ? d.notes.slice(0, 120) + "…" : d.notes },
              ],
            });
          } else setTooltip(null);
        },
        transitions: { getRadius: 300 },
      }));
    }

    if (earthquakesVisible) {
      layers.push(new ScatterplotLayer({
        id: "earthquakes",
        data: earthquakes,
        getPosition: (d: GeoEvent) => [d.longitude, d.latitude],
        getRadius: (d: GeoEvent) => magnitudeToRadius(d.magnitude),
        getFillColor: (d: GeoEvent) => magnitudeToColor(d.magnitude),
        radiusMinPixels: 3,
        radiusMaxPixels: 40,
        pickable: true,
        onHover: (info: any) => {
          if (info.object) {
            const d = info.object as GeoEvent;
            setTooltip({
              x: info.x, y: info.y, color: "text-orange-400",
              content: [
                { label: "", value: `M${d.magnitude.toFixed(1)}` },
                { label: "", value: d.place },
                { label: "", value: new Date(d.time).toLocaleString() },
              ],
            });
          } else setTooltip(null);
        },
        transitions: { getRadius: 300, getFillColor: 300 },
      }));
    }

    if (disastersVisible) {
      layers.push(new ScatterplotLayer({
        id: "disasters",
        data: disasters,
        getPosition: (d: DisasterEvent) => [d.longitude, d.latitude],
        getRadius: (d: DisasterEvent) => disasterAlertRadius(d.alertLevel),
        getFillColor: (d: DisasterEvent) => disasterAlertColor(d.alertLevel),
        radiusMinPixels: 5,
        radiusMaxPixels: 30,
        pickable: true,
        onHover: (info: any) => {
          if (info.object) {
            const d = info.object as DisasterEvent;
            const typeLabels: Record<string, string> = { TC: "Cyclone", FL: "Flood", VO: "Volcano", DR: "Drought", WF: "Wildfire" };
            setTooltip({
              x: info.x, y: info.y, color: d.alertLevel === "Red" ? "text-red-400" : d.alertLevel === "Orange" ? "text-orange-400" : "text-green-400",
              content: [
                { label: "", value: typeLabels[d.type] || d.type },
                { label: "Alert", value: d.alertLevel },
                { label: "", value: d.title },
                { label: "", value: new Date(d.time).toLocaleString() },
              ],
            });
          } else setTooltip(null);
        },
        transitions: { getRadius: 300 },
      }));
    }

    deckRef.current.setProps({ layers });
  }, [earthquakes, earthquakesVisible, disasters, disastersVisible, news, newsVisible, conflicts, conflictsVisible, conflictTypeFilter, fires, firesVisible, fireIntensity, loaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-2 border border-white/10 max-w-[280px]"
          style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
        >
          {tooltip.content.map((row, i) => (
            <div key={i} className={i === 0 ? `font-semibold ${tooltip.color}` : "text-white/70 mt-0.5"}>
              {row.label ? <span className="text-white/40">{row.label}: </span> : null}
              {row.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
