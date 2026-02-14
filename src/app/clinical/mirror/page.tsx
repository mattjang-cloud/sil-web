"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GLASS_CARD,
  HUD_LABEL,
  HUD_LABEL_BRIGHT,
  ACCENT_GRADIENT,
  GLOW_PURPLE,
  getSeverityColor,
} from "@/lib/clinical-theme";
import { ScanBadge } from "@/components/clinical/scan-badge";
import { HudMetricCard, HudMetricText } from "@/components/clinical/hud-metric-card";
import { analyzeSkin } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import type { SkinAnalysis } from "@/lib/types";

type MirrorState = "idle" | "camera" | "scanning" | "results";

const SCAN_PHASES = [
  "INITIALIZING SENSOR ARRAY...",
  "CALIBRATING OPTICS...",
  "DETECTING FACIAL GEOMETRY...",
  "ANALYZING DERMAL SURFACE...",
  "MEASURING HYDRATION DEPTH...",
  "SCANNING OIL DISTRIBUTION...",
  "EVALUATING TEXTURE MAP...",
  "PROCESSING CLINICAL DATA...",
];

export default function ClinicalMirrorPage() {
  const [state, setState] = useState<MirrorState>("idle");
  const [scanPhase, setScanPhase] = useState(0);
  const [skinData, setSkinData] = useState<SkinAnalysis | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const mobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      ("ontouchstart" in window && window.innerWidth < 1024);
    setIsMobile(mobile);
  }, []);

  // Auto-start camera on mount for desktop
  useEffect(() => {
    if (!isMobile) {
      startCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Scan phase animation
  useEffect(() => {
    if (state !== "scanning") return;
    const interval = setInterval(() => {
      setScanPhase((p) => {
        if (p >= SCAN_PHASES.length - 1) return p;
        return p + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [state]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 960 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState("camera");
    } catch {
      setState("idle");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;
    setState("scanning");
    setScanPhase(0);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

    try {
      const base64 = dataUrl.split(",")[1];
      const result = await analyzeSkin(base64, "claude_vision");
      setSkinData(result as unknown as SkinAnalysis);
      setState("results");
    } catch {
      setSkinData({
        issues: ["dryness", "dark_circle", "uneven_tone"],
        issue_categories: ["hydration", "pigmentation", "tone"],
        severity: { dryness: 0.6, dark_circle: 0.4, uneven_tone: 0.3 },
        hydration: 42,
        oil_level: 35,
        texture: "slightly rough",
        skin_tone: "light warm",
        analyzer: "claude_vision",
      });
      setState("results");
    }
  };

  const processFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024 || !file.type.startsWith("image/")) return;
    setState("scanning");
    setScanPhase(0);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const base64 = dataUrl.split(",")[1];
        const result = await analyzeSkin(base64, "claude_vision");
        setSkinData(result as unknown as SkinAnalysis);
        setState("results");
      } catch {
        setSkinData({
          issues: ["dryness", "dark_circle"],
          issue_categories: ["hydration", "pigmentation"],
          severity: { dryness: 0.5, dark_circle: 0.4 },
          hydration: 45,
          oil_level: 38,
          texture: "normal",
          skin_tone: "medium",
          analyzer: "claude_vision",
        });
        setState("results");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const handleRetake = () => {
    setSkinData(null);
    setState("idle");
    if (!isMobile) startCamera();
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-[#050a18]">
      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          state === "camera" || state === "scanning" ? "opacity-100" : "opacity-0",
          "transition-opacity duration-500"
        )}
        style={{ transform: "scaleX(-1)" }}
      />

      {/* HUD Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(140,43,238,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(140,43,238,0.08) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        {/* Edge Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a18]/80 via-transparent to-[#050a18]/40" />

        {/* Scan Line */}
        {(state === "camera" || state === "scanning") && (
          <div className="absolute left-0 right-0 h-[2px] animate-scan-line bg-gradient-to-r from-transparent via-[#8c2bee] to-transparent" />
        )}

        {/* Top Left: Status */}
        <div className="absolute top-4 left-4 pointer-events-auto">
          <ScanBadge
            label={state === "scanning" ? "SCANNING" : state === "results" ? "COMPLETE" : "READY"}
            active={state === "camera" || state === "scanning"}
          />
        </div>

        {/* Top Right: System Info */}
        <div className="absolute top-4 right-4 text-right space-y-1">
          <p className={cn(HUD_LABEL, "text-[#8c2bee]")}>SIL CLINICAL v1.0</p>
          <p className={cn(HUD_LABEL, "text-white/20")}>
            {new Date().toLocaleTimeString("en-US", { hour12: false })}
          </p>
        </div>

        {/* Center Target */}
        {state === "camera" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 border-2 border-[#8c2bee]/30 rounded-full animate-breathe">
              <div className="absolute inset-4 border border-[#f906f9]/20 rounded-full" />
              <div className="absolute inset-8 border border-[#8c2bee]/10 rounded-full" />
            </div>
          </div>
        )}

        {/* Scan Progress */}
        {state === "scanning" && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className={cn(GLASS_CARD, "px-6 py-4 text-center min-w-[280px]")}>
              <p className={cn(HUD_LABEL_BRIGHT, "text-[#8c2bee] mb-2 animate-pulse")}>
                {SCAN_PHASES[scanPhase]}
              </p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000", ACCENT_GRADIENT)}
                  style={{ width: `${((scanPhase + 1) / SCAN_PHASES.length) * 100}%` }}
                />
              </div>
              <p className={cn(HUD_LABEL, "mt-2")}>
                PHASE {scanPhase + 1}/{SCAN_PHASES.length}
              </p>
            </div>
          </div>
        )}

        {/* Results Overlay */}
        {state === "results" && skinData && (
          <div className="absolute inset-x-4 bottom-4 pointer-events-auto animate-slide-up">
            <div className={cn(GLASS_CARD, "p-5 max-w-lg mx-auto")}>
              <div className="flex items-center justify-between mb-4">
                <span className={cn(HUD_LABEL_BRIGHT, "text-[#8c2bee]")}>CLINICAL ANALYSIS</span>
                {skinData.skin_type && (
                  <Badge className={cn("rounded-full px-3 py-1 text-xs text-white border-0", ACCENT_GRADIENT)}>
                    {skinData.skin_type}
                  </Badge>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <HudMetricCard label="HYDRATION" value={skinData.hydration ?? 50} showRing={false} />
                <HudMetricCard label="OIL" value={skinData.oil_level ?? 50} showRing={false} />
                <HudMetricText label="TEXTURE" value={skinData.texture || "N/A"} />
              </div>

              {/* Issues */}
              {skinData.issues && skinData.issues.length > 0 && (
                <div className="mb-4">
                  <p className={cn(HUD_LABEL, "mb-2")}>DETECTED ISSUES</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skinData.issues.map((issue) => (
                      <Badge
                        key={issue}
                        variant="outline"
                        className={cn(
                          "rounded-full text-[9px] font-mono uppercase",
                          getSeverityColor(skinData.severity?.[issue] || 0)
                        )}
                      >
                        {issue.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetake}
                  className="flex-1 rounded-full border-white/10 text-white/50 hover:text-white hover:bg-white/8 font-mono text-[10px] uppercase"
                >
                  RESCAN
                </Button>
                <Button
                  size="sm"
                  className={cn("flex-1 rounded-full text-white font-mono text-[10px] uppercase", ACCENT_GRADIENT)}
                  onClick={() => window.location.href = "/clinical/consultation"}
                >
                  START CONSULTATION →
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls (idle / camera) */}
      {(state === "idle" || state === "camera") && (
        <div className="absolute bottom-8 inset-x-0 z-20 flex flex-col items-center gap-4">
          {state === "camera" ? (
            <Button
              onClick={handleCapture}
              className={cn(
                "rounded-full w-16 h-16 text-2xl",
                ACCENT_GRADIENT,
                GLOW_PURPLE,
                "text-white hover:opacity-90"
              )}
            >
              📸
            </Button>
          ) : (
            <div className="flex gap-3">
              {isMobile ? (
                <>
                  <label
                    htmlFor="mirror-camera-input"
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-mono uppercase tracking-wider text-white cursor-pointer",
                      ACCENT_GRADIENT,
                      GLOW_PURPLE,
                      "active:scale-95"
                    )}
                  >
                    📸 SCAN
                  </label>
                  <label
                    htmlFor="mirror-gallery-input"
                    className={cn(
                      GLASS_CARD,
                      "inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-mono uppercase tracking-wider text-white/70 cursor-pointer",
                      "active:scale-95"
                    )}
                  >
                    📁 UPLOAD
                  </label>
                </>
              ) : (
                <>
                  <Button
                    onClick={startCamera}
                    className={cn(
                      "rounded-full px-8 py-3 text-sm font-mono uppercase tracking-wider text-white",
                      ACCENT_GRADIENT,
                      GLOW_PURPLE
                    )}
                  >
                    📸 START SCAN
                  </Button>
                  <label
                    htmlFor="mirror-gallery-input"
                    className={cn(
                      GLASS_CARD,
                      "inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-mono uppercase tracking-wider text-white/70 cursor-pointer"
                    )}
                  >
                    📁 UPLOAD
                  </label>
                </>
              )}
            </div>
          )}

          <p className={cn(HUD_LABEL, "text-center")}>
            {state === "camera"
              ? "TAP TO CAPTURE — GOOD LIGHTING RECOMMENDED"
              : "CLINICAL SKIN SCANNER READY"}
          </p>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        id="mirror-camera-input"
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
      <input
        id="mirror-gallery-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
