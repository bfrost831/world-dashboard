"use client";

import { useState, useEffect, useCallback } from "react";
import { GeoEvent, DisasterEvent, NewsEvent, ConflictEvent, FireDetection } from "@/lib/types";
import { fetchEarthquakes } from "@/lib/fetchers/usgs";
import { fetchDisasters } from "@/lib/fetchers/gdacs";
import { fetchNews } from "@/lib/fetchers/gdelt";
import { fetchConflicts } from "@/lib/fetchers/acled";
import { fetchFires } from "@/lib/fetchers/firms";
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
  const [disasterAlertFilter, setDisasterAlertFilter] = useState<string[]>(["Green", "Orange", "Red"]);
  const [disasterTypeFilter, setDisasterTypeFilter] = useState<string[]>(["TC", "FL", "VO", "DR", "WF"]);

  const [news, setNews] = useState<NewsEvent[]>([]);
  const [newsVisible, setNewsVisible] = useState(true);
  const [newsTimespan, setNewsTimespan] = useState("24h");

  const [conflicts, setConflicts] = useState<ConflictEvent[]>([]);
  const [conflictsVisible, setConflictsVisible] = useState(true);
  const [conflictTypeFilter, setConflictTypeFilter] = useState<string[]>([...ALL_CONFLICT_TYPES]);

  const [fires, setFires] = useState<FireDetection[]>([]);
  const [firesVisible, setFiresVisible] = useState(true);
  const [fireConfidenceFilter, setFireConfidenceFilter] = useState("nominal");
  const [fireIntensity, setFireIntensity] = useState(1);

  const filteredEarthquakes = earthquakes.filter((e) => e.magnitude >= minMagnitude);

  const filteredDisasters = disasters.filter(
    (d) => disasterAlertFilter.includes(d.alertLevel) && disasterTypeFilter.includes(d.type)
  );

  const filteredFires = fires.filter((f) => {
    if (fireConfidenceFilter === "high") return f.confidence === "h";
    if (fireConfidenceFilter === "nominal") return f.confidence === "h" || f.confidence === "n";
    return true;
  });

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

  const loadFires = useCallback(async () => {
    try {
      setFires(await fetchFires(window.location.origin));
    } catch (e) { console.error("Failed to fetch fires:", e); }
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

  useEffect(() => {
    loadFires();
    const i = setInterval(loadFires, REFRESH_1H);
    return () => clearInterval(i);
  }, [loadFires]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <Globe
        earthquakes={filteredEarthquakes}
        earthquakesVisible={earthquakesVisible}
        disasters={filteredDisasters}
        disastersVisible={disastersVisible}
        news={news}
        newsVisible={newsVisible}
        conflicts={conflicts.filter(c => conflictTypeFilter.includes(c.eventType))}
        conflictsVisible={conflictsVisible}
        conflictTypeFilter={conflictTypeFilter}
        fires={filteredFires}
        firesVisible={firesVisible}
        fireIntensity={fireIntensity}
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
        disasterCount={filteredDisasters.length}
        disasterAlertFilter={disasterAlertFilter}
        onDisasterAlertFilterChange={setDisasterAlertFilter}
        disasterTypeFilter={disasterTypeFilter}
        onDisasterTypeFilterChange={setDisasterTypeFilter}
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
        firesVisible={firesVisible}
        onToggleFires={() => setFiresVisible((v) => !v)}
        fireCount={filteredFires.length}
        fireConfidenceFilter={fireConfidenceFilter}
        onFireConfidenceFilterChange={setFireConfidenceFilter}
        fireIntensity={fireIntensity}
        onFireIntensityChange={setFireIntensity}
      />
    </main>
  );
}
