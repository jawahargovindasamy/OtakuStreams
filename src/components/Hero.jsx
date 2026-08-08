import React, { useEffect, useRef, useState, memo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useData } from "@/context/data-provider";
import { Play, Bookmark, Heart, ChevronLeft, ChevronRight, Check } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-provider";
import { slugify, getAnimeTitle } from "@/lib/utils";
import HeroSkelton from "./HeroSkelton";
import WatchlistDropdown from "./WatchlistDropdown";
import { toast } from "sonner";

const ANILIST_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(sort: TRENDING_DESC, type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], isAdult: false) {
      id
      idMal
      title {
        romaji
        english
      }
      bannerImage
      coverImage {
        extraLarge
        color
      }
      description(asHtml: false)
      genres
      averageScore
      format
      episodes
      seasonYear
      studios {
        edges {
          isMain
          node {
            name
          }
        }
        nodes {
          name
        }
      }
      nextAiringEpisode {
        episode
      }
    }
  }
}
`;

const getStudioName = (item) => {
  if (!item) return "Anime Studio";
  if (typeof item.studios === "string") return item.studios;
  if (Array.isArray(item.studios) && item.studios.length > 0) {
    const first = item.studios[0];
    if (typeof first === "string") return first;
    if (first?.name) return first.name;
  }
  const mainEdge = item.studios?.edges?.find((e) => e.isMain);
  if (mainEdge?.node?.name) return mainEdge.node.name;
  if (item.studios?.nodes?.[0]?.name) return item.studios.nodes[0].name;
  if (item.studios?.edges?.[0]?.node?.name) return item.studios.edges[0].node.name;
  return "Anime Studio";
};

const HeroSlide = memo(({ item, index, language, handlePlay, isPlaying, navigate }) => {
  const { user, continueWatching, watchlist, addWatchlist, removeWatchlist } = useAuth();
  const mediaId = item.id;
  const animeTitle = getAnimeTitle(item, language);
  const bannerImage = item.bannerImage || item.coverImage?.extraLarge;
  const studioName = getStudioName(item);
  const displayEpisodes = item.nextAiringEpisode ? `${item.nextAiringEpisode.episode - 1} episodes` : (item.episodes ? `${item.episodes} episodes` : "Ongoing");
  const cleanDescription = item.description ? item.description.replace(/<[^>]*>?/gm, '') : "";

  // 1. Watch Progress Check from Auth / Continue Watching Context
  const watchProgress = continueWatching?.find(
    (cw) => cw.animeId === mediaId.toString() || cw.animeId === mediaId || cw._id === mediaId
  );
  const currentEp = watchProgress?.currentEpisode || watchProgress?.episodeNumber;

  // 2. Watchlist Check from Auth / LocalStorage fallback
  const [localWatchlist, setLocalWatchlist] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem("otakustreams:watchlist") || "[]");
      return list.some((i) => (i.id || i.animeId) === mediaId);
    } catch {
      return false;
    }
  });

  const inWatchlist = user
    ? watchlist?.some((w) => w.animeId === mediaId.toString() || w.animeId === mediaId)
    : localWatchlist;

  // 3. Favourite Check from LocalStorage
  const [isFavourite, setIsFavourite] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem("otakustreams:favourites") || "[]");
      return list.some((i) => i.id === mediaId);
    } catch {
      return false;
    }
  });

  const handleCardClick = (e) => {
    // If click originated on or inside a button, do not navigate to details
    if (e.target.closest("button") || e.target.closest("a")) return;
    navigate(`/${slugify(animeTitle)}/${mediaId}`);
  };

  const toggleWatchlist = async (e) => {
    e.stopPropagation();
    if (user && addWatchlist) {
      try {
        if (inWatchlist) {
          const itemToRemove = watchlist.find((w) => w.animeId === mediaId.toString() || w.animeId === mediaId);
          if (itemToRemove) await removeWatchlist(itemToRemove._id);
          toast.success(`Removed ${animeTitle} from watchlist`);
        } else {
          await addWatchlist(mediaId.toString(), animeTitle, item.coverImage?.extraLarge, "plan_to_watch");
          toast.success(`Added ${animeTitle} to watchlist`);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // LocalStorage fallback for guests
      try {
        const list = JSON.parse(localStorage.getItem("otakustreams:watchlist") || "[]");
        let updated;
        if (localWatchlist) {
          updated = list.filter((i) => (i.id || i.animeId) !== mediaId);
          toast.success(`Removed ${animeTitle} from watchlist`);
        } else {
          updated = [...list, { id: mediaId, animeId: mediaId, title: animeTitle, poster: item.coverImage?.extraLarge }];
          toast.success(`Added ${animeTitle} to watchlist`);
        }
        localStorage.setItem("otakustreams:watchlist", JSON.stringify(updated));
        setLocalWatchlist(!localWatchlist);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleFavourite = (e) => {
    e.stopPropagation();
    try {
      const list = JSON.parse(localStorage.getItem("otakustreams:favourites") || "[]");
      let updated;
      if (isFavourite) {
        updated = list.filter((i) => i.id !== mediaId);
        toast.success(`Removed ${animeTitle} from favourites`);
      } else {
        updated = [...list, { id: mediaId, title: animeTitle }];
        toast.success(`Added ${animeTitle} to favourites`);
      }
      localStorage.setItem("otakustreams:favourites", JSON.stringify(updated));
      setIsFavourite(!isFavourite);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CarouselItem className="relative h-full pl-0">
      {/* Full-bleed Backdrop Image */}
      <div className="absolute inset-0 overflow-hidden bg-background">
        <img
          src={bannerImage}
          alt={animeTitle}
          className="h-full w-full object-cover object-center transition-transform duration-1000 scale-100 opacity-75 sm:opacity-90"
        />
        
        {/* Scrim Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-full flex flex-col justify-center pt-14 sm:pt-20 pb-12 sm:pb-16">
        
        {/* Left-Anchored Glass Card (Clickable to navigate to anime details) */}
        <div 
          onClick={handleCardClick}
          className="w-full max-w-xl lg:max-w-2xl bg-surface/85 backdrop-blur-2xl border border-border/80 hover:border-primary/50 rounded-2xl sm:rounded-[22px] shadow-lift p-4 sm:p-6 lg:p-8 space-y-2.5 sm:space-y-4 transition-all cursor-pointer group"
        >
          
          {/* Eyebrow Row: Spotlight Badge + Format/Status */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full brand-gradient text-white text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider shadow-xs">
              #{index + 1} SPOTLIGHT
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {item.format ? item.format.replace("_", " ") : "TV"} · Airing
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-xl sm:text-3xl lg:text-4xl font-extrabold text-foreground leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
            {animeTitle}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-medium">
            {item.averageScore && (
              <span className="text-success font-bold flex items-center gap-1">
                ★ {item.averageScore}%
              </span>
            )}
            {item.seasonYear && <span className="text-muted-foreground">{item.seasonYear}</span>}
            <span className="text-muted-foreground">{displayEpisodes}</span>
            {studioName && <span className="text-muted-foreground">{studioName}</span>}
          </div>

          {/* Synopsis */}
          <p className="text-subtle text-xs sm:text-sm leading-relaxed line-clamp-2 font-sans">
            {cleanDescription || "An exciting new anime season full of romance, comedy, and unforgettable slice of life moments."}
          </p>

          {/* Genre Chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {item.genres?.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-2 py-0.5 rounded-full bg-elevated border border-border/50 text-subtle text-[10px] sm:text-[11px] font-sans font-medium"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1.5">
            {/* Primary CTA: Watch Now / Continue Ep N */}
            <button
              disabled={isPlaying}
              onClick={(e) => {
                e.stopPropagation();
                handlePlay(mediaId);
              }}
              className="h-9 sm:h-10 px-4 sm:px-5 rounded-full brand-gradient text-white font-sans font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-glow hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-70"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {isPlaying
                  ? "Loading..."
                  : currentEp
                  ? `Continue Ep ${currentEp}`
                  : "Watch now"}
              </span>
            </button>

            {/* Secondary CTA: Watchlist Dropdown (5 Categories + Remove) */}
            <WatchlistDropdown
              animeId={mediaId}
              animeTitle={animeTitle}
              animeImage={item.coverImage?.extraLarge || bannerImage}
              align="start"
              side="bottom"
            >
              <button
                type="button"
                className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-full font-sans font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border ${
                  inWatchlist
                    ? "bg-primary/10 border-primary text-primary"
                    : "glass hover:bg-elevated border-border text-foreground"
                }`}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{inWatchlist ? "In watchlist" : "Add to watchlist"}</span>
              </button>
            </WatchlistDropdown>

            {/* Favourite Icon Button */}
            <button
              onClick={toggleFavourite}
              aria-label="Add to favourites"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full glass border border-border flex items-center justify-center transition-all cursor-pointer ${
                isFavourite ? "text-rose-500 border-rose-500/50 bg-rose-500/10" : "text-subtle hover:text-foreground hover:bg-elevated"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavourite ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          </div>

        </div>

      </div>
    </CarouselItem>
  );
});

