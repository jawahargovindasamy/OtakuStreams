import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ExternalLink } from "lucide-react";
import LightLogo from "../assets/Logo Light.png";
import DarkLogo from "../assets/Logo Dark.png";
import { useTheme } from "@/context/theme-provider";

const linkGroups = [
  {
    id: "discover",
    title: "DISCOVER",
    links: [
      { label: "Trending", href: "/home", sectionId: "trending" },
      { label: "Popular", href: "/home", sectionId: "popular" },
      { label: "Top rated", href: "/home", sectionId: "top-rated" },
      { label: "New releases", href: "/home", sectionId: "new-releases" },
      { label: "Movies", href: "/home", sectionId: "movies" },
      { label: "Airing schedule", href: "/home", sectionId: "schedule" },
    ],
  },
  {
    id: "genres",
    title: "GENRES",
    links: [
      { label: "Action", href: "/genre/Action" },
      { label: "Romance", href: "/genre/Romance" },
      { label: "Fantasy", href: "/genre/Fantasy" },
      { label: "Comedy", href: "/genre/Comedy" },
      { label: "Sci-Fi", href: "/genre/Sci-Fi" },
    ],
  },
  {
    id: "company",
    title: "COMPANY",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "App", href: "/app" },
    ],
  },
  {
    id: "legal",
    title: "LEGAL",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "DMCA", href: "/dmca" },
    ],
  },
];

const Footer = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile Accordion state (first group open by default)
  const [openGroups, setOpenGroups] = useState({ discover: true });

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleLinkClick = (link, e) => {
    if (link.sectionId) {
      e.preventDefault();
      const isHomePage = location.pathname === "/" || location.pathname === "/home";

      if (isHomePage) {
        const el = document.getElementById(link.sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate("/home", { state: { scrollToSection: link.sectionId } });
      }
    }
  };

  return (
    <footer
      id="site-footer"
      aria-label="Site footer"
      className="w-full bg-card/60 backdrop-blur-md border-t border-border/70 text-foreground font-sans mt-auto"
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16 pb-24 sm:pb-12 space-y-10 sm:space-y-12">
        {/* Main Grid: Brand Block + 4 Navigation Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] gap-8 lg:gap-10 w-full items-start">
          {/* Brand Block */}
          <div className="space-y-4 max-w-sm">
            <Link to="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-90">
              <img
                src={theme === "light" ? DarkLogo : LightLogo}
                alt="OtakuStreams"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed font-sans">
              A cinematic home for anime discovery. Track what you watch, save what you love, and never miss an episode.
            </p>

            <div className="text-xs text-muted-foreground font-sans pt-1">
              Catalogue data provided by{" "}
              <a
                href="https://anilist.co"
                target="_blank"
                rel="noreferrer"
                className="text-foreground hover:text-primary underline underline-offset-4 transition-colors font-medium inline-flex items-center gap-1"
              >
                AniList
                <ExternalLink className="w-3 h-3" />
              </a>
              .
            </div>
          </div>

          {/* Desktop & Tablet Navigation Columns (Shown ≥640px) */}
          <div className="hidden sm:grid sm:grid-cols-4 col-span-1 lg:col-span-4 gap-6 lg:gap-8 w-full">
            {linkGroups.map((group) => (
              <nav key={group.id} aria-labelledby={`footer-${group.id}-heading`} className="space-y-3">
                <h3
                  id={`footer-${group.id}-heading`}
                  className="text-[11px] font-semibold text-foreground uppercase tracking-[0.18em] font-sans"
                >
                  {group.title}
                </h3>
                <ul className="space-y-2 list-none p-0 m-0">
                  {group.links.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        to={link.href}
                        onClick={(e) => handleLinkClick(link, e)}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group w-fit py-0.5 block"
                      >
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Mobile Navigation Accordions (Shown <640px) */}
          <div className="block sm:hidden divide-y divide-border/60 border-y border-border/60 w-full">
            {linkGroups.map((group) => {
              const isOpen = !!openGroups[group.id];
              return (
                <div key={group.id} className="w-full">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isOpen}
                    aria-controls={`footer-accordion-${group.id}`}
                    className="w-full py-4 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="text-xs font-semibold text-foreground uppercase tracking-[0.14em]">
                      {group.title}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div id={`footer-accordion-${group.id}`} className="pb-4 pt-1 space-y-2.5">
                      {group.links.map((link, idx) => (
                        <Link
                          key={idx}
                          to={link.href}
                          onClick={(e) => handleLinkClick(link, e)}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors block py-1"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Utility Bar */}
        <div className="border-t border-border/70 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-sans">
          <p>© {new Date().getFullYear()} OtakuStreams. All rights reserved.</p>
          <p className="text-center sm:text-right font-medium text-foreground/70">
            Made for people who finish the season in one sitting.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;