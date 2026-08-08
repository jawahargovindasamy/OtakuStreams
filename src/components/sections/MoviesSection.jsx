import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Play } from "lucide-react";
import PosterCard from "@/components/PosterCard";
import { Skeleton } from "@/components/ui/skeleton";
import { slugify } from "@/lib/utils";
import { useData } from "@/context/data-provider";

const MoviesSection = ({ initialMovies }) => {
  const navigate = useNavigate();
  const { fetchMoviesSection } = useData();

  const [movies, setMovies] = useState(initialMovies || []);
  const [isLoading, setIsLoading] = useState(!initialMovies || initialMovies.length === 0);

  useEffect(() => {
    let isMounted = true;

    if (initialMovies && initialMovies.length > 0) {
      if (isMounted) {
        setMovies(initialMovies);
        setIsLoading(false);
      }
      return;
    }

    const loadMovies = async () => {
      try {
        if (fetchMoviesSection) {
          const data = await fetchMoviesSection();
          if (isMounted && data && data.length > 0) {
            setMovies(data);
          }
        }
      } catch (err) {
        console.error("Failed to load movies section:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadMovies();

    return () => {
      isMounted = false;
    };
  }, [initialMovies, fetchMoviesSection]);

  if (isLoading) return <MoviesSkeleton />;
  if (!movies || movies.length === 0) return null;

  const featureMovie = movies[0];
  const runnerUpMovies = movies.slice(1, 5);

  return (
    <section id="movies" aria-labelledby="movies-title" className="w-full space-y-5 sm:space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em] font-sans">
          FEATURE LENGTH
        </div>
        <h2
          id="movies-title"
          className="text-2xl sm:text-3xl lg:text-[2rem] font-display font-bold text-foreground tracking-tight"
        >
          Anime movies
        </h2>
        <p className="text-sm text-muted-foreground font-sans max-w-2xl">
          One sitting, one story, no cliffhangers.
        </p>
      </div>

      {/* Cinema Lobby Layout: 1:1.1 Desktop Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4 sm:gap-6 w-full items-start">
        {/* Feature Presentation Marquee (Left Column) */}
        {featureMovie && <FeatureMarquee movie={featureMovie} />}

        {/* 2x2 Poster Grid (Right Column) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 sm:gap-5 w-full">
          {runnerUpMovies.map((movie, idx) => (
            <PosterCard key={movie.id || idx} anime={movie} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Feature Marquee Component for Cinema Billboard
const FeatureMarquee = ({ movie }) => {
  const navigate = useNavigate();

  const title =
    movie.title?.english ||
    movie.title?.romaji ||
    movie.title?.native ||
    movie.name ||
    "Movie Title";

  const animeId = movie.id || movie.idMal;
  const banner =
    movie.bannerImage ||
    movie.coverImage?.extraLarge ||
    movie.coverImage?.large ||
    movie.poster;
  const bgColor = movie.coverImage?.color || "var(--card)";
  const score = movie.averageScore || movie.rating || null;
  const duration = movie.duration || 120;
  const year = movie.seasonYear || movie.startDate?.year || movie.year || new Date().getFullYear();
  const rawDesc = movie.description || "";
  const synopsis = rawDesc ? rawDesc.replace(/<[^>]*>?/gm, "").trim() : "";

  const handleCardClick = () => {
    navigate(`/${slugify(title)}/${animeId}`);
  };

  return (
    <button
      type="button"
      onClick={handleCardClick}
      aria-label={`Watch ${title}`}
      className="relative group w-full min-h-[24rem] lg:min-h-[28rem] flex flex-col justify-end p-6 sm:p-8 text-left overflow-hidden rounded-3xl border border-white/10 shadow-soft cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ backgroundColor: bgColor }}
    >
      {/* Artwork Layer */}
      {banner && (
        <img
          src={banner}
          alt={`${title} banner`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      )}

      {/* Inset Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none z-10" />

      {/* Information Content (Bottom-Anchored) */}
      <div className="relative z-20 space-y-3.5 max-w-lg text-left pointer-events-none">
        {/* Eyebrow Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold tracking-wide backdrop-blur-md w-fit">
          <Film className="w-3 h-3 text-indigo-400 shrink-0" />
          Feature presentation
        </span>

        {/* Title (H3) */}
        <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white leading-tight tracking-tight">
          {title}
        </h3>

        {/* Synopsis */}
        {synopsis && (
          <p className="text-sm text-white/75 font-sans line-clamp-3 leading-relaxed">
            {synopsis}
          </p>
        )}

        {/* Chips Row (Score · Runtime · Year) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {score && (
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold font-mono">
              ★ {score}%
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold font-mono">
            {duration} min
          </span>
          {year && (
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold font-mono">
              {year}
            </span>
          )}
        </div>

        {/* Filled CTA Button */}
        <div className="pt-2 pointer-events-auto">
          <span className="min-h-11 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 active:scale-[0.98] text-white font-bold text-sm px-6 py-2.5 inline-flex items-center gap-2 shadow-lg transition-all cursor-pointer w-fit">
            <Play className="w-4 h-4 fill-current text-white shrink-0" />
            Watch film
          </span>
        </div>
      </div>
    </button>
  );
};

const MoviesSkeleton = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 w-full">
        <Skeleton className="h-[28rem] w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
          <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
          <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
          <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export default MoviesSection;