HeroSlide.displayName = "HeroSlide";

const Hero = ({ spotlightAnimes }) => {
  const { fetchepisodeinfo, fetchanimeinfo, fetchLandingTrending } = useData();
  const { continueWatching, language } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [trendingAnimes, setTrendingAnimes] = useState(spotlightAnimes || []);
  const [isLoading, setIsLoading] = useState(!spotlightAnimes || spotlightAnimes.length === 0);
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);

  const navigate = useNavigate();

  const autoplay = useRef(
    Autoplay({
      delay: 8000,
      stopOnMouseEnter: true,
    })
  );

  useEffect(() => {
    let isMounted = true;

    if (spotlightAnimes && spotlightAnimes.length > 0) {
      if (isMounted) {
        setTrendingAnimes(spotlightAnimes);
        setIsLoading(false);
      }
      return;
    }

    const fetchTrending = async () => {
      try {
        if (fetchLandingTrending) {
          const items = await fetchLandingTrending();
          if (isMounted && items && items.length > 0) {
            setTrendingAnimes(items);
          }
        }
      } catch (err) {
        console.error("Failed to fetch trending animes from DataContext", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTrending();

    return () => {
      isMounted = false;
    };
  }, [spotlightAnimes, fetchLandingTrending]);

  const handlePlay = async (id) => {
    setIsPlaying(true);
    try {
      const animeInfo = await fetchanimeinfo(id);
      const data = await fetchepisodeinfo(id);
      if (data?.data?.episodes?.length > 0) {
        const progress = continueWatching?.find(
          (item) => item.animeId === id.toString() || item.animeId === id
        );
        const episodeToPlay = progress
          ? `/watch/${id}/${progress.currentEpisode}`
          : `/watch/${id}/${data.data.episodes[0].number}`;

        navigate(episodeToPlay, {
          state: {
            animeId: id,
            episodeList: data.data,
            animeInfo,
            server: progress?.server,
            dub: progress?.dub,
          },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (isLoading || !trendingAnimes.length) return <HeroSkelton />;

  return (
    <div className="relative w-full overflow-hidden">
      <Carousel
        className="relative w-full"
        plugins={[autoplay.current]}
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        {/* Mobile height reduced to ~480px-520px for compact viewport fit */}
        <CarouselContent className="h-[490px] sm:h-[580px] lg:h-[88vh] min-h-[460px] max-h-[760px] ml-0">
          {trendingAnimes.map((item, index) => (
            <HeroSlide
              key={item.id}
              item={item}
              index={index}
              language={language}
              handlePlay={handlePlay}
              isPlaying={isPlaying}
              navigate={navigate}
            />
          ))}
        </CarouselContent>

        {/* Navigation Controls & Progress Indicators Bar */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-0 right-0 z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center gap-3 sm:gap-4">
            
            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass border border-border text-foreground hover:bg-elevated flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass border border-border text-foreground hover:bg-elevated flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* 5 Slide Progress Bar Ticks */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {trendingAnimes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => api?.scrollTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === current
                      ? "w-6 sm:w-8 brand-gradient shadow-glow"
                      : "w-3 sm:w-4 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                  aria-label={`Go to spotlight ${idx + 1}`}
                />
              ))}
            </div>

          </div>
        </div>
      </Carousel>
    </div>
  );
};

export default Hero;