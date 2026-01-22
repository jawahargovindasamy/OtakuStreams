import { useAuth } from "@/context/auth-provider";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { User, PlayCircle, Heart, Bell, Settings } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Shadcn Tabs

const SecondaryNavbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Profile", icon: <User className="h-5 w-5" />, path: "/profile" },
    {
      name: "Continue Watching",
      icon: <PlayCircle className="h-5 w-5" />,
      path: "/continue-watching",
    },
    {
      name: "Watch List",
      icon: <Heart className="h-5 w-5" />,
      path: "/watch-list",
    },
    {
      name: "Notification",
      icon: <Bell className="h-5 w-5" />,
      path: "/notification",
    },
    {
      name: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
    },
  ];

  return (
    <div className="w-full flex flex-col justify-between items-center h-30 text-white border-b pb-3">
      <div className="p-3 text-center text-black dark:text-white text-2xl font-semibold">
        Hi, {user.name}
      </div>

      <Tabs value={location.pathname} className="w-full items-center">
        <TabsList className="bg-transparent fex flex-row items-center justify-center gap-4 h-auto">
          {navItems.map((item) => (
            <TabsTrigger 
              key={item.name} 
              value={item.path} 
              asChild
              className="border-0 data-[state=active]:border-2 data-[state=active]:border-black dark:data-[state=active]:border-white px-4"
            >
              <NavLink
                to={item.path}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default SecondaryNavbar;