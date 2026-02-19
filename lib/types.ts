export interface GeoEvent {
  id: string;
  type: string;
  latitude: number;
  longitude: number;
  magnitude: number;
  place: string;
  time: number; // unix ms
  depth: number;
}
