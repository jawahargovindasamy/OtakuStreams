import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import HomeSkeleton from "@/components/HomeSkeleton";
import ContinueWatchingSection from "@/components/sections/ContinueWatchingSection";
import TrendingSection from "@/components/sections/TrendingSection";
import PopularSection from "@/components/sections/PopularSection";
import NewReleasesSection from "@/components/sections/NewReleasesSection";
import TopRatedSection from "@/components/sections/TopRatedSection";
import GenreSection from "@/components/sections/GenreSection";
import ScheduleSection from "@/components/sections/ScheduleSection";
import MoviesSection from "@/components/sections/MoviesSection";
import WatchlistSection from "@/components/sections/WatchlistSection";
import RecentlyUpdatedSection from "@/components/sections/RecentlyUpdatedSection";

import { useData } from "@/context/data-provider";
import { useAuth } from "@/context/auth-provider";

const Home = () => {
  /* -------------------- HOOKS (ALWAYS FIRST) -------------------- */
  const { homedata, fetchHomedata } = useData();
  const { continueWatching } = useAuth();
  const location = useLocation();

  const [showAll, setShowAll] = useState(false);
  const [top10Animes, setTop10Animes] = useState("today");

  // Lazy fetch homedata if not already loaded
  useEffect(() => {
    if (!homedata) {
      fetchHomedata();
    }
  }, [homedata, fetchHomedata]);

  // Smooth scroll to section from navigation state or URL hash
  useEffect(() => {
    const targetSection = location.state?.scrollToSection || (window.location.hash ? window.location.hash.replace("#", "") : null);
    if (targetSection) {
      const element = document.getElementById(targetSection);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          if (window.location.hash) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }, 150);
      }
    }
  }, [location.state]);

  // Set document title for Home page
  useEffect(() => {
    document.title = "OtakuStreams — Watch Anime Online in HD";
  }, []);

  /* -------------------- DATA -------------------- */
  const data = homedata?.data;

  /* -------------------- LOADING STATE -------------------- */
  if (!data) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full">
          <HomeSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        <Hero spotlightAnimes={data.heroSpotlight} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 lg:space-y-10">

          {/* Band #2: Continue Watching Section */}
          <ContinueWatchingSection items={continueWatching} />

          {/* Band #3: Editorial Trending Section */}
          <TrendingSection animes={data.trendingAnimes} />

          {/* Band #4: Popular This Week Leaderboard Section */}
          <PopularSection animes={data.mostPopularAnimes} />

          {/* Band #5: New Releases Horizontal Snap Rail Section */}
          <NewReleasesSection animes={data.newReleaseAnimes} />

          {/* Band #6: Top Rated of All Time Bento Gallery Wall Section */}
          <TopRatedSection animes={data.topRatedAnimes} />

          {/* Band #7: Browse by Genre Color Doors Section */}
          <GenreSection />

          {/* Band #8: Airing Schedule Broadcast Board Section */}
          <ScheduleSection />

          {/* Band #9: Anime Movies Cinema Lobby Section */}
          <MoviesSection initialMovies={data.moviesAnimes} />

          {/* Band #10: Your Watchlist Personal Shelf Section */}
          <WatchlistSection />

          {/* Band #11: Recently Updated Release Feed Section */}
          <RecentlyUpdatedSection initialAnimes={data.recentlyUpdatedAnimes} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;