import { useAuth } from "@/context/auth-provider";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { User, PlayCircle, Heart, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const SecondaryNavbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Profile", icon: User, path: "/profile" },
    {
      name: "Continue",
      icon: PlayCircle,
      path: "/continue-watching",
      shortName: "Watching"
    },
    {
      name: "Watch List",
      icon: Heart,
      path: "/watch-list",
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notification",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <div className="w-full bg-background/80 backdrop-blur-md border-b border-border sticky top-16 z-40">
      {/* User Greeting */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center gap-2 text-foreground">
          <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Hi, <span className="text-primary">{user?.name || 'Guest'}</span>
          </h2>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <nav className="container mx-auto px-2 sm:px-4 lg:px-8 pb-2 sm:pb-3 min-w-max">
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )
                  }
                >
                  <Icon className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  
                  <span className="hidden sm:inline">
                    {isActive ? item.name : (item.shortName || item.name)}
                  </span>
                  
                  {/* Mobile: Show abbreviated text for some items */}
                  <span className="sm:hidden">
                    {item.shortName || item.name}
                  </span>

                  {/* Active Indicator Line (bottom) - Alternative visual cue */}
                  <span className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-primary transition-all duration-300 sm:hidden",
                    isActive ? "w-8 opacity-100" : "w-0 opacity-0"
                  )} />
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SecondaryNavbar;