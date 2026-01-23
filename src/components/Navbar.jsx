import React from "react";
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
import { useData } from "@/context/data-provider";
import ThemeTogglePill from "./ThemeTogglePill";
import AvatarDropdown from "./AvatarDropdown";

const Navbar = () => {
  const { theme } = useTheme();
  const { language, setLanguage } = useData();
  const navigate= useNavigate();

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
              <div className="relative">
                <Input
                  placeholder="Search..."
                  className="w-72 pr-10 border border-black dark:border-white"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
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
    </nav>
  );
};

export default Navbar;
