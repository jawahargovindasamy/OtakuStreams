import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Download, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Tv, 
  Sliders,
  Bell,
  RefreshCw,
  QrCode,
  ArrowRight,
  Info,
  Loader2
} from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";

const features = [
  {
    title: "Native Performance",
    description: "Built with Flutter for smooth 60fps scrolling, minimal resource usage, and clean Material 3 design.",
    icon: Cpu,
    color: "text-emerald-500 bg-emerald-500/10"
  },
  {
    title: "Picture-in-Picture (PiP)",
    description: "Minimize the player into a floating screen and watch anime episodes while multitasking on your phone.",
    icon: Tv,
    color: "text-indigo-500 bg-indigo-500/10"
  },
  {
    title: "Smart Gesture Controls",
    description: "Swipe vertically to adjust volume and brightness instantly, and double tap to skip or rewind.",
    icon: Sliders,
    color: "text-amber-500 bg-amber-500/10"
  },
  {
    title: "Real-Time Push Alerts",
    description: "Receive push notifications directly on your Android status bar the minute a new episode of your watchlist airs.",
    icon: Bell,
    color: "text-rose-500 bg-rose-500/10"
  },
  {
    title: "Cross-Device Sync",
    description: "Seamlessly synchronize your bookmarks, watchlist collections, and watch progress with the web client.",
    icon: RefreshCw,
    color: "text-sky-500 bg-sky-500/10"
  },
  {
    title: "Ad-Block Integration",
    description: "Enjoy a clean, fast experience with built-in native controls that prevent tracking and redirects.",
    icon: ShieldCheck,
    color: "text-teal-500 bg-teal-500/10"
  }
];

const installationSteps = [
  {
    step: "1",
    title: "Download APK File",
    description: "Click the download button or scan the QR code to save the official OtakuStreams.apk installation file onto your Android device."
  },
  {
    step: "2",
    title: "Enable Unknown Sources",
    description: "Navigate to Settings > Apps > Special App Access > Install Unknown Apps. Toggle permission to 'Allowed' for your web browser or file manager."
  },
  {
    step: "3",
    title: "Install the Application",
    description: "Open your device's Downloads folder, tap the downloaded OtakuStreams.apk file, and select 'Install' when prompted."
  },
  {
    step: "4",
    title: "Launch and Synchronize",
    description: "Open the OtakuStreams app, log in using your account credentials, and sync your watchlist profile instantly."
  }
];

