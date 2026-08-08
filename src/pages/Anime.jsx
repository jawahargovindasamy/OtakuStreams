import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import CinematicHero from "@/components/anime/CinematicHero";
import StoryFactsSection from "@/components/anime/StoryFactsSection";
import SeasonsSection from "@/components/SeasonsSection";
import CharactersGallery from "@/components/anime/CharactersGallery";
import ProductionStaffSection from "@/components/anime/ProductionStaffSection";
import FranchiseRelationsSection from "@/components/anime/FranchiseRelationsSection";
import RecommendationsSection from "@/components/anime/RecommendationsSection";
import MobileStickyWatchBar from "@/components/anime/MobileStickyWatchBar";
import AnimeSkeleton from "@/components/anime/AnimeSkeleton";

import { useData } from "@/context/data-provider";
import { useAuth } from "@/context/auth-provider";
import { slugify, getAnimeTitle } from "@/lib/utils";

const Anime = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { continueWatching, language } = useAuth();
  const { fetchanimeinfo, fetchepisodeinfo } = useData();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const heroWatchRef = useRef(null);
  const [showStickyWatch, setShowStickyWatch] = useState(false);

  const preload = location.state?.animeInfo;

  // Load Anime Details
  useEffect(() => {
    let mounted = true;

    const getAnimeInfo = async () => {
      if (preload) {
        setItem(preload);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchanimeinfo(id);
        if (mounted) {
          if (!data) {
            navigate("/home");
            return;
          }
          setItem(data);

          // Canonical Slug Redirection
          const media = data?.Media || data?.anime?.info;
          if (media?.id && isNaN(id)) {
            const actualId = media.id;
            const actualName = media.title?.english || media.name || "anime";
            const newUrl = `/${slugify(actualName)}/${actualId}`;
            navigate(newUrl, { replace: true });
          }
        }
      } catch (error) {
        console.error("Failed to fetch anime detail:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getAnimeInfo();

    return () => {
      mounted = false;
    };
  }, [id, fetchanimeinfo, preload, navigate]);

  // Mobile Sticky Watch Bar Observer
  useEffect(() => {
    if (!heroWatchRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyWatch(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(heroWatchRef.current);
    return () => observer.disconnect();
  }, [loading]);

  // Check Continue Watching Progress
  const progress = continueWatching.find((cw) => cw.animeId === id?.toString() || cw.animeId === Number(id));

  // Direct Watch Action Handler (No Episodes List UI)
  const handleWatchClick = useCallback(async () => {
    setIsPlaying(true);
    try {
      if (progress) {
        navigate(`/watch/${id}/${progress.currentEpisode}`, {
          state: { animeId: id, animeInfo: item, server: progress.server, dub: progress.dub },
        });
      } else {
        const epData = await fetchepisodeinfo(id);
        const firstEp = epData?.data?.episodes?.[0]?.number || 1;
        navigate(`/watch/${id}/${firstEp}`, {
          state: { animeId: id, animeInfo: item, episodeList: epData?.data },
        });
      }
    } catch (err) {
      console.error("Watch trigger failed:", err);
      // Fallback navigation to episode 1
      navigate(`/watch/${id}/1`, { state: { animeId: id, animeInfo: item } });
    } finally {
      setIsPlaying(false);
    }
  }, [id, progress, fetchepisodeinfo, navigate]);

  useEffect(() => {
    if (!item) return;
    const media = item?.Media || item?.anime?.info || item?.info || {};
    const title = getAnimeTitle(media, language);
    if (title) {
      document.title = `${title} — OtakuStreams`;
    } else {
      document.title = "Anime Details — OtakuStreams";
    }
  }, [item, language]);

  if (loading) {
    return <AnimeSkeleton />;
  }

  // Normalize Data from AniList GraphQL or homedata provider
  const media = item?.Media || item?.anime?.info || item?.info || {};
  const moreInfo = item?.anime?.moreInfo || {};
  const animeData = {
    ...media,
    moreInfo,
    format: media?.format || media?.type || media?.stats?.type || "TV",
    description: media?.description || item?.anime?.info?.description || "",
    poster: media?.coverImage?.extraLarge || media?.coverImage?.large || media?.poster || item?.anime?.info?.poster,
    bannerImage: media?.bannerImage || item?.anime?.info?.bannerImage || item?.anime?.info?.banner || item?.bannerImage || item?.banner || null,
  };

  // Extract Collections
  const characters =
    media?.characters?.edges ||
    item?.anime?.info?.charactersVoiceActors ||
    item?.charactersVoiceActors ||
    [];

  const staff =
    media?.staff?.edges ||
    item?.anime?.info?.staff ||
    item?.staff ||
    [];

  const relations =
    media?.relations?.edges ||
    item?.anime?.info?.relations ||
    item?.relations ||
    [];

  const recommendations =
    media?.recommendations?.nodes ||
    item?.recommendedAnimes ||
    [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Band 1: Cinematic Hero (min-h-[92svh]) */}
        <CinematicHero
          anime={animeData}
          onWatchClick={handleWatchClick}
          isPlaying={isPlaying}
          progress={progress}
          heroWatchRef={heroWatchRef}
        />

        {/* Band 2: Story & Essential Facts (1.3fr Story / 0.7fr Facts) */}
        <StoryFactsSection anime={animeData} />

        {/* Band 3: More Seasons (Chronological Franchise Timeline) */}
        {id && (
          <section className="w-full border-y border-border/70 bg-card/20 py-6 sm:py-8 text-foreground font-sans">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
              <SeasonsSection animeId={id} />
            </div>
          </section>
        )}

        {/* Band 4: Characters Gallery (Cast with Voice Actor Plates) */}
        {characters.length > 0 && <CharactersGallery characters={characters} />}

        {/* Band 4: Production & Staff */}
        {staff.length > 0 && <ProductionStaffSection staff={staff} />}

        {/* Band 5: Franchise & Relations */}
        {relations.length > 0 && <FranchiseRelationsSection relations={relations} />}

        {/* Band 6: Recommendations */}
        {recommendations.length > 0 && <RecommendationsSection recommendations={recommendations} />}
      </main>

      {/* Mobile Sticky Watch Bar */}
      <MobileStickyWatchBar
        anime={animeData}
        onWatchClick={handleWatchClick}
        show={showStickyWatch}
        progress={progress}
      />

      <Footer />
    </div>
  );
};

export default Anime;