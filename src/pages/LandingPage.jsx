import React from "react";
import LightLogo from "../assets/Logo Light.png";
import AnimeImage from "../assets/Hero Img.webp";
import Avatar1 from "../assets/AOT/av-aot-01.jpg";
import Avatar2 from "../assets/AOT/av-aot-02.png";
import Avatar3 from "../assets/JJK/av-jjk-04.png";
import { Search, ArrowRight, Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useData } from "@/context/data-provider";

const links = [
  {
    name: "Home",
    to: "home",
  },
  {
    name: "Movies",
    to: "movies",
  },
  {
    name: "TV Series",
    to: "tv-series",
  },
  {
    name: "Most Popular",
    to: "most-popular",
  },
  {
    name: "Top Airing",
    to: "top-airing",
  },
];

const trendingPosts = [
  {
    tag: "#General",
    time: "8 hours ago",
    title: "Your not gay at all",
    description:
      "Here I will tell you things that look gay but are not gay 🥀🥀 1.Kissing your bro (Friend )🫦🫦🫦 Not gay at all, it shows your bonding with your bro and how true is your bromance...",
    comments: 101,
    author: "Busy-Guy Crab",
    profile: Avatar1,
  },
  {
    tag: "#Discussion",
    time: "3 hours ago",
    title: "Anime Hot Takes 🔥",
    description: "Frieren's story is 100x better than the solo leveling",
    comments: 22,
    author: "Wonderboy Angelfish",
    profile: Avatar2,
  },
  {
    tag: "#Question",
    time: "a day ago",
    title: "Best anime of all time?",
    description: "idk but i guess it is rent a girlfriend",
    comments: 307,
    author: "rezee💣💥🎭",
    profile: Avatar3,
  },
];

const question = [
  {
    q: "1/ What is OtakuStreams?",
    a: "OtakuStreams is a free site to watch anime in ultra HD quality without any registration or payment. By having only one ads in all kinds, we are trying to make it the safest site for free anime.",
  },
  {
    q: "2/ Is OtakuStreams safe?",
    a: "Yes we are, we do have only one Ads to cover the server cost and we keep scanning the ads 24/7 to make sure all are clean, If you find any ads that is suspicious, please forward us the info and we will remove it.",
  },
  {
    q: "3/ So what make OtakuStreams the best site to watch anime free online?",
    a: "We are trying to make OtakuStreams the best site to watch anime free online by having the biggest anime library, the fastest streaming servers, the cleanest ads, and the safest site for all anime fans.We are not the only one to have these features, but we are the only one to have them all at once.",
  },
  {
    q: "4/ Do I need to create an account to watch anime on OtakuStreams?",
    a: "No, you don't need to create an account to watch anime on OtakuStreams. You can watch anime for free without any registration or payment.",
  },
];

