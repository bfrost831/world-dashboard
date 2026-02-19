import { DisasterEvent } from "../types";

export async function fetchDisasters(baseUrl: string): Promise<DisasterEvent[]> {
  const res = await fetch(`${baseUrl}/api/events/disasters`, { next: { revalidate: 0 } });
  const data = await res.json();
  return data as DisasterEvent[];
}
