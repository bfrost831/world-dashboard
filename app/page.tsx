"use client";

import { useState, useEffect, useCallback } from "react";
import { GeoEvent, DisasterEvent, NewsEvent, ConflictEvent } from "@/lib/types";
import { fetchEarthquakes } from "@/lib/fetchers/usgs";
import { fetchDisasters } from "@/lib/fetchers/gdacs";
import { fetchNews } from "@/lib/fetchers/gdelt";
import { fetchConflicts } from "@/lib/fetchers/acled";
import LayerPanel from "@/components/LayerPanel";
import nextDynamic from "next/dynamic";

const Globe = nextDynamic(() => import("@/components/Globe"), { ssr: false });

const REFRESH_FAST = 5 * 60 * 1000;
const REFRESH_15M = 15 * 60 * 1000;
const REFRESH_1H = 60 * 60 * 1000;

const ALL_CONFLICT_TYPES = [
  "Battles",
  "Explosions/Remote violence",
  "Violence against civilians",
  "Protests",
  "Riots",
  "Strategic developments",
];

export default function Home() {
  const [earthquakes, setEarthquakes] = useState<GeoEvent[]>([]);
  const [earthquakesVisible, setEarthquakesVisible] = useState(true);
  const [minMagnitude, setMinMagnitude] = useState(6.0);

  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [disastersVisible, setDisastersVisible] = useState(true);

  const [news, setNews] = useState<NewsEvent[]>([]);
  const [newsVisible, setNewsVisible] = useState(true);
  const [newsTimespan, setNewsTimespan] = useState("24h");

  const [conflicts, setConflicts] = useState<ConflictEvent[]>([]);
  const [conflictsVisible, setConflictsVisible] = useState(true);
  const [conflictTypeFilter, setConflictTypeFilter] = useState<string[]>([...ALL_CONFLICT_TYPES]);

  const filteredEarthquakes = earthquakes.filter((e) => e.magnitude >= minMagnitude);

  const loadEarthquakes = useCallback(async () => {
    try {
      setEarthquakes(await fetchEarthquakes(window.location.origin));
    } catch (e) { console.error("Failed to fetch earthquakes:", e); }
  }, []);

  const loadDisasters = useCallback(async () => {
    try {
      setDisasters(await fetchDisasters(window.location.origin));
    } catch (e) { console.error("Failed to fetch disasters:", e); }
  }, []);

  const loadNews = useCallback(async () => {
    try {
      setNews(await fetchNews(window.location.origin, newsTimespan));
    } catch (e) { console.error("Failed to fetch news:", e); }
  }, [newsTimespan]);

  const loadConflicts = useCallback(async () => {
    try {
      setConflicts(await fetchConflicts(window.location.origin));
    } catch (e) { console.error("Failed to fetch conflicts:", e); }
  }, []);

  useEffect(() => {
    loadEarthquakes();
    const i = setInterval(loadEarthquakes, REFRESH_FAST);
    return () => clearInterval(i);
  }, [loadEarthquakes]);

  useEffect(() => {
    loadDisasters();
    const i = setInterval(loadDisasters, REFRESH_15M);
    return () => clearInterval(i);
  }, [loadDisasters]);

  useEffect(() => {
    loadNews();
    const i = setInterval(loadNews, REFRESH_15M);
    return () => clearInterval(i);
  }, [loadNews]);

  useEffect(() => {
    loadConflicts();
    const i = setInterval(loadConflicts, REFRESH_1H);
    return () => clearInterval(i);
  }, [loadConflicts]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <Globe
        earthquakes={filteredEarthquakes}
        earthquakesVisible={earthquakesVisible}
        disasters={disasters}
        disastersVisible={disastersVisible}
        news={news}
        newsVisible={newsVisible}
        conflicts={conflicts.filter(c => conflictTypeFilter.includes(c.eventType))}
        conflictsVisible={conflictsVisible}
        conflictTypeFilter={conflictTypeFilter}
      />

      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-lg font-light tracking-widest text-white/30 uppercase">
          World Dashboard
        </h1>
      </div>

      <LayerPanel
        earthquakesVisible={earthquakesVisible}
        onToggleEarthquakes={() => setEarthquakesVisible((v) => !v)}
        eventCount={filteredEarthquakes.length}
        minMagnitude={minMagnitude}
        onMinMagnitudeChange={setMinMagnitude}
        disastersVisible={disastersVisible}
        onToggleDisasters={() => setDisastersVisible((v) => !v)}
        disasterCount={disasters.length}
        newsVisible={newsVisible}
        onToggleNews={() => setNewsVisible((v) => !v)}
        newsCount={news.length}
        newsTimespan={newsTimespan}
        onNewsTimespanChange={setNewsTimespan}
        conflictsVisible={conflictsVisible}
        onToggleConflicts={() => setConflictsVisible((v) => !v)}
        conflictCount={conflicts.length}
        conflictTypeFilter={conflictTypeFilter}
        onConflictTypeFilterChange={setConflictTypeFilter}
        allConflictTypes={ALL_CONFLICT_TYPES}
      />
    </main>
  );
}
