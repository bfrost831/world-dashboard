# 🌍 World Dashboard

An unbiased, data-first dashboard showing what's happening around the world. Built for regular people, not analysts.

Real-time globe visualization powered by primary data sources — earthquakes, conflicts, climate, health, economics — with no dopamine design, no outrage optimization, just the world as it is.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **deck.gl** + **MapLibre GL JS** — 3D WebGL globe
- **Tailwind CSS** — styling
- **CARTO Dark Matter** — basemap

## Data Sources

Currently live:
- **USGS Earthquake API** — real-time global earthquakes (M4.5+), magnitude-scaled markers

Planned (22 total):
- NASA EONET (wildfires, storms, volcanoes)
- ACLED (conflicts, protests)
- GDELT (global news events)
- GDACS (disaster alerts)
- WHO GHO (health indicators)
- FRED / World Bank / IMF (economics)
- OpenAQ (air quality)
- NOAA (climate trends)
- [Full source list →](https://www.notion.so/World-Dashboard-30b33493b08881dba5b4f642808b6c1c)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
app/
  page.tsx                          — main layout
  api/events/earthquakes/route.ts   — USGS proxy endpoint
components/
  Globe.tsx                         — deck.gl + MapLibre 3D globe
  LayerPanel.tsx                    — layer toggle panel
lib/
  types.ts                          — shared types (GeoEvent)
  fetchers/usgs.ts                  — earthquake data fetcher
```

Each data source gets a fetcher module in `lib/fetchers/` and an API route in `app/api/`. All sources normalize into either **GeoEvents** (map markers) or **Indicators** (chart data).

## Philosophy

- **Data-first** — primary sources (USGS, WHO, NOAA), not news feeds
- **No dopamine design** — calm, informational, no engagement tricks
- **Show the full picture** — environment, health, conflict, economics together
- **For everyone** — your curious friend should understand it, not just analysts

## License

MIT
