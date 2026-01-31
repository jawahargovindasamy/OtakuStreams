import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import CardCarousel from "@/components/CardCarousel";
import VerticalList from "@/components/VerticalList";
import MediaCard from "@/components/MediaCard";
import DateCarousel from "@/components/Datecarousel";
import ScheduleEpisodeList from "@/components/ScheduleEpisodeList";

import SectionHeader from "@/components/SectionHeader";
import HomeSidebar from "@/components/HomeSidebar";
import HomeSkeleton from "@/components/HomeSkeleton";

import { useData } from "@/context/data-provider";

const Home = () => {
  /* -------------------- HOOKS (ALWAYS FIRST) -------------------- */
  const { homedata } = useData();
  
  const [showAll, setShowAll] = useState(false);
  const [scheduledAnimes, setScheduledAnimes] = useState([]);
  const [top10Animes, setTop10Animes] = useState("today");

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
        <Hero />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10 space-y-8 sm:space-y-10 lg:space-y-12">
          
          {/* Trending Section */}
          <section className="space-y-4 sm:space-y-5 w-full">
            <SectionHeader title="Trending" link="/trending" />
            <div className="w-full">
              <CardCarousel animes={data.trendingAnimes} showRank loop />
            </div>
          </section>

          {/* Grid Sections - Top Lists */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full">
            <VerticalList 
              anime={data.topAiringAnimes} 
              title="Top Airing" 
              link="/top-airing" 
            />
            <VerticalList 
              anime={data.mostPopularAnimes} 
              title="Most Popular" 
              link="/most-popular" 
            />
            <VerticalList 
              anime={data.mostFavoriteAnimes} 
              title="Most Favorite" 
              link="/most-favorite" 
            />
            <VerticalList 
              anime={data.latestCompletedAnimes} 
              title="Completed" 
              link="/completed" 
            />
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_380px] gap-6 sm:gap-8 lg:gap-10 w-full">
            
            {/* Main Column */}
            <div className="space-y-8 sm:space-y-10 min-w-0">
              
              {/* Latest Episodes */}
              <section className="space-y-4 sm:space-y-5 w-full">
                <SectionHeader 
                  title="Latest Episodes" 
                  icon 
                  link="/recently-updated" 
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 w-full">
                  {data.latestEpisodeAnimes.map((a) => (
                    <MediaCard key={a.id} id={a.id} jname={a.jname} />
                  ))}
                </div>
              </section>

              {/* Schedule Section */}
              <section className="space-y-4 sm:space-y-5 bg-card/30 rounded-2xl p-4 sm:p-6 border border-border/50 w-full">
                <SectionHeader title="Estimated Schedule" time />
                <DateCarousel onScheduleChange={setScheduledAnimes} />
                <ScheduleEpisodeList animes={scheduledAnimes} />
              </section>

              {/* Top Upcoming */}
              <section className="space-y-4 sm:space-y-5 w-full">
                <SectionHeader 
                  title="Top Upcoming" 
                  icon 
                  link="/top-upcoming" 
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 w-full">
                  {data.topUpcomingAnimes.map((a) => (
                    <MediaCard key={a.id} id={a.id} jname={a.jname} />
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block space-y-6 w-full">
              <div className="sticky top-24 space-y-6">
                <HomeSidebar
                  data={data}
                  showAll={showAll}
                  setShowAll={setShowAll}
                  top10Animes={top10Animes}
                  setTop10Animes={setTop10Animes}
                />
              </div>
            </aside>
          </div>

          {/* Sidebar - Mobile/Tablet */}
          <section className="block lg:hidden w-full">
            <HomeSidebar
              data={data}
              showAll={showAll}
              setShowAll={setShowAll}
              top10Animes={top10Animes}
              setTop10Animes={setTop10Animes}
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;