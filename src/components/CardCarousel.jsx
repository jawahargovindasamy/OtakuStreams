import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MediaCard from "./MediaCard";

const CardCarousel = ({ animes = [], showRank = false, loop = false }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop,
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
    containScroll: false,
    breakpoints: {
      "(min-width: 640px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <div className="relative w-full group/carousel">
      {/* Embla viewport */}
      <div className="overflow-hidden px-1" ref={emblaRef}>
        {/* Embla container */}
        <div className="flex gap-3 sm:gap-4 lg:gap-5 touch-pan-y">
          {animes.map((anime, index) => (
            <div
              key={anime.id}
              className="shrink-0 basis-[45%] sm:basis-[30%] md:basis-[23%] lg:basis-[18%] xl:basis-[15%] min-w-0"
            >
              <MediaCard 
                id={anime.id} 
                jname={anime.jname} 
                rank={showRank ? index + 1 : null} 
                showRank={showRank} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation - Hidden on mobile, visible on hover for desktop */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 
                   h-8 w-8 sm:h-10 sm:w-10 
                   flex items-center justify-center
                   rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur-sm
                   border border-border/50
                   opacity-0 group-hover/carousel:opacity-100 transition-all duration-300
                   hover:bg-primary hover:text-primary-foreground hover:scale-110
                   focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                   disabled:opacity-0 disabled:cursor-not-allowed"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 
                   h-8 w-8 sm:h-10 sm:w-10 
                   flex items-center justify-center
                   rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur-sm
                   border border-border/50
                   opacity-0 group-hover/carousel:opacity-100 transition-all duration-300
                   hover:bg-primary hover:text-primary-foreground hover:scale-110
                   focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                   disabled:opacity-0 disabled:cursor-not-allowed"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  );
};

export default CardCarousel;