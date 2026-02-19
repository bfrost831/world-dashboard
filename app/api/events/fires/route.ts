import { NextResponse } from "next/server";

const FIRMS_URL =
  "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv";

export async function GET() {
  const res = await fetch(FIRMS_URL, { next: { revalidate: 3600 } });
  const text = await res.text();
  const lines = text.split("\n");
  const header = lines[0].split(",");

  const idx = {
    latitude: header.indexOf("latitude"),
    longitude: header.indexOf("longitude"),
    frp: header.indexOf("frp"),
    confidence: header.indexOf("confidence"),
    acq_date: header.indexOf("acq_date"),
    acq_time: header.indexOf("acq_time"),
    daynight: header.indexOf("daynight"),
  };

  const results: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const cols = line.split(",");
    const confidence = cols[idx.confidence];
    if (confidence === "l") continue;
    results.push({
      latitude: parseFloat(cols[idx.latitude]),
      longitude: parseFloat(cols[idx.longitude]),
      frp: parseFloat(cols[idx.frp]) || 0,
      confidence,
      acq_date: cols[idx.acq_date],
      acq_time: cols[idx.acq_time],
      daynight: cols[idx.daynight],
    });
  }

  return NextResponse.json(results);
}
