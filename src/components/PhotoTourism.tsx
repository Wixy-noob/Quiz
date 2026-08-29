import React, { useState, useRef } from "react";
import { LandmarkRecognitionResult, LandmarkHistoryResult, LandmarkHotspot } from "../types";
import { globalAudioPlayer } from "../lib/audioPlayer";
import {
  Camera,
  Upload,
  Sparkles,
  Search,
  Volume2,
  VolumeX,
  ExternalLink,
  MapPin,
  Clock,
  Building,
  Info,
  Radio,
  Layers,
  Play,
  RotateCcw,
} from "lucide-react";

// Preset iconic landmark examples for instant demonstration
const PRESET_LANDMARKS = [
  {
    name: "Monas (National Monument)",
    city: "Jakarta",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=1000&auto=format&fit=crop&q=80",
  },
  {
    name: "Eiffel Tower",
    city: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1000&auto=format&fit=crop&q=80",
  },
  {
    name: "Borobudur Temple",
    city: "Magelang",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1596405835948-23395c52c921?w=1000&auto=format&fit=crop&q=80",
  },
  {
    name: "Colosseum",
    city: "Rome",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1000&auto=format&fit=crop&q=80",
  },
  {
    name: "Tokyo Tower",
    city: "Tokyo",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1000&auto=format&fit=crop&q=80",
  },
];

interface PhotoTourismProps {
  hoveredElementId: string | null;
  onPinchAction?: (targetId: string) => void;
}

