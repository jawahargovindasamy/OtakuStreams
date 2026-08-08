import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Sun, Moon, ArrowRight } from "lucide-react";
import { useTheme } from "@/context/theme-provider";
import LightLogo from "@/assets/Logo Light.png";
import DarkLogo from "@/assets/Logo Dark.png";
import AppLogo from "@/assets/App Logo (2).png";

const LandingHeader = ({ onOpenSearch }) => {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 20) {
        setIsScrolled(true);
      } else if (scrollY === 0) {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 h-20 w-full transition-all duration-300 ease-out flex items-center
        ${isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/70 shadow-lg"
          : "bg-transparent border-b border-transparent"
        }
      `}
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 flex items-center justify-between">
        {/* Brand Link with Both Logos */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1"
        >
          <img
            src={AppLogo}
            alt="OtakuStreams Icon"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-border/40 shadow-soft group-hover:scale-105 transition-transform"
          />
          <img
            src={theme === "light" ? DarkLogo : LightLogo}
            alt="OtakuStreams"
            className="h-6 sm:h-7 lg:h-8 w-auto object-contain transition-opacity group-hover:opacity-90"
          />
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearch}
            aria-label="Search anime"
            className="w-11 h-11 rounded-full flex items-center justify-center text-foreground/80 hover:text-foreground bg-surface/60 hover:bg-elevated border border-border/70 backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="w-11 h-11 rounded-full flex items-center justify-center text-foreground/80 hover:text-foreground bg-surface/60 hover:bg-elevated border border-border/70 backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-600" />
            )}
          </button>

          {/* Desktop "Enter streams" CTA Pill */}
          <Link
            to="/home"
            className="hidden sm:inline-flex items-center gap-2 h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-sm shadow-glow transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Enter streams</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
