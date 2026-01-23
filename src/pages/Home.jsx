import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { useData } from "@/context/data-provider";
import MediaCard from "@/components/MediaCard";

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

  console.log(homedata?.data.trendingAnimes);

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

  return (
    <div>
      <Navbar />
      <Hero />
      <MediaCard/>
    </div>
  );
};

export default Home;