export const PhotoTourism: React.FC<PhotoTourismProps> = ({ hoveredElementId, onPinchAction }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(PRESET_LANDMARKS[0].image);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);

  const [recognition, setRecognition] = useState<LandmarkRecognitionResult | null>(null);
  const [historyData, setHistoryData] = useState<LandmarkHistoryResult | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<LandmarkHotspot | null>(null);

  // Audio / Narration state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioFrequencies, setAudioFrequencies] = useState<number[]>(new Array(16).fill(0.1));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Analyze Landmark using Gemini 3.1 Pro Preview
  const handleAnalyzePhoto = async (imageSrc: string) => {
    setIsAnalyzing(true);
    setRecognition(null);
    setHistoryData(null);
    setActiveHotspot(null);
    globalAudioPlayer.stop();
    setIsPlayingAudio(false);

    try {
      // Convert image to base64 if it's a URL
      let base64Data = imageSrc;
      if (imageSrc.startsWith("http")) {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch("/api/landmark/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setRecognition(json.data);
        // Automatically fetch Grounded History & TTS narration clip
        fetchGroundedHistory(json.data);
      }
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Fetch History with Search Grounding via Gemini 3.5 Flash
  const fetchGroundedHistory = async (recog: LandmarkRecognitionResult) => {
    setIsFetchingHistory(true);
    try {
      const res = await fetch("/api/landmark/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landmarkName: recog.landmarkName,
          city: recog.city,
          country: recog.country,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setHistoryData({
          historyMarkdown: json.historyMarkdown,
          sources: json.sources || [],
        });

        // Trigger TTS narration for AR Clip
        generateTtsNarration(recog, json.historyMarkdown);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  // 3. Generate Audio Tour Guide TTS via Gemini 3.1 Flash TTS Preview
  const generateTtsNarration = async (recog: LandmarkRecognitionResult, historyText: string) => {
    setIsGeneratingTts(true);
    try {
      const script = `Welcome to ${recog.landmarkName} in ${recog.city}, ${recog.country}. ${recog.shortDescription} Constructed during the ${recog.era}, this ${recog.architecturalStyle} marvel stands as a testament to human cultural heritage.`;

      const res = await fetch("/api/landmark/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptText: script, voice: "Zephyr" }),
      });

      const json = await res.json();
      if (json.success && json.audioBase64) {
        // Auto play narration
        playNarrationAudio(json.audioBase64);
      }
    } catch (err) {
      console.error("TTS narration error:", err);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const playNarrationAudio = (audioBase64: string) => {
    setIsPlayingAudio(true);
    globalAudioPlayer.playBase64Pcm(
      audioBase64,
      24000,
      (freqs) => setAudioFrequencies(freqs),
      () => setIsPlayingAudio(false)
    );
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      globalAudioPlayer.stop();
      setIsPlayingAudio(false);
    }
  };

  // Handle local photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
        handleAnalyzePhoto(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
      {/* Header with Title & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700/60">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>PHOTO TOURISM & AR CLIP</span>
          </h2>
          <p className="text-xs text-slate-400">
            Take or upload landmark photo & let AI narrate history with AR audio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            id="btn-upload-photo"
            data-clickable-id="btn-upload-photo"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl border border-slate-700 text-xs font-semibold shadow transition active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Preset Landmark Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-[11px] text-slate-400 font-semibold shrink-0">Sample Cities:</span>
        {PRESET_LANDMARKS.map((preset, idx) => (
          <button
            key={idx}
            data-clickable-id={`preset-${idx}`}
            onClick={() => {
              setSelectedImage(preset.image);
              handleAnalyzePhoto(preset.image);
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium shrink-0 border transition-all ${
              selectedImage === preset.image
                ? "bg-sky-500/20 border-sky-400 text-sky-200"
                : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Main AR Landmark Viewport with Interactive Hotspots */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video flex items-center justify-center group shadow-2xl">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Landmark"
            className="w-full h-full object-cover select-none"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="text-center p-6 text-slate-500">
            <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Take or upload a photo to begin AR tour</p>
          </div>
        )}

        {/* Scan Line Animation during AI Recognition */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-sky-950/40 backdrop-blur-xs flex flex-col items-center justify-center">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent absolute top-0 animate-bounce shadow-[0_0_15px_#38bdf8]" />
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-sky-500/50 shadow-2xl text-center space-y-2">
              <Sparkles className="w-6 h-6 text-sky-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-white">AI Analyzing Landmark Structure...</p>
              <p className="text-[10px] text-sky-300 font-mono">Gemini 3.1 Pro Vision Engine</p>
            </div>
          </div>
        )}

        {/* Interactive AR Hotspots Overlay */}
        {recognition &&
          recognition.hotspots?.map((spot, i) => {
            const isHovered = hoveredElementId === `hotspot-${i}`;
            const isActive = activeHotspot?.title === spot.title;

            return (
              <div
                key={i}
                id={`hotspot-${i}`}
                data-clickable-id={`hotspot-${i}`}
                onClick={() => setActiveHotspot(spot)}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
                title={`${spot.title} (Pinch to inspect)`}
              >
                <div className="relative flex items-center justify-center">
                  <div
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                      isActive
                        ? "bg-emerald-500 border-white text-slate-950 scale-125 shadow-[0_0_15px_#10b981]"
                        : isHovered
                        ? "bg-amber-400 border-white text-slate-950 scale-110 shadow-[0_0_15px_#f59e0b] animate-pulse"
                        : "bg-sky-500/80 border-sky-200 text-white shadow-lg"
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </div>
                  {/* Hotspot Label Tooltip */}
                  <div className="absolute top-8 whitespace-nowrap px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-white shadow-md backdrop-blur-md pointer-events-none">
                    {spot.title}
                  </div>
                </div>
              </div>
            );
          })}

        {/* Audio Visualizer Wave Overlay when Voice Guide is Playing */}
        {isPlayingAudio && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-sky-500/50 shadow-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 animate-pulse">
              <Radio className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center text-[10px] text-sky-300 font-semibold mb-1">
                <span>AR Audio Narrator Active (Gemini TTS)</span>
                <span>24kHz Studio PCM</span>
              </div>
              {/* Equalizer frequency bars */}
              <div className="flex items-end gap-1 h-5">
                {audioFrequencies.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-sky-500 to-emerald-400 rounded-t transition-all duration-75"
                    style={{ height: `${Math.max(15, val * 100)}%` }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={toggleAudio}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Stop audio"
            >
              <VolumeX className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        )}
      </div>

      {/* Active Hotspot Detail Card */}
      {activeHotspot && (
        <div className="p-3.5 bg-sky-950/40 border border-sky-700/50 rounded-2xl text-xs space-y-1 animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-sky-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>AR Hotspot Detail: {activeHotspot.title}</span>
            </span>
            <button
              onClick={() => setActiveHotspot(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-200 leading-relaxed">{activeHotspot.description}</p>
        </div>
      )}

      {/* Landmark Recognition Details Card */}
      {recognition && (
        <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl space-y-3 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-sky-400">
                Landmark Identified
              </span>
              <h3 className="text-lg font-black text-white">{recognition.landmarkName}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>
                  {recognition.city}, {recognition.country}
                </span>
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Confidence: {recognition.confidence}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{recognition.shortDescription}</p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-400" /> Era / Year Built
              </span>
              <p className="font-semibold text-white mt-0.5">{recognition.era}</p>
            </div>
            <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Building className="w-3 h-3 text-indigo-400" /> Architectural Style
              </span>
              <p className="font-semibold text-white mt-0.5">{recognition.architecturalStyle}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Grounded History & Sources Section */}
      {historyData && (
        <div className="p-4 bg-slate-900/80 border border-slate-700/70 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-sky-400" />
              <span>GOOGLE SEARCH GROUNDED HISTORY</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Gemini 3.5 Flash Search</span>
          </div>

          <div className="prose prose-invert prose-xs text-slate-300 max-h-60 overflow-y-auto leading-relaxed whitespace-pre-line pr-1 text-xs">
            {historyData.historyMarkdown}
          </div>

          {/* Web Reference Sources */}
          {historyData.sources.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1.5">
                Verified Grounding Citations:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {historyData.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] font-medium border border-slate-700 transition"
                  >
                    <span className="truncate max-w-[140px]">{src.title}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
