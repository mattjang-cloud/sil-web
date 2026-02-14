// ─── SIL Core Types ───

export type SkinIssue =
  | "acne"
  | "dark_circle"
  | "stain"
  | "wrinkle"
  | "pore"
  | "dryness"
  | "oiliness"
  | "sensitivity"
  | "dullness"
  | "uneven_tone";

export type SkinType = "oily" | "dry" | "combination" | "sensitive" | "normal";

export interface SkinAnalysis {
  issues: SkinIssue[];
  issue_categories: string[];
  severity: Record<string, number>;
  hydration?: number;
  oil_level?: number;
  texture?: string;
  skin_tone?: string;
  skin_type?: string;
  skin_type_code?: number;
  top_concerns?: string[];
  brief_note?: string;
  summary?: string;
  analyzer: "claude_vision" | "facepp" | "both";
  success?: boolean;
}

export interface Persona {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  avatar_gradient: string;
  specialty_tags: string[];
}

export interface CityInfo {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  uvi: number;
  description: string;
  city: string;
  aqi?: number;
}

export interface LifestyleVector {
  sleep_hours: number;
  stress_level: "low" | "medium" | "high";
  water_intake: number;
  exercise_freq: "none" | "light" | "moderate" | "active";
  diet_quality: "poor" | "average" | "good" | "excellent";
}

export type TPOTime = "morning" | "afternoon" | "evening" | "night";
export type TPOPlace = "office" | "outdoor" | "home" | "gym" | "travel";
export type TPOOccasion = "daily" | "date" | "meeting" | "workout" | "special";

export interface TPOVector {
  time: TPOTime;
  place: TPOPlace;
  occasion: TPOOccasion;
}

export type ThemeStyle =
  | "glass_skin"
  | "clean_girl"
  | "k_idol"
  | "natural"
  | "dewy"
  | "matte"
  | "minimalist";

export interface ThemeVector {
  style: ThemeStyle;
  finish: string;
  intensity: "subtle" | "moderate" | "bold";
}

export interface FiveVectors {
  user?: SkinAnalysis;
  environment?: WeatherData;
  lifestyle?: LifestyleVector;
  tpo?: TPOVector;
  theme?: ThemeVector;
}

// ─── Chat Types ───

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  expert?: ExpertInfo;
  products?: ProductCard[];
}

export interface ExpertInfo {
  name: string;
  role: string;
  emoji: string;
  category: string;
}

export interface ProductCard {
  id: string;
  name_ko: string;
  name_en: string;
  brand: string;
  category: string;
  price_krw: number;
  price_usd?: number;
  image_url?: string;
  concerns: string[];
  skin_types: string[];
  key_ingredients: string[];
  score?: number;
}

// ─── API Types ───

export interface ConsultRequest {
  message: string;
  vectors: FiveVectors;
  language: "ko" | "en" | "ja";
  history: { role: string; content: string }[];
  persona_id?: string;
}

export interface ConsultResponse {
  reply: string;
  expert: ExpertInfo;
  products?: ProductCard[];
}

export interface SkinAnalysisRequest {
  image: string; // base64
  analyzer: "claude_vision" | "facepp" | "both";
}

// ─── Diary Types ───

export interface SkinDiaryEntry {
  date: string;
  skin_data: SkinAnalysis;
  weather: WeatherData;
  notes: string;
  routine_am?: string[];
  routine_pm?: string[];
  photo_url?: string;
}

// ─── UI State ───

export type ConsultationStep =
  | "welcome"
  | "persona"
  | "skin_scan"
  | "environment"
  | "lifestyle"
  | "tpo"
  | "theme"
  | "chat";

export interface ConsultationState {
  step: ConsultationStep;
  vectors: FiveVectors;
  messages: ChatMessage[];
  isLoading: boolean;
  currentExpert?: ExpertInfo;
  language: "ko" | "en" | "ja";
}
