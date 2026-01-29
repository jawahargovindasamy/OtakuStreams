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
  const navigate = useNavigate();

  const maxInitial = 24;
  const [showAll, setShowAll] = useState(false);
  const [scheduledAnimes, setScheduledAnimes] = useState([]);
  const [top10Animes, setTop10Animes] = useState("today");

  /* -------------------- DATA -------------------- */
  const data = homedata?.data;

  const genresToShow = showAll
    ? data?.genres
    : data?.genres?.slice(0, maxInitial);

  const getGenreColor = (genre) => {
    let hash = 0;
    for (let i = 0; i < genre.length; i++) {
      hash = genre.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360},70%,70%)`;
  };

  /* -------------------- LOADING STATE -------------------- */
  if (!data) {
    return (
      <>
        <Navbar />
        <HomeSkeleton />
        <Footer />
      </>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <>
      <Navbar />
      <Hero />

      {/* Trending */}
      <div className="mt-10 mx-6">
        <SectionHeader title="Trending" />
        <CardCarousel animes={data.trendingAnimes} showRank loop />
      </div>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-10 mx-6">
        <VerticalList anime={data.topAiringAnimes} title="Top Airing" />
        <VerticalList anime={data.mostPopularAnimes} title="Most Popular" />
        <VerticalList anime={data.mostFavoriteAnimes} title="Most Favorite" />
        <VerticalList anime={data.latestCompletedAnimes} title="Completed" />
      </div>

      <div className="lg:grid lg:grid-cols-[5fr_2fr] gap-10 mx-6">
        {/* Main */}
        <div>
          <SectionHeader title="Latest Episode" icon link="/recently-updated" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {data.latestEpisodeAnimes.map((a) => (
              <MediaCard key={a.id} id={a.id} jname={a.jname} />
            ))}
          </div>

          <div className="mt-10">
            <SectionHeader title="Estimated Schedule" time />
            <DateCarousel onScheduleChange={setScheduledAnimes} />
            <ScheduleEpisodeList animes={scheduledAnimes} />
          </div>

          <div className="mt-10">
            <SectionHeader title="Top Upcoming" icon link="/top-upcoming" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {data.topUpcomingAnimes.map((a) => (
                <MediaCard key={a.id} id={a.id} jname={a.jname} />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <HomeSidebar
            data={data}
            navigate={navigate}
            genresToShow={genresToShow}
            getGenreColor={getGenreColor}
            showAll={showAll}
            setShowAll={setShowAll}
            maxInitial={maxInitial}
            top10Animes={top10Animes}
            setTop10Animes={setTop10Animes}
          />
        </div>
      </div>

      {/* Mobile + MD Sidebar */}
      <div className="block lg:hidden mx-6 mt-10">
        <HomeSidebar
          data={data}
          navigate={navigate}
          genresToShow={genresToShow}
          getGenreColor={getGenreColor}
          showAll={showAll}
          setShowAll={setShowAll}
          maxInitial={maxInitial}
          top10Animes={top10Animes}
          setTop10Animes={setTop10Animes}
        />
      </div>

      <Footer />
    </>
  );
};

export default Home;
