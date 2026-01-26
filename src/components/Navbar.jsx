import React, { useEffect, useState } from "react";
import LightLogo from "../assets/Logo Light.png";
import DarkLogo from "../assets/Logo Dark.png";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";


import { Search, Shuffle, Bell, Menu } from "lucide-react";
import { Link } from "react-router-dom";

import ThemeTogglePill from "./ThemeTogglePill";
import AvatarDropdown from "./AvatarDropdown";

import { useTheme } from "@/context/theme-provider";
import { useAuth } from "@/context/auth-provider";
import { useData } from "@/context/data-provider";
import SearchPopover from "./SearchPopover";


/* ================= Navbar ================= */
const Navbar = () => {
  const { theme } = useTheme();
  const { language, setLanguage } = useAuth();
  const { fetchsearchsuggestions } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestion, setSuggestion] = useState([]);

  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // console.log(suggestion);


  /* ===== Debounced Search ===== */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestion([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const data = await fetchsearchsuggestions(searchQuery);
        setSuggestion(data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, fetchsearchsuggestions]);

  /* ===== Ensure only one popover is open ===== */
  useEffect(() => {
    if (isSearchOpen) setDesktopOpen(false);
  }, [isSearchOpen]);

  return (
    <div className="sticky top-0 z-50">
      <nav className="sticky top-0 z-50 w-full border-b bg-[#f8f9fa]/70 text-[#2d3748] dark:bg-[#0f172a]/70 dark:text-[#e2e8f0] backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left */}
          <div className="flex flex-row items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="bg-muted cursor-pointer">
                    <Menu className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Sidebar</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Link to="/" className="text-lg font-semibold">
              <img
                src={theme === "light" ? DarkLogo : LightLogo}
                alt="Logo"
                className="h-6 md:h-8"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-3 items-center">
              <NavigationMenuItem className="hidden lg:block w-72">
                <SearchPopover
                  open={desktopOpen}
                  setOpen={setDesktopOpen}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  suggestion={suggestion}
                />
              </NavigationMenuItem>

              <NavigationMenuItem className="hidden md:block lg:hidden">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-muted cursor-pointer"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                      >
                        <Search className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Search</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-muted cursor-pointer">
                        <Shuffle className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Random</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

              </NavigationMenuItem>

              <NavigationMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroup
                        type="single"
                        value={language}
                        onValueChange={(value) => value && setLanguage(value)}
                        className="flex border border-black rounded-md bg-muted"
                      >
                        <ToggleGroupItem value="EN" className="px-2 py-1 text-xs data-[state=on]:bg-blue-500 data-[state=on]:text-white cursor-pointer">
                          EN
                        </ToggleGroupItem>
                        <ToggleGroupItem value="JP" className="px-2 py-1 text-xs data-[state=on]:bg-blue-500 data-[state=on]:text-white rounded-r-md cursor-pointer">
                          JP
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Language</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

              </NavigationMenuItem>

              <NavigationMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="rounded-full cursor-pointer p-2 bg-muted">
                        <Bell className="h-6 w-6" strokeWidth={3} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Random</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

              </NavigationMenuItem>

              <NavigationMenuItem>
                <ThemeTogglePill />
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <AvatarDropdown />
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="bg-muted cursor-pointer"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-muted cursor-pointer">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-muted cursor-pointer">
              <AvatarDropdown />
            </Button>
          </div>
        </div>
      </nav>

      {isSearchOpen && (
        <div className="p-2">
          <SearchPopover
            open={mobileOpen}
            setOpen={setMobileOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            suggestion={suggestion}
          />
        </div>
      )}
    </div>
  );
};

export default Navbar;
