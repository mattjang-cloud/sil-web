/**
 * SIL API Client
 *
 * Connects SIL-Web frontend to SIL FastAPI backend.
 * Default: http://localhost:8001 (development)
 *
 * To set up the backend, create SIL/api.py with FastAPI endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_SIL_API_URL || "http://localhost:8001";

// ─── Generic Fetch Helper ───

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.text().catch(() => "Unknown error");
    throw new Error(`API Error ${res.status}: ${error}`);
  }

  return res.json();
}

// ─── Skin Analysis ───

export interface SkinAnalysisResponse {
  issues: string[];
  issue_categories: string[];
  severity: Record<string, number>;
  hydration?: number;
  oil_level?: number;
  texture?: string;
  skin_tone?: string;
  analyzer: string;
}

export async function analyzeSkin(
  imageBase64: string,
  analyzer: "claude_vision" | "facepp" | "both" = "claude_vision"
): Promise<SkinAnalysisResponse> {
  // Claude Vision can take 15-30s — use AbortController for 45s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    return await apiFetch<SkinAnalysisResponse>("/api/analyze-skin", {
      method: "POST",
      body: JSON.stringify({ image: imageBase64, analyzer }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Analysis timed out after 45 seconds. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Consultation (Streaming) ───

export interface ConsultRequest {
  message: string;
  vectors: Record<string, unknown>;
  language: "ko" | "en" | "ja";
  history: { role: string; content: string }[];
  persona_id?: string;
}

export interface ConsultResponse {
  reply: string;
  expert: {
    name: string;
    role: string;
    emoji: string;
    category: string;
  };
  products?: Record<string, unknown>[];
}

export async function consult(req: ConsultRequest): Promise<ConsultResponse> {
  return apiFetch<ConsultResponse>("/api/consult", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

/**
 * Streaming consultation using SSE.
 * Yields text chunks as they arrive.
 */
export async function* consultStream(
  req: ConsultRequest
): AsyncGenerator<string, void, unknown> {
  const url = `${API_BASE}/api/consult`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...req, stream: true }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Stream error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) yield parsed.text;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
}

// ─── Products ───

export interface ProductSearchParams {
  concerns?: string[];
  skin_types?: string[];
  category?: string;
  brand?: string;
  price_max?: number;
  limit?: number;
}

export async function searchProducts(
  params: ProductSearchParams
): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams();
  if (params.concerns) query.set("concerns", params.concerns.join(","));
  if (params.skin_types) query.set("skin_types", params.skin_types.join(","));
  if (params.category) query.set("category", params.category);
  if (params.brand) query.set("brand", params.brand);
  if (params.price_max) query.set("price_max", String(params.price_max));
  if (params.limit) query.set("limit", String(params.limit));

  return apiFetch<Record<string, unknown>[]>(`/api/products?${query}`);
}

// ─── Weather ───

export interface WeatherResponse {
  temp: number;
  humidity: number;
  uvi: number;
  description: string;
  city: string;
  aqi?: number;
}

export async function getWeather(
  lat?: number,
  lon?: number,
  city?: string,
  season?: string,
): Promise<WeatherResponse> {
  const query = new URLSearchParams();
  if (lat) query.set("lat", String(lat));
  if (lon) query.set("lon", String(lon));
  if (city) query.set("city", city);
  if (season) query.set("season", season);
  return apiFetch<WeatherResponse>(`/api/weather?${query}`);
}

// ─── Personas ───

export interface PersonaInfo {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  avatar_gradient: string;
  specialty_tags: string[];
}

export async function getPersonas(lang: string = "ko"): Promise<PersonaInfo[]> {
  return apiFetch<PersonaInfo[]>(`/api/personas?lang=${lang}`);
}

// ─── Cities ───

export interface CityInfo {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export async function getCities(lang: string = "ko"): Promise<CityInfo[]> {
  return apiFetch<CityInfo[]>(`/api/cities?lang=${lang}`);
}

// ─── Diary ───

export async function getDiary(): Promise<Record<string, unknown>[]> {
  return apiFetch<Record<string, unknown>[]>("/api/diary");
}

export async function addDiaryEntry(
  entry: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/api/diary", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

// ─── Health Check ───

export async function healthCheck(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/api/health");
}
