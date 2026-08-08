import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Sun, Moon, User } from "lucide-react";
import { useTheme } from "@/context/theme-provider";
import { useAuth } from "@/context/auth-provider";

import LightLogo from "../assets/Logo Light.png";
import DarkLogo from "../assets/Logo Dark.png";
import AppLogo from "../assets/App Logo (2).png";

import NotificationDropdown from "./NotificationDropdown";
import AvatarDropdown from "./AvatarDropdown";
import CommandPalette from "./CommandPalette";
import BottomTabBar from "./BottomTabBar";

const NAV_LINKS = [
  { label: "Home", path: "/home", sectionId: null },
  { label: "Trending", path: "/home", sectionId: "trending" },
  { label: "Genres", path: "/home", sectionId: "genres" },
  { label: "Schedule", path: "/home", sectionId: "schedule" },
  { label: "Watchlist", path: "/home", sectionId: "watchlist" },
];

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, notification } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [scrolled, setScrolled] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  // Scroll listener for sticky compact glass effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll Spy for Home sections active highlighting
  useEffect(() => {
    const isHomePage = currentPath === "/" || currentPath === "/home";
    if (!isHomePage) {
      setActiveSection(null);
      return;
    }

    const sections = ["trending", "genres", "schedule", "watchlist"];

    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 200;
      if (window.scrollY < 350) {
        setActiveSection(null);
        return;
      }

      let currentSection = null;
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSection = sectionId;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    handleScrollSpy();
    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [currentPath]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleNavClick = (link, e) => {
    const isHomePage = location.pathname === "/" || location.pathname === "/home";

    if (!link.sectionId) {
      if (isHomePage) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    e.preventDefault();
    if (isHomePage) {
      const element = document.getElementById(link.sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/home", { state: { scrollToSection: link.sectionId } });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "h-14 lg:h-16 glass border-b border-border/80 shadow-soft"
            : "h-16 lg:h-20 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo (App Logo icon + Theme Logo image) */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link 
              to="/home" 
              className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-2 focus-visible:outline-ring rounded-lg p-0.5"
            >
              {/* App Logo icon (Luffy circular image) */}
              <img
                src={AppLogo}
                alt="OtakuStreams Icon"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-border/40 shadow-soft group-hover:scale-105 transition-transform"
              />
              {/* Theme-adaptive Logo image */}
              <img
                src={theme === "light" ? DarkLogo : LightLogo}
                alt="OtakuStreams"
                className="h-6 sm:h-7 lg:h-8 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
            </Link>

            {/* Desktop Navigation Links (≥1024px) */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Desktop primary">
              {NAV_LINKS.map((link) => {
                const isHomePage = currentPath === "/" || currentPath === "/home";
                const isActive = isHomePage
                  ? (link.sectionId ? activeSection === link.sectionId : !activeSection)
                  : (currentPath === link.path && !link.sectionId);

                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={(e) => handleNavClick(link, e)}
                    className={`relative px-3.5 py-2 text-sm font-sans font-medium transition-colors rounded-lg cursor-pointer ${
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-subtle hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] brand-gradient rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Search Trigger Pill + Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Desktop Search Trigger Pill (≥1024px) */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden lg:flex items-center justify-between w-64 xl:w-72 h-10 px-4 rounded-full bg-elevated/70 hover:bg-elevated border border-border/80 text-muted-foreground hover:text-foreground transition-all group cursor-pointer focus-visible:outline-2 focus-visible:outline-ring"
              aria-label="Search anime (Press Ctrl+K)"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-4 h-4 shrink-0 group-hover:text-primary transition-colors" />
                <span className="text-xs sm:text-sm font-sans truncate">
                  Search anime, genres, studios...
                </span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground bg-surface border border-border rounded-md shadow-xs shrink-0 font-sans">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon Button (<1024px) */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="lg:hidden p-2.5 rounded-full text-subtle hover:text-foreground hover:bg-elevated transition-colors cursor-pointer"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              {notification ? (
                <NotificationDropdown notifications={notification} />
              ) : (
                <button
                  type="button"
                  className="p-2.5 rounded-full text-subtle hover:text-foreground hover:bg-elevated transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-subtle hover:text-foreground hover:bg-elevated transition-colors cursor-pointer"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* User Account / Avatar Dropdown */}
            {user ? (
              <AvatarDropdown />
            ) : (
              <Link
                to="/login"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full brand-gradient flex items-center justify-center text-white shadow-soft hover:shadow-glow transition-all active:scale-95"
                aria-label="User account"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar onOpenSearch={() => setCommandPaletteOpen(true)} />

      {/* Global Command Palette Overlay (⌘K) */}
      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen} 
      />
    </>
  );
};

export default Navbar;