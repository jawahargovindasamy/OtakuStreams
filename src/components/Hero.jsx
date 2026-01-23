import React, { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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

const Hero = () => {
  const { homedata, fetchepisodeinfo } = useData();

  const navigate = useNavigate();

  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      stopOnMouseEnter: true,
    }),
  );

  const handlePlay = async (id) => {
    const data = await fetchepisodeinfo(id);
    navigate(`/watch/${data.data.episodes[0].episodeId}`);
    // console.log(data.data.episodes[0].episodeId);

  };

  // console.log(homedata?.data.spotlightAnimes);

  return (
    <Carousel className="relative" plugins={[autoplay.current]}>
      <CarouselContent className="h-[calc(100vh-64px)]">
        {homedata?.data.spotlightAnimes.map((item) => (
          <CarouselItem key={item.id} className=" relative h-full">
            <img
              src={item.poster}
              alt={item.name}
              className="absolute  w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#2a2a3d]/70 to-[#2a2a3d]" />

            <div className="relative pb-8 z-10 flex h-full max-w-3xl flex-col justify-end px-8 md:px-16 text-white">
              <span className="mb-2 text-[#ffbade] text-sm md:text-lg font-semibold">
                #{item.rank} Spotlight
              </span>
              <h1 className="text-2xl line-clamp-2 md:text-5xl font-bold leading-tight">
                {item.name}
              </h1>

              <div className="mt-4 hidden md:flex flex-wrap items-center gap-2 text-sm text-gray-300">
                <span className="rounded flex items-center gap-1 bg-white/10 px-2 py-1">
                  <Monitor className="h-4 w-4" />
                  <span>{item.otherInfo[0]}</span>
                </span>
                <span className="rounded flex items-center gap-1 bg-white/10 px-2 py-1">
                  <Clock className="h-4 w-4" />
                  {item.otherInfo[1]}
                </span>
                <span className="rounded flex items-center gap-1 bg-white/10 px-2 py-1">
                  <Calendar className="h-4 w-4" />
                  {item.otherInfo[2]}
                </span>
                <span className="rounded flex items-center bg-white/10 px-2 py-1">
                  <Hd className="h-5 w-5" />
                </span>
                <div className="flex flex-wrap items-center">
                  <span className="rounded flex items-center gap-1 bg-[#b0e3af] text-[#111] px-2 py-1 mr-1">
                    <ClosedCaption className="h-4 w-4" />
                    {item.episodes?.sub}
                  </span>
                  {item.episodes?.dub && (
                    <span className="rounded flex items-center gap-1 bg-blue-500/20 px-2 py-1">
                      <Mic className="h-4 w-4" />
                      {item.episodes?.dub}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-6 hidden md:line-clamp-3 text-gray-300">
                {item.description}
              </p>

              <div className="mt-8 flex gap-4">
                <button
                  className=" flex items-center rounded-full bg-[#ffbade] text-black px-6 py-3 font-semibold hover:bg-[#f89abf] cursor-pointer"
                  onClick={() => handlePlay(item.id)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Now
                </button>
                <button
                  className="flex items-center justify-center rounded-full bg-white/10 px-6 py-3 hover:bg-white/20 cursor-pointer"
                  onClick={() => navigate(`/${item.id}`)}
                >
                  Detail
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 h-6 w-6 md:h-10 md:w-10 cursor-pointer" />
      <CarouselNext className="right-4 top-1/2 -translate-y-1/2 h-6 w-6 md:h-10 md:w-10 cursor-pointer" />
    </Carousel>
  );
};

export default Hero;
