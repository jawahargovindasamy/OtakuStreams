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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle, 
  SheetDescription
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


import { Search, Shuffle, Bell, Menu } from "lucide-react";
import { Link } from "react-router-dom";

import ThemeTogglePill from "./ThemeTogglePill";
import AvatarDropdown from "./AvatarDropdown";

import { useTheme } from "@/context/theme-provider";
import { useAuth } from "@/context/auth-provider";
import { useData } from "@/context/data-provider";
import SearchPopover from "./SearchPopover";
import Sidebar from "./Sidebar";


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

  const [sidebarOpen, setSidebarOpen] = useState(false);


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
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 text-foreground backdrop-blur-md transition-colors duration-300 supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 lg:h-20 items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8">
          {/* Left Section */}
          <div className="flex flex-row items-center gap-2 sm:gap-3 lg:gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover text-popover-foreground border-border">
                    Sidebar
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Sidebar content */}
              <SheetContent side="left" className="w-70 sm:w-72 p-0 bg-background border-r border-border">
                <VisuallyHidden>
                  <SheetTitle>Sidebar navigation</SheetTitle>
                  <SheetDescription>Main application navigation</SheetDescription>
                </VisuallyHidden>
                <Sidebar onClose={() => setSidebarOpen(false)}/>
              </SheetContent>
            </Sheet>


            <Link to="/" className="flex items-center transition-opacity hover:opacity-90 active:scale-95 duration-200">
              <img
                src={theme === "light" ? DarkLogo : LightLogo}
                alt="Logo"
                className="h-6 sm:h-7 md:h-8 lg:h-9 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex justify-end max-w-none">
            <NavigationMenuList className="gap-1 sm:gap-2 lg:gap-3 items-center">
              <NavigationMenuItem className="hidden lg:block w-75 xl:w-100">
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
                        className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                      >
                        <Search className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-popover text-popover-foreground border-border">
                      Search
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                      >
                        <Shuffle className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-popover text-popover-foreground border-border">
                      Random
                    </TooltipContent>
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
                        className="flex border border-input rounded-lg bg-muted/50 p-0.5"
                      >
                        <ToggleGroupItem 
                          value="EN" 
                          className="px-2 sm:px-3 py-1 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-200 rounded-md"
                        >
                          EN
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="JP" 
                          className="px-2 sm:px-3 py-1 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-200 rounded-md"
                        >
                          JP
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-popover text-popover-foreground border-border">
                      Language
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200 relative"
                      >
                        <Bell className="h-5 w-5" strokeWidth={2} />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-popover text-popover-foreground border-border">
                      Notifications
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </NavigationMenuItem>

              <NavigationMenuItem className="mx-1">
                <ThemeTogglePill />
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <AvatarDropdown />
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
            </Button>
            <div className="hover:scale-105 transition-transform duration-200">
              <AvatarDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Expand */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 p-3 sm:p-4 bg-background/95 backdrop-blur-md border-b border-border shadow-lg animate-in slide-in-from-top-2 duration-200 lg:hidden">
          <div className="container mx-auto max-w-2xl">
            <SearchPopover
              open={mobileOpen}
              setOpen={setMobileOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              suggestion={suggestion}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;