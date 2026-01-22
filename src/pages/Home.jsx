import { useTheme } from "@/context/theme-provider";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-provider";
import Navbar from "@/components/Navbar";

const Home = () => {
  const [count, setCount] = useState(0);

  const { theme, setTheme } = useTheme();
  const {
    homedata,
    fetchazlistdata,
    azlistdata,
    fetchanimeinfo,
    animeinfo,
    searchdata,
    searchsuggestions,
    fetchsearchdata,
  } = useData();

  // console.log(homedata);

  useEffect(() => {
    // fetchazlistdata('other');
    
    // fetchanimeinfo('one-piece-100');

    fetchsearchdata({
      q: "one piece",
      type: "tv",
      rated: "pg-13",
    });
  }, []);

  // console.log(azlistdata);

  // console.log(animeinfo);

  // console.log(searchdata);

  console.log(searchsuggestions);

  return (
    <div>
      <Navbar/>
      <h1 className="text-3xl font-bold text-center">Welcome to OtakuStream</h1>
      <p className="text-center mt-4 mb-8">Clicked {count} times</p>
      <Button
        className="mx-auto block cursor-pointer"
        onClick={() => setCount(count + 1)}
      >
        Button
      </Button>
      <Button
        variant="outline"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        Switch to {theme === "dark" ? "Light" : "Dark"} Mode
      </Button>
    </div>
  );
};

export default Home;
