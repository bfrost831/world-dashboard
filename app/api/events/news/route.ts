import { NextResponse } from "next/server";
import { NewsEvent } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timespan = searchParams.get("timespan") || "24h";
    const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=&mode=PointData&format=GeoJSON&timespan=${timespan}&maxrows=500`;

    const res = await fetch(url, { next: { revalidate: 900 } });
    const data = await res.json();

    const events: NewsEvent[] = (data.features ?? []).map((f: any, i: number) => ({
      id: `gdelt-${i}-${f.properties?.urlpubtimeserial ?? ""}`,
      title: f.properties?.name ?? f.properties?.html ?? "",
      source: f.properties?.domain ?? f.properties?.source ?? "",
      url: f.properties?.url ?? "",
      latitude: f.geometry?.coordinates?.[1] ?? 0,
      longitude: f.geometry?.coordinates?.[0] ?? 0,
      time: f.properties?.urlpubtimeserial
        ? new Date(
            String(f.properties.urlpubtimeserial).replace(
              /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
              "$1-$2-$3T$4:$5:$6Z"
            )
          ).getTime()
        : Date.now(),
      tone: parseFloat(f.properties?.tone ?? "0"),
    }));

    return NextResponse.json(events);
  } catch (e) {
    console.error("GDELT fetch error:", e);
    return NextResponse.json([]);
  }
}
