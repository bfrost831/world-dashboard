import { NextResponse } from "next/server";

const USGS_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

export async function GET() {
  const res = await fetch(USGS_URL, { next: { revalidate: 300 } });
  const data = await res.json();
  return NextResponse.json(data);
}
