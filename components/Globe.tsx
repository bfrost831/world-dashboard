"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GeoEvent } from "@/lib/types";

// Dynamically import to avoid SSR issues
let maplibregl: any = null;
let DeckOverlay: any = null;
let ScatterplotLayer: any = null;

function magnitudeToColor(mag: number): [number, number, number, number] {
  const t = Math.min(Math.max((mag - 4.5) / 4, 0), 1);
  return [
    255,
    Math.round(255 * (1 - t * 0.7)),
    Math.round(80 * (1 - t)),
    200,
  ];
}

function magnitudeToRadius(mag: number): number {
  return Math.pow(2, mag) * 100;
}

interface GlobeProps {
  earthquakes: GeoEvent[];
  earthquakesVisible: boolean;
}

export default function Globe({ earthquakes, earthquakesVisible }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const deckRef = useRef<any>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    event: GeoEvent;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const mgl = await import("maplibre-gl");
      const deckMapbox = await import("@deck.gl/mapbox");
      const deckLayers = await import("@deck.gl/layers");

      maplibregl = mgl.default || mgl;
      DeckOverlay = deckMapbox.MapboxOverlay;
      ScatterplotLayer = deckLayers.ScatterplotLayer;

      if (cancelled || !containerRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style:
          "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [0, 20],
        zoom: 1.5,
        projection: "globe" as any,
        attributionControl: false,
      });

      const overlay = new DeckOverlay({ layers: [] });
      map.addControl(overlay);

      mapRef.current = map;
      deckRef.current = overlay;

      map.on("load", () => {
        if (!cancelled) setLoaded(true);
      });
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
    };
  }, []);

  // Update layers
  useEffect(() => {
    if (!loaded || !deckRef.current || !ScatterplotLayer) return;

    const layers = earthquakesVisible
      ? [
          new ScatterplotLayer({
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
                setTooltip({
                  x: info.x,
                  y: info.y,
                  event: info.object,
                });
              } else {
                setTooltip(null);
              }
            },
            transitions: { getRadius: 300, getFillColor: 300 },
          }),
        ]
      : [];

    deckRef.current.setProps({ layers });
  }, [earthquakes, earthquakesVisible, loaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-2 border border-white/10 max-w-[250px]"
          style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
        >
          <div className="font-semibold text-orange-400">
            M{tooltip.event.magnitude.toFixed(1)}
          </div>
          <div className="text-white/70 mt-0.5">{tooltip.event.place}</div>
          <div className="text-white/40 mt-0.5">
            {new Date(tooltip.event.time).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
