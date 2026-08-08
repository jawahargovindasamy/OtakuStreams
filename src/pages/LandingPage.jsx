import React, { useState, useEffect } from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingTrendingRail from "@/components/landing/LandingTrendingRail";
import LandingGenreBand from "@/components/landing/LandingGenreBand";
import LandingStorySection from "@/components/landing/LandingStorySection";
import LandingCommunitySection from "@/components/landing/LandingCommunitySection";
import LandingFAQSection from "@/components/landing/LandingFAQSection";
import LandingClosingCTA from "@/components/landing/LandingClosingCTA";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import { useData } from "@/context/data-provider";

const LANDING_CACHE_KEY = "otaku_landing_trending_v1";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const LandingPage = () => {
  const { homedata, fetchLandingTrending } = useData();
  const [trendingList, setTrendingList] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    document.title = "OtakuStreams — Free Anime Streaming Platform";
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadTrending = async () => {
      if (homedata?.data?.trendingAnimes?.length > 0) {
        if (isMounted) setTrendingList(homedata.data.trendingAnimes);
        return;
      }

      if (fetchLandingTrending) {
        const items = await fetchLandingTrending();
        if (isMounted && items && items.length > 0) {
          setTrendingList(items);
        }
      }
    };

    loadTrending();

    return () => {
      isMounted = false;
    };
  }, [homedata, fetchLandingTrending]);

  // Global Keyboard Shortcut (⌘K / Ctrl K) to toggle Search Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 selection:text-primary relative">
      {/* Accessibility Skip Link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[110] px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg border border-primary-foreground/20 focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Landing Fixed Header */}
      <LandingHeader onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Content Landmark */}
      <main id="main" className="flex-1 w-full">
        {/* 1. Cinematic Hero */}
        <LandingHero
          spotlightAnime={trendingList[0]}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* 2. Trending Now Rail */}
        <LandingTrendingRail items={trendingList} />

        {/* 3. Browse by Feeling (Genre Band) */}
        <LandingGenreBand onOpenSearch={() => setIsSearchOpen(true)} />

        {/* 4. Platform Story */}
        <LandingStorySection />

        {/* 5. Community Proof */}
        <LandingCommunitySection />

        {/* 6. FAQ Accordion */}
        <LandingFAQSection />

        {/* 7. Closing CTA */}
        <LandingClosingCTA />
      </main>

      {/* Shared Footer (same component as Home) */}
      <Footer />

      {/* Shared Command Palette Modal (same component as Navbar) */}
      <CommandPalette
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
      />
    </div>
  );
};

export default LandingPage;