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

export interface DisasterEvent {
  id: string;
  type: string; // TC, FL, VO, DR, WF
  alertLevel: 'Green' | 'Orange' | 'Red';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  time: number;
}

export interface NewsEvent {
  id: string;
  title: string;
  source: string;
  url: string;
  latitude: number;
  longitude: number;
  time: number;
  tone: number;
  count?: number;
}

export interface FireDetection {
  latitude: number;
  longitude: number;
  frp: number;
  confidence: string;
  acq_date: string;
  acq_time: string;
  daynight: string;
}

export interface ConflictEvent {
  id: string;
  eventType: string;
  subEventType: string;
  country: string;
  latitude: number;
  longitude: number;
  time: number;
  fatalities: number;
  notes: string;
}
