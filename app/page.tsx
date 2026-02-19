"use client";

import { useState, useEffect, useCallback } from "react";
import { GeoEvent } from "@/lib/types";
import { fetchEarthquakes } from "@/lib/fetchers/usgs";
import LayerPanel from "@/components/LayerPanel";
import nextDynamic from "next/dynamic";

const Globe = nextDynamic(() => import("@/components/Globe"), { ssr: false });

const REFRESH_INTERVAL = 5 * 60 * 1000;

export default function Home() {
  const [earthquakes, setEarthquakes] = useState<GeoEvent[]>([]);
  const [earthquakesVisible, setEarthquakesVisible] = useState(true);
  const [minMagnitude, setMinMagnitude] = useState(6.0);

  const filteredEarthquakes = earthquakes.filter(
    (e) => e.magnitude >= minMagnitude
  );

  const loadData = useCallback(async () => {
    try {
      const data = await fetchEarthquakes(window.location.origin);
      setEarthquakes(data);
    } catch (e) {
      console.error("Failed to fetch earthquakes:", e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <Globe
        earthquakes={filteredEarthquakes}
        earthquakesVisible={earthquakesVisible}
      />

      {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-lg font-light tracking-widest text-white/30 uppercase">
          World Dashboard
        </h1>
      </div>

      {/* Layer panel */}
      <LayerPanel
        earthquakesVisible={earthquakesVisible}
        onToggleEarthquakes={() => setEarthquakesVisible((v) => !v)}
        eventCount={filteredEarthquakes.length}
        minMagnitude={minMagnitude}
        onMinMagnitudeChange={setMinMagnitude}
      />
    </main>
  );
}