const AppLanding = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const baseUrl = import.meta.env.VITE_OTAKUSTREAMS_BACKEND_URL || "https://otakustreams-backend-j3h5.onrender.com/api";
        const response = await fetch(`${baseUrl}/app/version?platform=android&versionCode=0`);
        if (!response.ok) throw new Error("Failed to fetch release info");
        const data = await response.json();
        if (data && data.latest) {
          setReleaseInfo(data.latest);
        }
      } catch (err) {
        console.error("Error fetching latest release info:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatestRelease();
  }, []);

  const fallbackRelease = {
    versionName: "1.3.4",
    artifact: {
      url: "https://github.com/jawahargovindasamy/OtakuStreams-Flutter/releases/download/v1.3.4/OtakuStreams.apk",
      name: "OtakuStreams.apk",
      size: 47447296,
      sha256: ""
    },
    releaseNotes: [
      "Renamed installation APK to OtakuStreams.apk for absolute parity",
      "Dynamic auto-updates synced directly with MongoDB backend",
      "Complete code lint fixes and performance optimizations"
    ]
  };

  const currentRelease = releaseInfo || fallbackRelease;

  const formatSize = (bytes) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (isDownloading) return;
    setIsDownloading(true);
    
    const downloadUrl = currentRelease.artifact.url;
    const fileName = currentRelease.artifact.name || "OtakuStreams.apk";
    
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Direct download failed, falling back to direct navigation:", err);
      window.location.href = downloadUrl;
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ScrollToTop />

      <main className="flex-1 w-full relative">
        {/* Animated Hero Header */}
        <div className="relative overflow-hidden bg-linear-to-b from-primary/5 via-transparent to-transparent border-b border-border/50 py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-center">
              
              {/* Left Hero Details */}
              <div className="space-y-6 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm font-semibold text-emerald-500"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  OtakuStreams for Android
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
                >
                  Stream Anime on the Go
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed mx-auto lg:mx-0"
                >
                  Download the OtakuStreams app for your Android phone to watch your favorite anime anywhere, keep track of what you're watching, and get instant updates when new episodes air.
                </motion.p>

                {/* Hero CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                >
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full sm:w-auto h-12 px-6 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/25 cursor-pointer hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download Latest APK
                      </>
                    )}
                  </button>
                  <a
                    href="#installation"
                    className="w-full sm:w-auto h-12 px-6 flex items-center justify-center gap-2 rounded-xl border border-border bg-card/45 hover:bg-card transition-all font-semibold hover:border-primary/30"
                  >
                    Installation Guide
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </motion.div>

                {/* Build Parameters info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-muted-foreground pt-2"
                >
                  <div>
                    <span className="font-bold text-foreground">Version:</span> v{currentRelease.versionName}
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  <div>
                    <span className="font-bold text-foreground">Size:</span> {formatSize(currentRelease.artifact.size)}
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  <div>
                    <span className="font-bold text-foreground">Target OS:</span> Android 8.0+
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  <div>
                    <span className="font-bold text-foreground">Format:</span> APK Package
                  </div>
                </motion.div>

                {/* Release Notes */}
                {currentRelease.releaseNotes && currentRelease.releaseNotes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="max-w-xl p-4 rounded-xl border border-border/40 bg-card/20 text-left space-y-2"
                  >
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      What's New in v{currentRelease.versionName}
                    </h4>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                      {currentRelease.releaseNotes.map((note, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Right Hero: QR Mock Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card/45 backdrop-blur-md border border-border/50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto"
              >
                <div className="p-4 bg-white rounded-2xl shadow-inner relative group cursor-pointer border border-border/20">
                  {/* Clean Mock QR Code using custom SVG */}
                  <svg className="w-40 h-40 text-neutral-900" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Corners */}
                    <path d="M5,5 h20 v20 h-20 z M9,9 h12 v12 h-12 z" fill="currentColor" />
                    <path d="M75,5 h20 v20 h-20 z M79,9 h12 v12 h-12 z" fill="currentColor" />
                    <path d="M5,75 h20 v20 h-20 z M9,79 h12 v12 h-12 z" fill="currentColor" />
                    {/* Small center code markers */}
                    <rect x="42" y="42" width="16" height="16" fill="currentColor" />
                    <rect x="46" y="46" width="8" height="8" fill="#ffffff" />
                    {/* Dotted fillers */}
                    <path d="M30,10 h5 v5 h-5 z M35,15 h5 v5 h-5 z M50,5 h10 v5 h-10 z M65,15 h5 v5 h-5 z M5,35 h5 v5 h-5 z M25,45 h5 v5 h-5 z M15,55 h5 v5 h-5 z M35,60 h5 v5 h-5 z" fill="currentColor" />
                    <path d="M45,75 h10 v5 h-10 z M55,85 h10 v5 h-10 z M75,55 h10 v5 h-10 z M85,65 h10 v5 h-10 z M65,75 h5 v5 h-5 z M85,85 h5 v5 h-5 z" fill="currentColor" />
                  </svg>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="font-bold text-sm text-foreground">Scan to Download</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px]">
                    Point your phone camera here to download the APK directly.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16 lg:py-20 max-w-7xl">
          <div className="text-center space-y-3 mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Why Choose OtakuStreams Mobile?
            </h2>
            <p className="max-w-xl text-sm sm:text-base text-muted-foreground mx-auto">
              We've tailored the Android application to bridge the gap between native hardware acceleration and beautiful visual presentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={i} 
                  className="bg-card/45 backdrop-blur-md border border-border/50 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 hover:border-primary/20 hover:bg-card transition-all duration-200"
                >
                  <div className={`p-2.5 rounded-xl w-fit ${feature.color}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sideloading Installation Guide */}
        <div id="installation" className="scroll-mt-24 border-t border-border/50 bg-linear-to-b from-primary/5 to-transparent py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
              
              {/* Left Column: Sideload explanation */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                  <Info className="w-3.5 h-3.5" />
                  Sideloading Tutorial
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  How to Install OtakuStreams APK
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Since OtakuStreams is a community-driven anime streaming directory client, it is distributed directly as an Android Package (APK) rather than via the Google Play Store.
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Installing a third-party APK is completely safe and only takes a few seconds. Follow our quick step-by-step walkthrough to get started.
                </p>

                <div className="p-4 rounded-xl border border-border/50 bg-card/30 flex items-start gap-3 mt-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Verified Package</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Our release builds are scanned for viruses, adware, and tracking codes. Only download from official sources.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Walkthrough steps */}
              <div className="space-y-4">
                {installationSteps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="flex gap-4 p-4 rounded-2xl border border-border/40 bg-card/20 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                      {step.step}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm sm:text-base text-foreground">
                        {step.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLanding;
