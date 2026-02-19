import { ConflictEvent } from "../types";

export async function fetchConflicts(baseUrl: string): Promise<ConflictEvent[]> {
  const res = await fetch(`${baseUrl}/api/events/conflicts`, { next: { revalidate: 0 } });
  const data = await res.json();
  return data as ConflictEvent[];
}
