import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { useData } from "@/context/data-provider";
import CardCarousel from "@/components/CardCarousel";
import CarouselSkelton from "@/components/CarouselSkelton";
import Footer from "@/components/Footer";
import VerticalList from "@/components/VerticalList";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";

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

  // console.log(homedata);

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

  // console.log(homedata?.data.topAiringAnimes);


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
          <CardCarousel animes={homedata?.data.trendingAnimes} showRank={true} loop />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 my-10 mx-3">
        <div>
          <h1 className="text-[#ffbade] text-lg md:text-2xl font-bold mb-3">Top Airing</h1>
          <VerticalList anime={homedata?.data.topAiringAnimes} />
          <Link to="/top-airing" className="text-md md:text-lg mb-3 text-blue-300 hover:text-blue-400">
            <div className="flex gap-2 items-center mt-2">
              <span>View All</span>
              <MoveRight className="w-5 h-6" />
            </div>
          </Link>
        </div>
        <div>
          <h1 className="text-[#ffbade] text-lg md:text-2xl font-bold mb-3">Most Popular</h1>
          <VerticalList anime={homedata?.data.mostPopularAnimes} />
          <Link to="/most-popular" className="text-md md:text-lg mb-3 text-blue-300 hover:text-blue-400">
            <div className="flex gap-2 items-center mt-2">
              <span>View All</span>
              <MoveRight className="w-5 h-6" />
            </div>
          </Link>
        </div>
        <div>
          <h1 className="text-[#ffbade] text-lg md:text-2xl font-bold mb-3">Most Favorite</h1>
          <VerticalList anime={homedata?.data.mostFavoriteAnimes} />
          <Link to="/most-favorite" className="text-md md:text-lg mb-3 text-blue-300 hover:text-blue-400">
            <div className="flex gap-2 items-center mt-2">
              <span>View All</span>
              <MoveRight className="w-5 h-6" />
            </div>
          </Link>
        </div>
        <div>
          <h1 className="text-[#ffbade] text-lg md:text-2xl font-bold mb-3">Latest Completed</h1>
          <VerticalList anime={homedata?.data.latestCompletedAnimes} />
          <Link to="/completed" className="text-md md:text-lg mb-3 text-blue-300 hover:text-blue-400">
            <div className="flex gap-2 items-center mt-2">
              <span>View All</span>
              <MoveRight className="w-5 h-6" />
            </div>
          </Link>
        </div>
      </div>
      <div className="mt-10 mb-4 mx-6">
        <div className="flex items-center mb-4">
          <div className="bg-black dark:bg-white h-10 w-2 rounded-2xl"></div>
          <h1 className="text-2xl font-bold px-2">Latest Episode</h1>
        </div>
        {!homedata?.data?.latestEpisodeAnimes ? (
          <CarouselSkelton />
        ) : (
          <CardCarousel animes={homedata?.data.latestEpisodeAnimes} showRank={false} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
