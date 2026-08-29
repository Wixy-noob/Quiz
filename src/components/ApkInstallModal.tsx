import React, { useState, useEffect } from "react";
import { Download, Smartphone, Check, Sparkles, X, Share2, Globe, ShieldCheck } from "lucide-react";

interface ApkInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkInstallModal: React.FC<ApkInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<"direct" | "instructions">("direct");

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback: show instructions
      setActiveTab("instructions");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl space-y-5">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">INSTALL APK / MOBILE APP</h3>
            <p className="text-xs text-slate-400">
              Install Madjuka Tensis & Landmark Tourism AR ke Android / HP Anda
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("direct")}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === "direct" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Direct Install (WebAPK)
          </button>
          <button
            onClick={() => setActiveTab("instructions")}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === "instructions"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Cara Install Manual
          </button>
        </div>

        {/* Tab 1: Direct Install */}
        {activeTab === "direct" ? (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>PWA Standalone & WebAPK Ready</span>
              </div>
              <p>
                Aplikasi ini mendukung instalasi native WebAPK. Setelah diinstall, aplikasi akan muncul
                di App Drawer / Home Screen HP Anda dengan icon mandiri dan performa kamera 60 FPS.
              </p>
            </div>

            <button
              onClick={handleInstallPwa}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 transition active:scale-95 text-sm"
            >
              <Download className="w-5 h-5" />
              <span>{isInstalled ? "Aplikasi Sudah Terpasang" : "KLIK UNTUK INSTALL KE HP (APK)"}</span>
            </button>
          </div>
        ) : (
          /* Tab 2: Manual Instructions */
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1.5">
              <span className="font-bold text-sky-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> 1. Google Chrome di Android:
              </span>
              <p>
                Buka menu titik tiga (⋮) di pojok kanan atas Chrome, lalu pilih{" "}
                <strong className="text-white">"Install app"</strong> atau{" "}
                <strong className="text-white">"Tambahkan ke Layar Utama"</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1.5">
              <span className="font-bold text-indigo-400 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" /> 2. Safari di iOS:
              </span>
              <p>
                Tekan tombol <strong className="text-white">Share</strong> (kotak panah ke atas), lalu
                pilih <strong className="text-white">"Add to Home Screen"</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-1.5">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 3. Keunggulan Install:
              </span>
              <p>
                Mode fullscreen tanpa address bar browser, akses kamera non-mirror langsung, dan
                offline caching.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-semibold"
          >
            Tutup & Kembali ke Aplikasi
          </button>
        </div>
      </div>
    </div>
  );
};
