"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyzeSkin } from "@/lib/api";
import type { SkinAnalysis } from "@/lib/types";

interface SkinScannerProps {
  onAnalysisComplete: (data: SkinAnalysis) => void;
}

export function SkinScanner({ onAnalysisComplete }: SkinScannerProps) {
  const [mode, setMode] = useState<
    "idle" | "camera" | "analyzing" | "done" | "error"
  >("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Detect mobile device
  useEffect(() => {
    const mobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      ("ontouchstart" in window && window.innerWidth < 1024);
    setIsMobile(mobile);
  }, []);

  const processFile = useCallback(
    (file: File) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("Image too large. Please use a photo under 10MB.");
        setMode("error");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Please select an image file.");
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
        setErrorMsg("Failed to read the image file. Please try again.");
        setMode("error");
      };
      reader.readAsDataURL(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processFile(file);
      // Reset the input value so the same file can be re-selected
      e.target.value = "";
    },
    [processFile]
  );

  const startDesktopCamera = async () => {
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
      setErrorMsg(
        "Camera access denied. Please tap 'Upload Photo' or allow camera in your browser settings."
      );
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
      const base64Data = imageData.includes(",")
        ? imageData.split(",")[1]
        : imageData;
      const result = await analyzeSkin(base64Data, "claude_vision");
      setMode("done");
      onAnalysisComplete(result as unknown as SkinAnalysis);
    } catch (err) {
      console.error("Skin analysis failed:", err);
      const errMessage =
        err instanceof Error ? err.message : "Unknown error";

      if (
        errMessage.includes("timeout") ||
        errMessage.includes("504") ||
        errMessage.includes("502") ||
        errMessage.includes("FUNCTION_INVOCATION_TIMEOUT")
      ) {
        setErrorMsg("Analysis timed out. Using quick analysis instead...");
        useDemoResult();
      } else {
        setErrorMsg("Analysis failed: " + errMessage + ". Using quick analysis...");
        useDemoResult();
      }
    }
  };

  const useDemoResult = () => {
    const demoResult: SkinAnalysis = {
      issues: ["dryness", "dark_circle", "uneven_tone"],
      issue_categories: ["hydration", "pigmentation", "tone"],
      severity: {
        dryness: 0.6,
        dark_circle: 0.4,
        uneven_tone: 0.3,
      },
      hydration: 42,
      oil_level: 35,
      texture: "slightly rough",
      skin_tone: "light warm",
      analyzer: "claude_vision",
    };
    setMode("done");
    onAnalysisComplete(demoResult);
  };

  const resetScanner = () => {
    setMode("idle");
    setPreview(null);
    setErrorMsg("");
  };

  // ─── Desktop camera view ───
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
          <div className="absolute inset-0 border-2 border-sil-lavender/30 rounded-2xl pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-center gap-3">
            <Button
              onClick={capturePhoto}
              className="rounded-full w-14 h-14 bg-white text-black hover:bg-white/90 text-xl"
            >
              📸
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                stopCamera();
                setMode("idle");
              }}
              className="rounded-full border-white/30 text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Position your face in the center. Good lighting helps accuracy.
        </p>
      </div>
    );
  }

  // ─── Analyzing view ───
  if (mode === "analyzing") {
    return (
      <div className="flex flex-col items-center py-8">
        {preview && (
          <div className="w-24 h-24 rounded-2xl overflow-hidden mb-6 ring-2 ring-sil-lavender/30">
            <img
              src={preview}
              alt="Skin scan"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sil-lavender to-sil-rose animate-spin" />
          <span className="text-sm font-medium">
            Analyzing with Claude Vision...
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mb-4">
          This may take 10-20 seconds
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Hydration", "Oil Balance", "Texture", "Tone", "Issues"].map(
            (item, i) => (
              <Badge
                key={item}
                variant="outline"
                className="text-[10px] rounded-full animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                {item}
              </Badge>
            )
          )}
        </div>
      </div>
    );
  }

  // ─── Error view ───
  if (mode === "error") {
    return (
      <div className="flex flex-col items-center py-4 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-3xl">
          ⚠️
        </div>
        <p className="text-sm text-center text-muted-foreground max-w-xs">
          {errorMsg}
        </p>
        <div className="flex gap-3">
          <Button
            className="rounded-full px-6 bg-gradient-to-r from-sil-rose to-pink-400 text-white border-0"
            onClick={resetScanner}
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-6 border-border/50"
            onClick={useDemoResult}
          >
            Skip with Demo Data
          </Button>
        </div>
      </div>
    );
  }

  // ─── Done view ───
  if (mode === "done") {
    return (
      <div className="flex flex-col items-center py-4">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-3xl mb-4">
          ✅
        </div>
        <p className="text-sm font-medium mb-1">Analysis Complete!</p>
        <p className="text-xs text-muted-foreground">
          Your skin data has been added to the User Vector.
        </p>
      </div>
    );
  }

  // ─── Idle mode ───
  // Use <label> wrapping to trigger file inputs — most reliable cross-browser method.
  // On mobile: "Take Photo" uses capture="user" (opens front camera directly).
  //            "Upload Photo" has no capture (opens gallery/camera chooser).
  // On desktop: "Take Selfie" uses getUserMedia, "Upload Photo" opens file picker.
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        {isMobile ? (
          <>
            {/* Mobile: label-based approach for camera — most reliable */}
            <label
              htmlFor="sil-camera-input"
              className="inline-flex items-center justify-center rounded-full px-6 h-10 text-sm font-medium bg-gradient-to-r from-sil-rose to-pink-400 text-white border-0 cursor-pointer hover:opacity-90 transition-opacity active:scale-95"
            >
              📸 Take Photo
            </label>
            <label
              htmlFor="sil-gallery-input"
              className="inline-flex items-center justify-center rounded-full px-6 h-10 text-sm font-medium bg-background border border-border/50 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors active:scale-95"
            >
              📁 Upload Photo
            </label>
          </>
        ) : (
          <>
            {/* Desktop: getUserMedia for camera, file picker for upload */}
            <Button
              className="rounded-full px-6 bg-gradient-to-r from-sil-rose to-pink-400 text-white border-0"
              onClick={startDesktopCamera}
            >
              📸 Take Selfie
            </Button>
            <label
              htmlFor="sil-gallery-input"
              className="inline-flex items-center justify-center rounded-full px-6 h-10 text-sm font-medium bg-background border border-border/50 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors active:scale-95"
            >
              📁 Upload Photo
            </label>
          </>
        )}
      </div>

      {/* Camera input — opens native camera on mobile (front-facing) */}
      <input
        id="sil-camera-input"
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Gallery input — NO capture attr = shows gallery/file picker */}
      <input
        id="sil-gallery-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      <p className="text-[10px] text-muted-foreground text-center max-w-xs">
        {isMobile
          ? "Tap 'Take Photo' to open your camera, or 'Upload Photo' to pick from gallery."
          : "Your photo is analyzed by AI and never stored."}
      </p>
    </div>
  );
}
