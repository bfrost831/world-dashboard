import { GeoEvent } from "../types";

const USGS_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

export async function fetchEarthquakes(baseUrl?: string): Promise<GeoEvent[]> {
  const url = baseUrl ? `${baseUrl}/api/events/earthquakes` : USGS_URL;
  const res = await fetch(url, { next: { revalidate: 0 } });
  const data = await res.json();
  return (data.features ?? []).map((f: any) => ({
    id: f.id,
    type: "earthquake",
    longitude: f.geometry.coordinates[0],
    latitude: f.geometry.coordinates[1],
    depth: f.geometry.coordinates[2],
    magnitude: f.properties.mag,
    place: f.properties.place,
    time: f.properties.time,
  }));
}
