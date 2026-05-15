import React, { useEffect, useRef, useState, memo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useData } from "@/context/data-provider";
import { Play, ChevronRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-provider";
import { slugify } from "@/lib/utils";
import HeroSkelton from "./HeroSkelton";

const ANILIST_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(sort: TRENDING_DESC, type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], isAdult: false) {
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
      nextAiringEpisode {
        episode
      }
    }
  }
}
`;

const HeroSlide = memo(({ item, index, language, handlePlay, isPlaying, navigate }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const { fetchanimeinfo } = useData();

  const mediaId = item.id;
  const animeTitle = language === "EN" ? (item.title.english || item.title.romaji) : (item.title.romaji || item.title.english);
  const bannerImage = item.bannerImage || item.coverImage?.extraLarge;
  const accentColor = item.coverImage?.color || "hsl(var(--primary))";
  const displayEpisodes = item.nextAiringEpisode ? item.nextAiringEpisode.episode - 1 : item.episodes;

  const handleDetails = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    try {
      const data = await fetchanimeinfo(mediaId);
      if (data) {
        navigate(`/${slugify(animeTitle)}/${mediaId}`, { state: { animeInfo: data } });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <CarouselItem className="relative h-full pl-0">
      {/* Background Image with proper object coverage */}
      <div className="absolute inset-0 overflow-hidden bg-background">
        <img
          src={bannerImage}
          alt={animeTitle}
          className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105 opacity-60 sm:opacity-100"
        />
        {/* Multi-layered gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent dark:from-background dark:via-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent dark:from-background/95 dark:via-background/50" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex h-full items-end pb-8 sm:pb-12 lg:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-2xl lg:max-w-3xl space-y-3 sm:space-y-4 lg:space-y-6">
            
            {/* Title */}
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight text-foreground drop-shadow-lg line-clamp-2 sm:line-clamp-2">
              {animeTitle}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-base font-medium text-muted-foreground drop-shadow-sm">
              {[
                item.averageScore && <span key="score" style={{ color: accentColor }} className="font-bold">{item.averageScore}%</span>,
                item.seasonYear && <span key="year">{item.seasonYear}</span>,
                item.format && <span key="format">{item.format.replace('_', ' ')}</span>,
                displayEpisodes && <span key="episodes">{displayEpisodes} Episodes</span>,
              ].filter(Boolean).map((element, index, array) => (
                <React.Fragment key={index}>
                  {element}
                  {index < array.length - 1 && <span className="text-muted-foreground/60 text-xs sm:text-sm">•</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Description */}
            <div className="hidden lg:block">
              <p 
                className="text-base text-muted-foreground/90 line-clamp-3 max-w-prose leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <Button
                disabled={isPlaying || isNavigating}
                onClick={() => handlePlay(mediaId)}
                style={{ backgroundColor: accentColor, borderColor: accentColor }}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all duration-300 hover:brightness-110 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isPlaying ? (
                  <>
                    <Spinner className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current transition-transform duration-300 group-hover:scale-110" />
                    <span>
                      {item.progress ? `Continue Ep ${item.progress.currentEpisode}` : 'Watch Now'}
                    </span>
                  </>
                )}
              </Button>

              <Button
                disabled={isNavigating || isPlaying}
                onClick={handleDetails}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-secondary/80 px-5 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-secondary-foreground backdrop-blur-md ring-1 ring-border/50 transition-all duration-300 hover:bg-secondary hover:ring-border hover:gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isNavigating ? (
                  <>
                    <Spinner className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Details</span>
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CarouselItem>
  );
});
HeroSlide.displayName = 'HeroSlide';

const Hero = () => {
  const { fetchepisodeinfo, fetchanimeinfo } = useData();
  const { continueWatching, language } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [trendingAnimes, setTrendingAnimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);

  const navigate = useNavigate();

  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      stopOnMouseEnter: true,
    }),
  );

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const cachedStr = sessionStorage.getItem("hero_trending_animes");
        if (cachedStr) {
           const parsed = JSON.parse(cachedStr);
           if (Date.now() - parsed.timestamp < 1000 * 60 * 60 * 5) {
              setTrendingAnimes(parsed.data);
              setIsLoading(false);
              return;
           }
        }

        const response = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query: ANILIST_QUERY,
            variables: { page: 1, perPage: 15 }
          })
        });
        const json = await response.json();
        if (json.data && json.data.Page && json.data.Page.media) {
          const mediaWithProgress = json.data.Page.media.map(media => {
            const progress = continueWatching.find(pw => pw.animeId === media.id.toString());
            return { ...media, progress };
          });
          setTrendingAnimes(mediaWithProgress);
          try {
             sessionStorage.setItem("hero_trending_animes", JSON.stringify({
                data: mediaWithProgress,
                timestamp: Date.now()
             }));
          } catch(e) {}
        }
      } catch (err) {
        console.error("Failed to fetch trending animes from AniList", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handlePlay = async (id) => {
    setIsPlaying(true);
    try {
      const animeInfo = await fetchanimeinfo(id);
      const data = await fetchepisodeinfo(id);
      if (data?.data?.episodes?.length > 0) {
        const progress = continueWatching.find((item) => item.animeId === id);
        const episodeToPlay = progress
          ? `/watch/${id}/${progress.currentEpisode}`
          : `/watch/${id}/${data.data.episodes[0].number}`;

        navigate(episodeToPlay, {
          state: {
            animeId: id,
            episodeList: data.data,
            animeInfo
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
    <Carousel
      className="relative w-full"
      plugins={[autoplay.current]}
      setApi={setApi}
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent className="h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[calc(100vh-80px)] ml-0">
        {trendingAnimes.map((item, index) => {
          const progress = continueWatching.find(pw => pw.animeId === item.id.toString());
          return (
            <HeroSlide 
              key={item.id} 
              item={{ ...item, progress }} 
              index={index}
              language={language}
              handlePlay={handlePlay}
              isPlaying={isPlaying}
              navigate={navigate}
            />
          );
        })}
      </CarouselContent>

      {/* Navigation Buttons */}
      <CarouselPrevious className="left-2 sm:left-4 h-8 w-8 sm:h-12 sm:w-12 rounded-full border-border/50 bg-background/20 text-foreground backdrop-blur-md hover:bg-background/40 hover:border-border transition-all duration-200" />
      <CarouselNext className="right-2 sm:right-4 h-8 w-8 sm:h-12 sm:w-12 rounded-full border-border/50 bg-background/20 text-foreground backdrop-blur-md hover:bg-background/40 hover:border-border transition-all duration-200" />

      {/* Progress Indicators */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:gap-2">
        {trendingAnimes.map((_, idx) => (
          <button
            key={idx}
            onClick={() => api?.scrollTo(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === current
                ? "w-6 sm:w-8 bg-primary"
                : "w-1.5 sm:w-2 bg-foreground/30 hover:bg-foreground/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </Carousel>
  );
};

export default Hero;