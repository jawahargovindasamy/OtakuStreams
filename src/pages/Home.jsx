import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { useData } from "@/context/data-provider";
import MediaCard from "@/components/MediaCard";
import CardCarousel from "@/components/CardCarousel";
import CarouselSkelton from "@/components/CarouselSkelton";
import Footer from "@/components/Footer";

const Home = () => {


  const {
    homedata,
    // fetchazlistdata,
    // azlistdata,
    // fetchanimeinfo,
    // animeinfo,
    // searchdata,
    // searchsuggestions,
    // fetchsearchdata,
  } = useData();

  // console.log(homedata?.data.trendingAnimes);

  // useEffect(() => {
  // fetchazlistdata('other');

  // fetchanimeinfo('one-piece-100');

  // fetchsearchdata({
  //   q: "one piece",
  //   type: "tv",
  //   rated: "pg-13",
  // });
  // }, []);

  // console.log(azlistdata);

  // console.log(animeinfo);

  // console.log(searchdata);

  // console.log(searchsuggestions);

  console.log(homedata);


  return (
    <div>
      <Navbar />
      <Hero />
      <div className="mt-10 mx-6 ">
        <div className="flex items-center mb-4">
          <div className="bg-black dark:bg-white h-10 w-2 rounded-2xl"></div>
          <h1 className="text-2xl font-bold px-2">Trending</h1>
        </div>
        {!homedata?.data?.trendingAnimes ? (
          <CarouselSkelton />
        ) : (
          <CardCarousel animes={homedata?.data.trendingAnimes} />
        )}
      </div>
      <div className="mt-10 mb-4 mx-6">
        <div className="flex items-center mb-4">
          <div className="bg-black dark:bg-white h-10 w-2 rounded-2xl"></div>
          <h1 className="text-2xl font-bold px-2">Latest Episode</h1>
        </div>
        {!homedata?.data?.latestEpisodeAnimes ? (
          <CarouselSkelton />
        ) : (
          <CardCarousel animes={homedata?.data.latestEpisodeAnimes} />
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default Home;
