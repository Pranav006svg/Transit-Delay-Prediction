/**
 * Transit Delay Prediction API Service
 * Communicates with the FastAPI backend running on http://localhost:8000
 */

const API_BASE = "http://localhost:8000";

// ── Request / Response types ────────────────────────────────────────────────

export type ModelName = "xgboost" | "neural_net" | "sklearn";

export interface PredictRequest {
  transport_type: string;           // Bus | Tram | Metro | Train
  route_id?: string;               // Route_1 … Route_20
  origin_station?: string;         // Station_1 … Station_50
  destination_station?: string;    // Station_1 … Station_50
  weather_condition: string;       // Clear | Rain | Storm | Snow | Fog | Cloudy
  temperature_C?: number;
  humidity_percent?: number;
  wind_speed_kmh?: number;
  precipitation_mm?: number;
  event_type?: string;             // None | Sports | Concert | Festival | Protest | Parade
  event_attendance_est?: number;   // 0 when no event
  traffic_congestion_index?: number; // 0-100
  peak_hour?: number;              // 0 | 1
  season?: string;                 // Winter | Spring | Summer | Autumn
  holiday?: number;                // 0 | 1
  weekday?: number;                // 0-6
  hour?: number;                   // 0-23
  sched_dep_hour?: number;         // 0-23
  sched_arr_hour?: number;         // 0-23
  model?: ModelName;               // xgboost | neural_net | sklearn
}

export interface PredictResponse {
  delay_probability: number;   // 0-100
  expected_delay_min: number;
  risk_level: "Low" | "Medium" | "High";
  confidence: number;          // 0-100
  is_delayed: boolean;
  model_accuracy: number;
  model_used?: ModelName;
}

export interface ModelInfo {
  classifier_accuracy_pct: number;
  regressor_mae_min: number;
  description: string;
}

export type ModelsResponse = Record<ModelName, ModelInfo>;

export interface RouteStats {
  route_id: string;
  total: number;
  delayed: number;
  avg_delay: number;
  delay_rate: number;
  reliability: number;
}

export interface ApiStats {
  total_trips: number;
  on_time_rate: number;
  delayed_rate: number;
  avg_delay_min: number;
  classifier_accuracy: number;
  by_transport: Array<{ transport_type: string; total: number; delayed: number; avg_delay: number; delay_rate: number }>;
  by_weather: Array<{ weather_condition: string; avg_delay: number; delay_rate: number }>;
  by_hour: Array<{ hour: number; avg_delay: number; delay_rate: number }>;
  by_season: Array<{ season: string; avg_delay: number; delay_rate: number }>;
  top_delayed_routes: RouteStats[];
}

export interface ApiMetadata {
  transport_types: string[];
  weather_conditions: string[];
  event_types: string[];
  seasons: string[];
  routes: string[];
  stations: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), ...init });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
};

// ── API functions ─────────────────────────────────────────────────────────────

export const checkHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
};

export const predictDelay = (req: PredictRequest): Promise<PredictResponse> =>
  fetchJson<PredictResponse>(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

export const fetchStats = (): Promise<ApiStats> =>
  fetchJson<ApiStats>(`${API_BASE}/stats`);

export const fetchRoutes = (): Promise<RouteStats[]> =>
  fetchJson<RouteStats[]>(`${API_BASE}/routes`);

export const fetchMetadata = (): Promise<ApiMetadata> =>
  fetchJson<ApiMetadata>(`${API_BASE}/metadata`);

export const fetchModels = (): Promise<ModelsResponse> =>
  fetchJson<ModelsResponse>(`${API_BASE}/models`);

// ── Client-side heuristic fallback (used when backend is offline) ─────────────

/** Approximates delay probability using dataset-derived rules. */
export const heuristicPredict = (req: PredictRequest): PredictResponse => {
  let prob = 0.58; // baseline ~58% from dataset

  // Weather impact
  const weatherImpact: Record<string, number> = {
    Storm: 0.18,
    Snow: 0.14,
    Fog: 0.10,
    Rain: 0.08,
    Cloudy: 0.03,
    Clear: -0.08,
  };
  prob += weatherImpact[req.weather_condition] ?? 0;

  // Peak hour
  if (req.peak_hour === 1) prob += 0.12;

  // Traffic congestion
  const tci = req.traffic_congestion_index ?? 50;
  if (tci > 70) prob += 0.12;
  else if (tci > 40) prob += 0.05;
  else prob -= 0.05;

  // Events
  const eventImpact: Record<string, number> = {
    Concert: 0.08,
    Festival: 0.08,
    Sports: 0.07,
    Parade: 0.06,
    Protest: 0.05,
    None: 0,
  };
  prob += eventImpact[req.event_type ?? "None"] ?? 0;

  // Transport type
  if (req.transport_type === "Bus") prob += 0.04;
  if (req.transport_type === "Metro") prob -= 0.04;

  // Season
  if (req.season === "Winter") prob += 0.06;
  if (req.season === "Summer") prob -= 0.02;

  prob = Math.min(0.97, Math.max(0.05, prob));

  const baseDelay = 11.5;
  const delayMin = +(baseDelay + (prob - 0.5) * 20 + (tci / 100) * 6).toFixed(1);

  let risk: "Low" | "Medium" | "High" = "Medium";
  if (prob < 0.35) risk = "Low";
  else if (prob >= 0.65) risk = "High";

  return {
    delay_probability: +(prob * 100).toFixed(1),
    expected_delay_min: Math.max(0, delayMin),
    risk_level: risk,
    confidence: 72.5, // heuristic confidence
    is_delayed: prob >= 0.5,
    model_accuracy: 0, // not available offline
  };
};
