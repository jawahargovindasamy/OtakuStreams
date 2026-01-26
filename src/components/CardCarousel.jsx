import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MediaCard from "./MediaCard";
import { useNavigate } from "react-router-dom";

const CardCarousel = ({ animes = [], showRank = false, loop=false  }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop,
    align: "start",
    slidesToScroll: 2,
    dragFree: false,
  });

  const navigate = useNavigate();

//   console.log(animes);
  

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <div className="relative w-full">
      {/* Embla viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Embla container */}
        <div className="flex gap-4">
          {animes.map((anime,index) => (
            <div
              key={anime.id}
              className="
                shrink-0
                basis-1/2
                md:basis-1/4
                lg:basis-1/6
              "
            >
              <MediaCard id={anime.id} jname={anime.jname} rank={showRank ? index + 1 : null} showRank={showRank} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full z-10 cursor-pointer"
      >
        <ChevronLeft />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full z-10 cursor-pointer"
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default CardCarousel;
