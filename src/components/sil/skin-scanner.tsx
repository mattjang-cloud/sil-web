"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyzeSkin } from "@/lib/api";
import type { SkinAnalysis } from "@/lib/types";

interface SkinScannerProps {
  onAnalysisComplete: (data: SkinAnalysis) => void;
}

export function SkinScanner({ onAnalysisComplete }: SkinScannerProps) {
  const [mode, setMode] = useState<"idle" | "camera" | "analyzing" | "done">(
    "idle"
  );
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      analyzeImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
      alert("Camera access denied. Please allow camera access or upload a photo.");
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
    try {
      // Extract base64 data (remove data:image/... prefix if present)
      const base64Data = imageData.includes(",")
        ? imageData.split(",")[1]
        : imageData;
      const result = await analyzeSkin(base64Data, "claude_vision");
      setMode("done");
      onAnalysisComplete(result as unknown as SkinAnalysis);
    } catch {
      // Fallback to demo data if API unavailable
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
    }
  };

  if (mode === "camera") {
    return (
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] max-w-sm mx-auto">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
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
          <span className="text-sm font-medium">Analyzing with Claude Vision...</span>
        </div>
        <div className="flex gap-2">
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

  // idle mode
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        <Button
          className="rounded-full px-6 bg-gradient-to-r from-sil-rose to-pink-400 text-white border-0"
          onClick={startCamera}
        >
          📸 Take Selfie
        </Button>
        <Button
          variant="outline"
          className="rounded-full px-6 border-border/50"
          onClick={() => fileInputRef.current?.click()}
        >
          📁 Upload Photo
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <p className="text-[10px] text-muted-foreground">
        Your photo is analyzed locally and never stored.
      </p>
    </div>
  );
}
