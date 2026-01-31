import React, { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner"

import { useData } from "@/context/data-provider";
import {
  Calendar,
  ChevronRight,
  Clock,
  ClosedCaption,
  Hd,
  Mic,
  Monitor,
  Play,
} from "lucide-react";

import Autoplay from "embla-carousel-autoplay";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-provider";
import HeroSkelton from "./HeroSkelton";

const Hero = () => {
  const { homedata, fetchepisodeinfo } = useData();
  const { language } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);

  const navigate = useNavigate();

  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      stopOnMouseEnter: true,
    }),
  );

  const isLoading = !homedata || !homedata?.data?.spotlightAnimes?.length;

  if (isLoading) return (<HeroSkelton />);

  const handlePlay = async (id) => {
    setIsPlaying(true);
    try {
      const data = await fetchepisodeinfo(id);
      navigate(`/watch/${data.data.episodes[0].episodeId}`);
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  // Update current slide index
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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
        {homedata?.data.spotlightAnimes.map((item) => (
          <CarouselItem key={item.id} className="relative h-full pl-0">
            {/* Background Image with proper object coverage */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={item.poster}
                alt={item.name}
                className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              {/* Multi-layered gradient for better text readability and theme adaptability */}
              <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent dark:from-background dark:via-background/40" />
              <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/40 to-transparent dark:from-background/95 dark:via-background/50" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex h-full items-end pb-8 sm:pb-12 lg:pb-16">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-2xl lg:max-w-3xl space-y-3 sm:space-y-4 lg:space-y-6">
                  {/* Rank Badge */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs sm:text-sm font-bold text-primary ring-1 ring-primary/20 backdrop-blur-sm">
                    <span className="text-primary">#{item.rank}</span>
                    <span className="text-primary/80">Spotlight</span>
                  </span>

                  {/* Title */}
                  <h1 className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight text-foreground drop-shadow-lg line-clamp-2 sm:line-clamp-2">
                    {language === "EN" ? item.name : item.jname}
                  </h1>

                  {/* Meta Info - Responsive visibility */}
                  <div className="hidden sm:flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 rounded-md bg-secondary/80 px-2.5 py-1 text-secondary-foreground backdrop-blur-sm ring-1 ring-border/50">
                      <Monitor className="h-3.5 w-3.5" />
                      <span className="font-medium">{item.otherInfo[0]}</span>
                    </span>
                    <span className="flex items-center gap-1.5 rounded-md bg-secondary/80 px-2.5 py-1 text-secondary-foreground backdrop-blur-sm ring-1 ring-border/50">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-medium">{item.otherInfo[1]}</span>
                    </span>
                    <span className="flex items-center gap-1.5 rounded-md bg-secondary/80 px-2.5 py-1 text-secondary-foreground backdrop-blur-sm ring-1 ring-border/50">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-medium">{item.otherInfo[2]}</span>
                    </span>
                    <span className="flex items-center rounded-md bg-secondary/80 px-2 py-1 text-secondary-foreground backdrop-blur-sm ring-1 ring-border/50">
                      <Hd className="h-4 w-4" />
                    </span>
                    
                    {/* Episode Counts */}
                    <div className="flex items-center gap-1.5">
                      {item.episodes?.sub > 0 && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs ring-1 ring-emerald-500/20">
                          <ClosedCaption className="h-3.5 w-3.5" />
                          {item.episodes.sub}
                        </span>
                      )}
                      {item.episodes?.dub > 0 && (
                        <span className="flex items-center gap-1 rounded-md bg-blue-500/15 px-2.5 py-1 text-blue-600 dark:text-blue-400 font-semibold text-xs ring-1 ring-blue-500/20">
                          <Mic className="h-3.5 w-3.5" />
                          {item.episodes.dub}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description - Tablet and up */}
                  <p className="hidden md:block text-sm lg:text-base text-muted-foreground/90 line-clamp-2 md:line-clamp-3 lg:line-clamp-3 max-w-prose leading-relaxed">
                    {item.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                    <Button
                      disabled={isPlaying}
                      onClick={() => handlePlay(item.id)}
                      className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-5 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {isPlaying ? (
                        <>
                          <Spinner className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current transition-transform duration-300 group-hover:scale-110" />
                          <span>Watch Now</span>
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => navigate(`/${item.id}`)}
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-secondary/80 px-5 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-secondary-foreground backdrop-blur-md ring-1 ring-border/50 transition-all duration-300 hover:bg-secondary hover:ring-border hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span>Details</span>
                      <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Navigation Buttons - Responsive sizing and positioning */}
      <CarouselPrevious className="left-2 sm:left-4 h-8 w-8 sm:h-12 sm:w-12 rounded-full border-border/50 bg-background/20 text-foreground backdrop-blur-md hover:bg-background/40 hover:border-border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring" />
      <CarouselNext className="right-2 sm:right-4 h-8 w-8 sm:h-12 sm:w-12 rounded-full border-border/50 bg-background/20 text-foreground backdrop-blur-md hover:bg-background/40 hover:border-border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring" />
      
      {/* Progress Indicators */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:gap-2">
        {homedata?.data.spotlightAnimes.map((_, idx) => (
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