const LandingPage = () => {
  const { homedata } = useData();

  const topSearches = homedata?.data.trendingAnimes.map(
    (item) => item.name,
  ) || ["Naruto", "One Piece", "Bleach"];

  return (
    <div>
      <nav className="w-full py-6">
        <div className="md:flex md:justify-center px-6">
          <div className="hidden md:flex gap-14">
            {links.map((item, index) => (
              <Link
                to={`/${item.to}`}
                key={index}
                className="hover:text-pink-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="md:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex gap-2">
                  <Menu className="h-6 w-6" />
                  <span>Menu</span>
                </button>
              </DialogTrigger>
              <DialogContent
                className="
                max-w-sm
              rounded-3xl
              border-none
              bg-black/90
              py-8
              text-white
              shadow-2xl
            "
              >
                <DialogTitle></DialogTitle>
                <DialogDescription></DialogDescription>
                <div className="flex flex-col items-center gap-10 text-lg font-semibold">
                  {links.map((item, index) => (
                    <Link
                      key={index}
                      to={`/${item.to}`}
                      className="hover:text-pink-400 transition"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>
      <section className="w-full px-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#2a2a3d]">
          {/* Right Image */}
          <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
            <img
              src={AnimeImage}
              alt="Anime"
              className="h-full w-full object-cover"
            />
            {/* Gradient fade */}
            <div className="absolute inset-0 bg-linear-to-l from-transparent via-[#2a2a3d]/70 to-[#2a2a3d]" />
          </div>

          {/* Left Content */}
          <div className="relative z-10 flex min-h-105 w-full flex-col justify-center gap-6 px-4 py-8 md:px-10 md:py-14 md:w-1/2">
            {/* Logo */}
            <div className="flex justify-center md:justify-start">
              <img src={LightLogo} alt="Logo" className="w-60 h-10" />
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search anime..."
                className="h-12 rounded-xl bg-white text-black placeholder:text-muted-foreground dark:bg-white dark:text-black dark:placeholder:text-gray-500"
              />
              <Button
                size="icon"
                className="h-12 w-12 rounded-xl bg-pink-300 text-black hover:bg-pink-400"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {/* Top Search */}
            <div className="text-sm text-white/90">
              <span className="font-semibold">Top search: </span>
              {topSearches
                ?.map((item) => (
                  <Link
                    key={item}
                    to={`/search?q=${encodeURIComponent(item)}`}
                  >
                    {item.length > 20 ? item.slice(0, 25) + "..." : item}
                  </Link>
                ))
                .reduce((p, c) => [p, ", ", c])}
            </div>

            {/* CTA */}
            <Button className="mt-4 w-fit gap-3 rounded-lg bg-pink-300 px-8 py-6 text-lg font-semibold text-black hover:bg-pink-350 cursor-pointer">
              <Link to="/home" className="flex items-center gap-2">
                Watch Now <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <div className="px-6 pt-5">
        <h1 className="text-xl font-bold text-pink-600">Share OtakuStreams</h1>
        <p className="text-sm">to your friends</p>
      </div>
      <section className="mx-auto max-w-7xl px-6 py-2 dark:text-white">
        <div className="flex justify-center mt-10 gap-16">
          <div className="lg:grid gap-10 lg:grid-cols-[2fr_1fr]">
            {/* LEFT CONTENT */}
            <div className="space-y-10">
              <h1 className="text-3xl font-bold">
                OtakuStreams – The best site to watch anime online for Free
              </h1>
              <p className="leading-relaxed">
                Do you know that according to Google, the monthly search volume
                for anime related topics is up to over 1 Billion times? Anime is
                famous worldwide and it is no wonder we've seen a sharp rise in
                free anime streaming sites.
              </p>
              <p className="leading-relaxed">
                Just like free online movie streaming sites, anime watching
                sites are not created equally, some are better than the rest, so
                we’ve decided to build HiAnime.to to be one of the best free
                anime streaming site for all anime fans.
              </p>
              {question.map((item, index) => (
                <div key={index}>
                  <h2 className="text-2xl font-bold mb-3">{item.q}</h2>
                  <p className="leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>

            {/* RIGHT CONTENT */}
            <div className="hidden lg:block">
              <h2 className="mb-6 text-2xl font-bold">Trending Posts</h2>
              <div className="space-y-6">
                {trendingPosts.map((post, i) => (
                  <Card
                    key={i}
                    className="rounded-2xl bg-black/80 border-black dark:border-white/10 backdrop-blur-md"
                  >
                    <CardContent className="p-5 space-y-3 text-white dark:text-white">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{post.tag}</span>
                          <span className="text-muted-foreground">
                            {post.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold">{post.title}</h3>

                      <p className="text-sm line-clamp-2">{post.description}</p>

                      <div className="flex gap-2 items-center pt-2 text-sm">
                        <img
                          src={post.profile}
                          alt="Profile"
                          className="rounded-full w-8 h-8"
                        />
                        <span className="font-medium">{post.author}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button className="mt-4 cursor-pointer w-full">
                <Link to="/blog">Show More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <footer>
        <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-muted-foreground dark:text-white/70">
          © OtakuStreams. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
