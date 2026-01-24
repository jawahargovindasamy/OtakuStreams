import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MediaCard from "./MediaCard";

const CardCarousel = ({ animes = [] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 2,
    dragFree: false,
  });

//   console.log(animes);
  

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <div className="relative w-full">
      {/* Embla viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Embla container */}
        <div className="flex gap-4">
          {animes.map((anime) => (
            <div
              key={anime.id}
              className="
                shrink-0
                basis-1/2
                md:basis-1/4
                lg:basis-1/6
              "
            >
              <MediaCard id={anime.id} jname={anime.jname} />
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
