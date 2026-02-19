import { FireDetection } from "../types";

export async function fetchFires(baseUrl: string): Promise<FireDetection[]> {
  const res = await fetch(`${baseUrl}/api/events/fires`, { next: { revalidate: 0 } });
  const data = await res.json();
  return data as FireDetection[];
}
