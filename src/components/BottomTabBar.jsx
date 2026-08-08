import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Flame, Search, Calendar, Bookmark } from "lucide-react";

const BottomTabBar = ({ onOpenSearch }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: "Home", path: "/home", sectionId: null, icon: Home },
    { label: "Trending", path: "/#trending", sectionId: "trending", icon: Flame },
    { label: "Search", isFab: true },
    { label: "Schedule", path: "/#schedule", sectionId: "schedule", icon: Calendar },
    { label: "Watchlist", path: "/#watchlist", sectionId: "watchlist", icon: Bookmark },
  ];

  const handleNavClick = (item, e) => {
    const isHomePage = location.pathname === "/" || location.pathname === "/home";

    if (item.sectionId && isHomePage) {
      e.preventDefault();
      const element = document.getElementById(item.sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav 
      aria-label="Primary" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/80 pb-[env(safe-area-inset-bottom)] shadow-lift"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2 relative">
        {navItems.map((item, index) => {
          if (item.isFab) {
            return (
              <div key="search-fab" className="relative flex items-center justify-center -top-4">
                <button
                  onClick={onOpenSearch}
                  aria-label="Search anime"
                  className="w-14 h-14 rounded-full brand-gradient text-white flex items-center justify-center shadow-glow active:scale-95 transition-transform cursor-pointer"
                >
                  <Search className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          const IconComponent = item.icon;
          const isActive = currentPath === item.path || (item.path === "/home" && currentPath === "/");

          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={(e) => handleNavClick(item, e)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 transition-colors cursor-pointer ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className="text-[10px] mt-1 font-sans">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
