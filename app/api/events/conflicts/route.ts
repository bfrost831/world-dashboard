import { NextResponse } from "next/server";
import { ConflictEvent } from "@/lib/types";
import sampleData from "@/lib/data/acled-sample.json";

export async function GET() {
  const acledKey = process.env.ACLED_KEY;
  const acledEmail = process.env.ACLED_EMAIL;

  if (acledKey && acledEmail) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const fmt = (d: Date) => d.toISOString().split("T")[0];
      const url = `https://api.acleddata.com/acled/read?key=${acledKey}&email=${acledEmail}&limit=500&event_date=${fmt(thirtyDaysAgo)}|${fmt(now)}&event_date_where=BETWEEN&terms=accept`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        const events: ConflictEvent[] = json.data.map((d: any) => ({
          id: String(d.data_id),
          eventType: d.event_type,
          subEventType: d.sub_event_type,
          country: d.country,
          latitude: parseFloat(d.latitude),
          longitude: parseFloat(d.longitude),
          time: new Date(d.event_date).getTime(),
          fatalities: parseInt(d.fatalities) || 0,
          notes: d.notes ?? "",
        }));
        return NextResponse.json(events);
      }
    } catch (e) {
      console.error("ACLED API error, falling back to sample:", e);
    }
  }

  return NextResponse.json(sampleData);
}
