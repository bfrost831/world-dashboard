import { NextResponse } from "next/server";
import { NewsEvent } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timespan = searchParams.get("timespan") || "24h";
    const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=world&mode=PointData&format=GeoJSON&timespan=${timespan}&maxrows=500`;

    const res = await fetch(url, { next: { revalidate: 900 } });
    const data = await res.json();

    const features = data.features ?? [];
    const events: NewsEvent[] = features
      .filter((f: any) => {
        const coords = f.geometry?.coordinates;
        if (!coords) return false;
        // Filter out 0,0 and error entries
        if (coords[0] === 0 && coords[1] === 0) return false;
        const name = f.properties?.name ?? "";
        if (name.toLowerCase().includes("error")) return false;
        return true;
      })
      .map((f: any, i: number) => {
        // Extract first URL from html property if available
        const html = f.properties?.html ?? "";
        const urlMatch = html.match(/href="([^"]+)"/);
        const titleMatch = html.match(/title="([^"]+)"/);

        return {
          id: `gdelt-${i}-${f.geometry.coordinates.join(",")}`,
          title: titleMatch?.[1] ?? f.properties?.name ?? "News event",
          source: f.properties?.name ?? "",
          url: urlMatch?.[1] ?? "",
          latitude: f.geometry.coordinates[1],
          longitude: f.geometry.coordinates[0],
          time: Date.now(),
          tone: 0,
          count: parseInt(f.properties?.count ?? "1"),
        };
      });

    return NextResponse.json(events);
  } catch (e) {
    console.error("GDELT fetch error:", e);
    return NextResponse.json([]);
  }
}
