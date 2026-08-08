import React, { useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  Settings as SettingsIcon,
  Languages,
  Bell,
  FolderX,
  Check,
  Sparkles,
  Tv,
  Pause,
  Bookmark,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const FOLDERS = [
  { key: "watching", label: "Watching", icon: Tv, description: "New episode alerts for active series" },
  { key: "onHold", label: "On-Hold", icon: Pause, description: "Notifications for paused anime" },
  { key: "planToWatch", label: "Plan to Watch", icon: Bookmark, description: "Upcoming release notifications" },
  { key: "completed", label: "Completed", icon: CheckCircle2, description: "OAVs and sequel announcements" },
  { key: "dropped", label: "Dropped", icon: XCircle, description: "Alerts for abandoned series" },
];

const Settings = () => {
  const { language, setLanguage, ignoredFolders, setIgnoredFolders, updateSettings } = useAuth();

  useEffect(() => {
    document.title = "Settings — OtakuStreams";
  }, []);

  const handleFolderToggle = (folder) => {
    const updated = {
      ...ignoredFolders,
      [folder]: !ignoredFolders[folder],
    };

    // Optimistic state update
    setIgnoredFolders(updated);

    // API update
    updateSettings({
      watching: updated.watching,
      on_hold: updated.onHold,
      plan_to_watch: updated.planToWatch,
      dropped: updated.dropped,
      completed: updated.completed,
    });

    const isIgnored = updated[folder];
    toast.success(
      isIgnored ? "Notifications muted" : "Notifications enabled",
      {
        description: `${FOLDERS.find((f) => f.key === folder)?.label} notification status updated.`,
      }
    );
  };

  const handleLanguageChange = (val) => {
    setLanguage(val);
    toast.success("Language preference updated", {
      description: `Anime titles will now display in ${val === "EN" ? "English" : "Japanese"}.`,
    });
  };

  const mutedCount = useMemo(() => {
    return Object.values(ignoredFolders || {}).filter(Boolean).length;
  }, [ignoredFolders]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Skip to Content Link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-glow focus:outline-none text-sm font-semibold"
      >
        Skip to content
      </a>

      {/* 1. Shared Sticky Navbar */}
      <header className="sticky top-0 z-40 w-full glass border-b border-glass-border">
        <Navbar />
      </header>

      <main id="main" className="flex-1 w-full pb-16 lg:pb-24">
        {/* 2. Library Hero Section (Matching Watchlist / Continue Watching design system) */}
        <section
          aria-labelledby="settings-hero-title"
          className="relative w-full overflow-hidden border-b border-border pt-28 pb-10 sm:pt-32 sm:pb-12 px-4 sm:px-6 lg:px-10"
        >
          {/* Aurora Glow Layer */}
          <div aria-hidden="true" className="aurora opacity-75 pointer-events-none" />

          <div className="relative z-10 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-6 lg:items-end">
            {/* Identity & Stats */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-primary font-sans flex items-center gap-1.5">
                <SettingsIcon className="h-3.5 w-3.5 text-primary" />
                <span>Preferences & controls</span>
              </div>
              <h1
                id="settings-hero-title"
                className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl font-sans text-foreground"
              >
                Settings
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base max-w-xl font-sans">
                Customize your viewing experience, set default anime title languages, and fine-tune your notification preferences.
              </p>

              {/* Stats Row (<dl>) */}
              <dl className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
                <div className="space-y-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground font-sans">
                    Title Language
                  </dt>
                  <dd className="font-display font-black text-2xl sm:text-3xl text-primary uppercase">
                    {language || "EN"}
                  </dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground font-sans">
                    Muted Folders
                  </dt>
                  <dd className="font-display font-black text-2xl sm:text-3xl text-foreground tabular-nums">
                    {mutedCount} / {FOLDERS.length}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* 3. Settings Cards Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
          {/* Section 1: Title Display Language */}
          <Card className="bg-card/50 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-8 shadow-soft hover:shadow-lift transition-all duration-300">
            <CardHeader className="p-0 pb-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Languages className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold font-sans text-foreground">
                    Anime Title Display
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-0.5">
                    Choose whether anime titles appear in English or original Japanese across your library and player.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <RadioGroup
                value={language}
                onValueChange={handleLanguageChange}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div
                  onClick={() => handleLanguageChange("EN")}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200",
                    language === "EN"
                      ? "border-primary bg-primary/10 shadow-glow text-foreground"
                      : "border-border/60 bg-surface/50 hover:border-border hover:bg-card"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="EN" id="EN" className="text-primary" />
                    <div>
                      <Label htmlFor="EN" className="cursor-pointer font-bold text-base font-sans block">
                        English
                      </Label>
                      <span className="text-xs text-muted-foreground font-sans">
                        e.g. Attack on Titan
                      </span>
                    </div>
                  </div>
                  {language === "EN" && (
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div
                  onClick={() => handleLanguageChange("JP")}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200",
                    language === "JP"
                      ? "border-primary bg-primary/10 shadow-glow text-foreground"
                      : "border-border/60 bg-surface/50 hover:border-border hover:bg-card"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="JP" id="JP" className="text-primary" />
                    <div>
                      <Label htmlFor="JP" className="cursor-pointer font-bold text-base font-sans block">
                        Japanese (日本語)
                      </Label>
                      <span className="text-xs text-muted-foreground font-sans">
                        e.g. Shingeki no Kyojin
                      </span>
                    </div>
                  </div>
                  {language === "JP" && (
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Section 2: Notification Controls */}
          <Card className="bg-card/50 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-8 shadow-soft hover:shadow-lift transition-all duration-300">
            <CardHeader className="p-0 pb-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold font-sans text-foreground">
                    Notification Categories
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-0.5">
                    Mute notifications for specific watchlist categories when new episodes drop.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-2 space-y-3">
              {FOLDERS.map((folder) => {
                const Icon = folder.icon;
                const isIgnored = Boolean(ignoredFolders[folder.key]);

                return (
                  <div
                    key={folder.key}
                    className={cn(
                      "flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200",
                      isIgnored
                        ? "border-destructive/40 bg-destructive/[0.04]"
                        : "border-border/60 bg-surface/50 hover:border-border hover:bg-card"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "p-2.5 rounded-xl transition-colors duration-200",
                          isIgnored
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {isIgnored ? <FolderX className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div>
                        <Label
                          htmlFor={folder.key}
                          className="font-bold text-base font-sans cursor-pointer block text-foreground"
                        >
                          {folder.label}
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          {isIgnored ? "Notifications muted for this category" : folder.description}
                        </p>
                      </div>
                    </div>

                    <Switch
                      id={folder.key}
                      checked={isIgnored}
                      onCheckedChange={() => handleFolderToggle(folder.key)}
                      className="data-[state=checked]:bg-destructive data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-700 cursor-pointer"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Automatic Save Indicator */}
          <div className="flex items-center justify-between text-xs text-muted-foreground/80 px-2 font-sans pt-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Settings automatically sync with your account</span>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Shared Footer */}
      <Footer />
    </div>
  );
};

export default Settings;