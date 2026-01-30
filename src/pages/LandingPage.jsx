import React from "react";
import { Search, ArrowRight, Menu, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { useData } from "@/context/data-provider";
import { useTheme } from "@/context/theme-provider";
import LightLogo from "../assets/Logo Light.png";
import DarkLogo from "../assets/Logo Dark.png";
import AnimeImage from "../assets/Hero Img.webp";
import Avatar1 from "../assets/AOT/av-aot-01.jpg";
import Avatar2 from "../assets/AOT/av-aot-02.png";
import Avatar3 from "../assets/JJK/av-jjk-04.png";

const navLinks = [
  { name: "Home", to: "/home" },
  { name: "Movies", to: "/movies" },
  { name: "TV Series", to: "/tv-series" },
  { name: "Most Popular", to: "/most-popular" },
  { name: "Top Airing", to: "/top-airing" },
];

const trendingPosts = [
  {
    tag: "#General",
    time: "8 hours ago",
    title: "Your not gay at all",
    description: "Here I will tell you things that look gay but are not gay 🥀🥀 1.Kissing your bro (Friend )🫦🫦🫦 Not gay at all, it shows your bonding with your bro and how true is your bromance...",
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

const faqItems = [
  {
    q: "What is OtakuStreams?",
    a: "OtakuStreams is a free site to watch anime in ultra HD quality without any registration or payment. By having only one ad in all kinds, we are trying to make it the safest site for free anime.",
  },
  {
    q: "Is OtakuStreams safe?",
    a: "Yes we are, we do have only one Ad to cover the server cost and we keep scanning the ads 24/7 to make sure all are clean. If you find any ad that is suspicious, please forward us the info and we will remove it.",
  },
  {
    q: "So what makes OtakuStreams the best site to watch anime free online?",
    a: "We are trying to make OtakuStreams the best site to watch anime free online by having the biggest anime library, the fastest streaming servers, the cleanest ads, and the safest site for all anime fans. We are not the only one to have these features, but we are the only one to have them all at once.",
  },
  {
    q: "Do I need to create an account to watch anime on OtakuStreams?",
    a: "No, you don't need to create an account to watch anime on OtakuStreams. You can watch anime for free without any registration or payment.",
  },
];

const LandingPage = () => {
  const { homedata } = useData();
  const { theme } = useTheme();

  const topSearches = homedata?.data?.trendingAnimes?.slice(0, 5).map((item) => item.name) ||
    ["Naruto", "One Piece", "Jujutsu Kaisen", "Attack on Titan", "Demon Slayer"];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:justify-center md:h-20">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 lg:gap-12">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group py-2"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-70 bg-background border-border">
                  <div className="flex flex-col gap-6 mt-8">
                    {navLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              <img
                src={theme === "light" ? DarkLogo : LightLogo}
                alt="Logo"
                className="h-8 w-auto"
              />
            </div>

            {/* Desktop Logo */}
            <div className="hidden md:absolute md:right-8 lg:right-12">
              <img
                src={theme === "light" ? DarkLogo : LightLogo}
                alt="Logo"
                className="h-8 lg:h-9 w-auto"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 shadow-2xl">

            {/* Background Image - Desktop */}
            <div className="absolute right-0 top-0 h-full w-1/2 hidden lg:block">
              <img
                src={AnimeImage}
                alt="Anime Preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent dark:from-background dark:via-background/40" />
              <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/40 to-transparent dark:from-background/95 dark:via-background/50" />
            </div>

            {/* Mobile Background */}
            <div className="absolute inset-0 lg:hidden">
              <img
                src={AnimeImage}
                alt="Anime Preview"
                className="h-full w-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background via-background/95 to-background/80" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center gap-4 sm:gap-6 px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16 lg:max-w-2xl">
              {/* Logo */}
              <div className="flex justify-center lg:justify-start">
                <img
                  src={theme === "light" ? DarkLogo : LightLogo}
                  alt="OtakuStreams"
                  className="h-10 sm:h-12 w-auto"
                />
              </div>

              {/* Tagline */}
              <p className="text-center lg:text-left text-sm sm:text-base text-muted-foreground max-w-md">
                Watch thousands of anime episodes in HD quality for free. No registration required.
              </p>

              {/* Search */}
              <div className="flex items-center gap-2 sm:gap-3 max-w-lg">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search anime..."
                    className="h-11 sm:h-12 pl-10 bg-background/80 backdrop-blur-sm border-border/50 focus-visible:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button
                  size="icon"
                  className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Top Searches */}
              <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                <span className="font-medium text-foreground mr-1">Trending:</span>
                {topSearches.map((item, index) => (
                  <React.Fragment key={item}>
                    <Link
                      to={`/search?q=${encodeURIComponent(item)}`}
                      className="hover:text-primary transition-colors hover:underline underline-offset-2"
                    >
                      {item.length > 20 ? item.slice(0, 20) + "..." : item}
                    </Link>
                    {index < topSearches.length - 1 && (
                      <span className="text-border mx-1">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* CTA */}
              <Button
                className="w-fit gap-2 rounded-full bg-primary hover:bg-primary/90 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105"
                asChild
              >
                <Link to="/home" className="flex items-center gap-2">
                  <Play className="h-5 w-5 fill-current" />
                  Start Watching
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-4 border-b border-border/50">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-primary">Share OtakuStreams</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">to your friends and fellow anime fans</p>
          </div>
          <div className="flex gap-2">
            {["Twitter", "Discord", "Reddit"].map((social) => (
              <Button
                key={social}
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
              >
                {social}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">

          {/* Left Content - FAQ */}
          <div className="space-y-8 sm:space-y-10">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                OtakuStreams – The best site to watch anime online for{" "}
                <span className="text-primary">Free</span>
              </h1>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                <p>
                  Do you know that according to Google, the monthly search volume for anime related topics is up to over 1 Billion times? Anime is famous worldwide and it is no wonder we've seen a sharp rise in the number of free anime streaming sites.
                </p>
                <p>
                  Just like free online movie streaming sites, anime watching sites are not created equally. Some are better than the rest, so we've decided to build OtakuStreams to be one of the best free anime streaming sites for all anime fans.
                </p>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="space-y-6 sm:space-y-8">
              {faqItems.map((item, index) => (
                <div key={index} className="group">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 flex items-start gap-3">
                    <span className="text-primary shrink-0">{index + 1}.</span>
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-7 sm:pl-8">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Trending Posts */}
          <aside className="hidden lg:block space-y-6">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Trending Posts
              </h2>

              <div className="space-y-4">
                {trendingPosts.map((post, i) => (
                  <Card
                    key={i}
                    className="group cursor-pointer border-border/50 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary">{post.tag}</span>
                          <span className="text-muted-foreground">• {post.time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          {post.comments}
                        </div>
                      </div>

                      <h4 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {post.title}
                      </h4>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.description}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <img
                          src={post.profile}
                          alt={post.author}
                          className="rounded-full w-6 h-6 object-cover ring-2 ring-border"
                        />
                        <span className="text-xs font-medium text-muted-foreground truncate">
                          {post.author}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4 rounded-full" asChild>
                <Link to="/blog">View All Posts</Link>
              </Button>
            </div>
          </aside>

          {/* Mobile Trending Preview */}
          <div className="lg:hidden">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Trending Posts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trendingPosts.slice(0, 2).map((post, i) => (
                <Card key={i} className="border-border/50 bg-card/50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-primary">{post.tag}</span>
                      <span className="text-muted-foreground">{post.comments} comments</span>
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-1">{post.title}</h4>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <img
              src={theme === "light" ? DarkLogo : LightLogo}
              alt="OtakuStreams"
              className="h-8 w-auto opacity-80"
            />
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
              © {new Date().getFullYear()} OtakuStreams. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;