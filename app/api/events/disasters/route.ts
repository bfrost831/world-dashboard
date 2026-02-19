import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { DisasterEvent } from "@/lib/types";

const GDACS_URL = "https://www.gdacs.org/xml/rss.xml";
const SKIP_TYPES = ["EQ"]; // earthquakes covered by USGS

export async function GET() {
  try {
    const res = await fetch(GDACS_URL, { next: { revalidate: 900 } });
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item ?? [];
    const arr = Array.isArray(items) ? items : [items];

    const events: DisasterEvent[] = [];
    for (const item of arr) {
      const eventType = item["gdacs:eventtype"] ?? "";
      if (SKIP_TYPES.includes(eventType)) continue;

      const geoPoint = item["geo:Point"] ?? {};
      const lat = parseFloat(geoPoint["geo:lat"] ?? "0");
      const lng = parseFloat(geoPoint["geo:long"] ?? "0");
      if (lat === 0 && lng === 0) continue;

      const alertLevel = (item["gdacs:alertlevel"] ?? "Green") as DisasterEvent["alertLevel"];

      events.push({
        id: item.guid?.["#text"] ?? item.guid ?? String(Math.random()),
        type: eventType,
        alertLevel,
        title: item.title ?? "",
        description: item.description ?? "",
        latitude: lat,
        longitude: lng,
        time: new Date(item.pubDate ?? Date.now()).getTime(),
      });
    }

    return NextResponse.json(events);
  } catch (e) {
    console.error("GDACS fetch error:", e);
    return NextResponse.json([]);
  }
}
