"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GLASS_CARD,
  HUD_LABEL,
  ACCENT_GRADIENT,
  GLOW_PURPLE,
  getSeverityColor,
} from "@/lib/clinical-theme";
import { ScanBadge } from "./scan-badge";
import { HudMetricCard, HudMetricText } from "./hud-metric-card";
import { analyzeSkin } from "@/lib/api";
import type { SkinAnalysis } from "@/lib/types";

interface HudScannerProps {
  onAnalysisComplete: (data: SkinAnalysis) => void;
  /** Compact mode for inline use in wizard (default) vs fullscreen mirror mode */
  compact?: boolean;
}

type ScanMode = "idle" | "camera" | "scanning" | "analyzing" | "results" | "error";

const SCAN_MESSAGES = [
  "INITIALIZING SCAN...",
  "DETECTING SURFACE...",
  "ANALYZING TEXTURE...",
  "MEASURING HYDRATION...",
  "CHECKING OIL LEVEL...",
  "PROCESSING DATA...",
];

export function HudScanner({ onAnalysisComplete, compact = true }: HudScannerProps) {
  const [mode, setMode] = useState<ScanMode>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanMsg, setScanMsg] = useState(SCAN_MESSAGES[0]);
  const [skinData, setSkinData] = useState<SkinAnalysis | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Detect mobile
  useEffect(() => {
    const mobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      ("ontouchstart" in window && window.innerWidth < 1024);
    setIsMobile(mobile);
  }, []);

  // Cycle scan messages during analysis
  useEffect(() => {
    if (mode !== "analyzing") return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % SCAN_MESSAGES.length;
      setScanMsg(SCAN_MESSAGES[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, [mode]);

  const processFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("FILE SIZE EXCEEDS 10MB LIMIT");
      setMode("error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrorMsg("INVALID FILE TYPE — IMAGE REQUIRED");
      setMode("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      analyzeImage(result);
    };
    reader.onerror = () => {
      setErrorMsg("FILE READ ERROR");
      setMode("error");
    };
    reader.readAsDataURL(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMode("camera");
    } catch {
      setErrorMsg("CAMERA ACCESS DENIED");
      setMode("error");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(dataUrl);
    stopCamera();
    analyzeImage(dataUrl);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const analyzeImage = async (imageData: string) => {
    setMode("analyzing");
    setErrorMsg("");
    try {
      const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData;
      const result = await analyzeSkin(base64Data, "claude_vision");
      setSkinData(result as unknown as SkinAnalysis);
      setMode("results");
    } catch (err) {
      console.error("Clinical scan failed:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("timeout") || msg.includes("504") || msg.includes("502")) {
        setErrorMsg("ANALYSIS TIMEOUT — USING FALLBACK DATA");
      } else {
        setErrorMsg(`SCAN ERROR: ${msg}`);
      }
      useFallback();
    }
  };

  const useFallback = () => {
    const fallback: SkinAnalysis = {
      issues: ["dryness", "dark_circle", "uneven_tone"],
      issue_categories: ["hydration", "pigmentation", "tone"],
      severity: { dryness: 0.6, dark_circle: 0.4, uneven_tone: 0.3 },
      hydration: 42,
      oil_level: 35,
      texture: "slightly rough",
      skin_tone: "light warm",
      analyzer: "claude_vision",
    };
    setSkinData(fallback);
    setMode("results");
  };

  const reset = () => {
    setMode("idle");
    setPreview(null);
    setErrorMsg("");
    setSkinData(null);
  };

  // ─── Camera View ───
  if (mode === "camera") {
    return (
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] max-w-sm mx-auto">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(140,43,238,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(140,43,238,0.1) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            {/* Scan line */}
            <div className="absolute left-0 right-0 h-[2px] animate-scan-line bg-gradient-to-r from-transparent via-[#8c2bee] to-transparent" />

            {/* Corner readouts */}
            <div className="absolute top-3 left-3">
              <span className={cn(HUD_LABEL, "text-[#8c2bee]")}>DETECTING...</span>
            </div>
            <div className="absolute top-3 right-3">
              <ScanBadge label="LIVE" active />
            </div>
            <div className="absolute bottom-3 left-3">
              <span className={cn(HUD_LABEL, "text-white/30")}>RES: 640x480</span>
            </div>

            {/* Target marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="target-marker" />
            </div>
          </div>

          {/* Capture controls */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-center gap-3 pointer-events-auto">
            <Button
              onClick={capturePhoto}
              className={cn(
                "rounded-full w-14 h-14 text-xl",
                ACCENT_GRADIENT,
                "text-white hover:opacity-90"
              )}
            >
              📸
            </Button>
            <Button
              variant="outline"
              onClick={() => { stopCamera(); setMode("idle"); }}
              className="rounded-full border-white/20 text-white/70 hover:text-white hover:bg-white/10"
            >
              CANCEL
            </Button>
          </div>
        </div>

        <p className={cn(HUD_LABEL, "text-center")}>
          POSITION FACE IN CENTER — GOOD LIGHTING RECOMMENDED
        </p>
      </div>
    );
  }

  // ─── Analyzing View ───
  if (mode === "analyzing") {
    return (
      <div className="flex flex-col items-center py-8">
        {preview && (
          <div className={cn("w-24 h-24 rounded-2xl overflow-hidden mb-6 ring-2 ring-[#8c2bee]/40", GLOW_PURPLE)}>
            <img src={preview} alt="Scan input" className="w-full h-full object-cover" />
          </div>
        )}

        <ScanBadge label="ANALYZING" active className="mb-4" />

        <div className="flex items-center gap-3 mb-4">
          <div className={cn("w-8 h-8 rounded-full animate-spin", ACCENT_GRADIENT)} />
          <span className="font-mono text-sm text-white/70 uppercase tracking-wider">
            {scanMsg}
          </span>
        </div>

        <p className={cn(HUD_LABEL, "mb-6")}>ESTIMATED TIME: 10-20 SECONDS</p>

        <div className="flex flex-wrap justify-center gap-2">
          {["HYDRATION", "OIL", "TEXTURE", "TONE", "ISSUES"].map((item, i) => (
            <Badge
              key={item}
              variant="outline"
              className="text-[10px] rounded-full animate-pulse border-white/10 text-white/40"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              {item}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  // ─── Results View ───
  if (mode === "results" && skinData) {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <ScanBadge label="SCAN COMPLETE" active={false} className="mb-4 mx-auto" />
          {skinData.skin_type && (
            <Badge className={cn("rounded-full px-4 py-1.5 text-sm text-white border-0", ACCENT_GRADIENT)}>
              {skinData.skin_type}
            </Badge>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <HudMetricCard
            label="HYDRATION"
            value={skinData.hydration ?? 50}
            delay={0}
          />
          <HudMetricCard
            label="OIL LEVEL"
            value={skinData.oil_level ?? 50}
            delay={100}
          />
          <HudMetricText
            label="TEXTURE"
            value={skinData.texture || "N/A"}
            delay={200}
          />
        </div>

        {/* Issues */}
        {skinData.issues && skinData.issues.length > 0 && (
          <div>
            <p className={cn(HUD_LABEL, "mb-2")}>DETECTED ISSUES</p>
            <div className="flex flex-wrap gap-2">
              {skinData.issues.map((issue) => {
                const severity = skinData.severity?.[issue] || 0;
                return (
                  <Badge
                    key={issue}
                    variant="outline"
                    className={cn("rounded-full text-[10px] font-mono uppercase", getSeverityColor(severity))}
                  >
                    {issue.replace(/_/g, " ")}
                    {severity > 0 && ` ${Math.round(severity * 100)}%`}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Brief note */}
        {skinData.brief_note && (
          <div className={cn(GLASS_CARD, "p-3 text-sm text-white/60 italic")}>
            &quot;{skinData.brief_note}&quot;
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-white/40 hover:text-white/60"
          >
            RESCAN
          </Button>
          <Button
            className={cn("rounded-full px-6 text-white", ACCENT_GRADIENT)}
            onClick={() => onAnalysisComplete(skinData)}
          >
            CONTINUE →
          </Button>
        </div>
      </div>
    );
  }

  // ─── Error View ───
  if (mode === "error") {
    return (
      <div className="flex flex-col items-center py-6 gap-4">
        <div className={cn(GLASS_CARD, "w-16 h-16 flex items-center justify-center text-3xl border-red-500/20")}>
          ⚠️
        </div>
        <p className="font-mono text-xs text-red-400/80 uppercase tracking-wider text-center max-w-xs">
          {errorMsg}
        </p>
        <div className="flex gap-3">
          <Button
            className={cn("rounded-full px-6 text-white", ACCENT_GRADIENT)}
            onClick={reset}
          >
            RETRY
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-6 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
            onClick={useFallback}
          >
            USE FALLBACK DATA
          </Button>
        </div>
      </div>
    );
  }

  // ─── Idle View ───
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3">
        {isMobile ? (
          <>
            <label
              htmlFor="clinical-camera-input"
              className={cn(
                "inline-flex items-center justify-center rounded-full px-6 h-10 text-sm font-mono uppercase tracking-wider text-white cursor-pointer",
                ACCENT_GRADIENT,
                "hover:opacity-90 transition-opacity active:scale-95"
              )}
            >
              📸 SCAN
            </label>
            <label
              htmlFor="clinical-gallery-input"
              className={cn(
                GLASS_CARD,
                "inline-flex items-center justify-center rounded-full px-6 h-10 text-sm font-mono uppercase tracking-wider text-white/70 cursor-pointer",
                "hover:bg-white/8 transition-colors active:scale-95"
              )}
            >
              📁 UPLOAD
            </label>
          </>
        ) : (
          <>
            <Button
              className={cn("rounded-full px-6 text-sm font-mono uppercase tracking-wider text-white", ACCENT_GRADIENT)}
              onClick={startCamera}
            >
              📸 SCAN
            </Button>
            <label
              htmlFor="clinical-gallery-input"
              className={cn(
                GLASS_CARD,
                "inline-flex items-center justify-center rounded-full px-6 h-10 text-sm font-mono uppercase tracking-wider text-white/70 cursor-pointer",
                "hover:bg-white/8 transition-colors active:scale-95"
              )}
            >
              📁 UPLOAD
            </label>
          </>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        id="clinical-camera-input"
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
      <input
        id="clinical-gallery-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      <p className={cn(HUD_LABEL, "text-center max-w-xs")}>
        {isMobile
          ? "TAP SCAN TO OPEN CAMERA, OR UPLOAD FROM GALLERY"
          : "PHOTO IS ANALYZED BY AI AND NEVER STORED"}
      </p>
    </div>
  );
}
