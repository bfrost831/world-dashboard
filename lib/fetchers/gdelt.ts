import { NewsEvent } from "../types";

export async function fetchNews(baseUrl: string, timespan: string = "24h"): Promise<NewsEvent[]> {
  const res = await fetch(`${baseUrl}/api/events/news?timespan=${timespan}`, { next: { revalidate: 0 } });
  const data = await res.json();
  return data as NewsEvent[];
}
