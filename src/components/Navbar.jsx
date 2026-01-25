import React, { useEffect, useState } from "react";
import LightLogo from "../assets/Logo Light.png";
import DarkLogo from "../assets/Logo Dark.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { useTheme } from "@/context/theme-provider";
import { Link, useNavigate } from "react-router-dom";

import { Search, Shuffle, Bell, Menu } from "lucide-react";
import ThemeTogglePill from "./ThemeTogglePill";
import AvatarDropdown from "./AvatarDropdown";
import { useAuth } from "@/context/auth-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useData } from "@/context/data-provider";


const Navbar = () => {
  const { theme } = useTheme();
  const { language, setLanguage } = useAuth();
  const { fetchsearchsuggestions } = useData();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestion, setSuggestion] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestion([]);
      return;
    }

    let mounted = true;
    const getAnimeInfo = async () => {
      try {
        const data = await fetchsearchsuggestions(debouncedQuery);
        if (mounted) setSuggestion(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    getAnimeInfo();

    return () => { mounted = false };
  }, [debouncedQuery, fetchsearchsuggestions]);


  // console.log(debouncedQuery, suggestion?.data?.suggestions);


  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-[#f8f9fa]/70 text-[#2d3748] dark:bg-[#0f172a]/70 dark:text-[#e2e8f0] backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex flex-row items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-muted cursor-pointer"
                >
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

        {/* ================= Desktop Navigation ================= */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-3 items-center">
            {/* Search Input */}
            <NavigationMenuItem className="hidden lg:block">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div className="relative w-72">
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        setOpen(val.trim().length > 0);
                      }}
                      className="w-full pr-10 border border-black dark:border-white focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-md transition"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  className="w-96 p-0 shadow-lg border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command className="w-full">
                    <CommandList className="max-h-[500px] overflow-y-auto">
                      <CommandGroup heading="Results" className="overflow-hidden">
                        {suggestion?.data?.suggestions?.length === 0 ? (
                          <CommandItem
                            className="flex gap-3 p-3 cursor-pointer rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
                          >
                            <span className="text-gray-500 dark:text-gray-400">
                              No results found
                            </span>
                          </CommandItem>
                        ) : (
                          suggestion?.data?.suggestions?.map((result) => (
                            <CommandItem 
                              key={result.id}
                              className="rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
                            >
                              <div
                                className="flex w-full gap-3 cursor-pointer "
                                onClick={() => navigate(`/${result.id}`)}
                              >
                                <img
                                  src={result.poster}
                                  alt={result.name}
                                  className="w-12 h-13 object-cover rounded shrink-0"
                                />
                                <div className="grow min-w-0">
                                  <h4 className="font-bold truncate text-gray-900 dark:text-gray-100">
                                    {result.name}
                                  </h4>
                                  <h4 className="text-muted-foreground truncate">
                                    {result.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {result.subtitle}
                                  </p>
                                  <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    <span>{result.moreInfo[0]}</span>
                                    <span>•</span>
                                    <span>{result.moreInfo[1]}</span>
                                    <span>•</span>
                                    <span>{result.moreInfo[2]}</span>
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          )))}

                        {
                          suggestion?.data?.suggestions?.length > 0 && (
                            <CommandItem>
                              <Button className="bg-[#ffbade] w-full cursor-pointer rounded-md" onClick={() => navigate(`search?keyword=${searchQuery}`)}>
                                View all results
                              </Button>
                            </CommandItem>
                          )
                        }

                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>



            </NavigationMenuItem>

            <NavigationMenuItem className="hidden md:block lg:hidden">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-muted cursor-pointer"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Random</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </NavigationMenuItem>

            {/* Random */}
            <NavigationMenuItem>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-muted cursor-pointer"
                    >
                      <Shuffle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Random</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </NavigationMenuItem>

            {/* Language Toggle */}
            <NavigationMenuItem>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* <div className="border rounded-md flex flex-row cursor-pointer"> */}
                    <ToggleGroup
                      type="single"
                      value={language}
                      onValueChange={(value) => value && setLanguage(value)}
                      className="flex border border-black rounded-md bg-muted"
                    >
                      <ToggleGroupItem
                        value="EN"
                        className="px-2 py-1 text-xs data-[state=on]:bg-blue-500 data-[state=on]:text-white cursor-pointer"
                      >
                        EN
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="JP"
                        className="px-2 py-1 text-xs data-[state=on]:bg-blue-500 data-[state=on]:text-white rounded-r-md cursor-pointer"
                      >
                        JP
                      </ToggleGroupItem>
                    </ToggleGroup>
                    {/* </div> */}
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Language</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </NavigationMenuItem>

            {/* Notification */}
            <NavigationMenuItem>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full cursor-pointer p-2 bg-muted"
                    >
                      <Bell className="h-6 w-6" strokeWidth={3} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Notifications</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <ThemeTogglePill />
            </NavigationMenuItem>

            {/* Profile */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <AvatarDropdown />
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* ================= Mobile Icons ================= */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="bg-muted cursor-pointer"
            onClick={() => navigate("/search")}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-muted cursor-pointer"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-muted cursor-pointer"
          >
            <div className="h-7 w-7 flex items-center justify-center text-xs font-semibold">
              <AvatarDropdown />
            </div>
          </Button>
        </div>

        {/* <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="sm">
            Login
          </Button>
          <Button size="sm">Sign up</Button>
        </div> */}
      </div>
    </nav >
  );
};

export default Navbar;
