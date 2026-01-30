import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Home, FileText, Settings, ChevronLeft, Notebook, Shuffle } from "lucide-react";
import { useTheme } from '@/context/theme-provider';
import LightLogo from "../assets/Logo Light.png";
import DarkLogo from "../assets/Logo Dark.png";
import { useAuth } from '@/context/auth-provider';
import ThemeTogglePill from './ThemeTogglePill';

const Sidebar = ({ onClose }) => {
    const { theme } = useTheme();
    const location = useLocation();

    const { language, setLanguage } = useAuth();

    const navItems = [
        { path: "/", label: "Home" },
        { path: "/subbed-anime", label: "Subbed Anime" },
        { path: "/dubbed-anime", label: "Dubbed Anime" },
        { path: "/most-popular", label: "Most Popular" },
        { path: "/movie", label: "Movies" },
        { path: "/tv", label: "TV Series" },
        { path: "/ova", label: "OVAs" },
        { path: "/ona", label: "ONAs" },
        { path: "/special", label: "Specials" },
    ];

    return (
        <div className="w-full h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl flex flex-col">
            {/* Close Button Header */}
            <div className="flex p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={onClose} aria-label="Close menu">
                Close Menu
            </div>

            {/* Logo Area */}
            <div className="flex justify-center">
                <Link
                    to="/"
                    onClick={onClose}
                    className="transition-transform hover:scale-105 duration-300"
                >
                    <img
                        src={theme === "light" ? DarkLogo : LightLogo}
                        alt="Logo"
                        className="h-8 md:h-10 w-auto object-contain"
                    />
                </Link>
            </div>

            <div className='flex gap-2 justify-center items-center w-full md:hidden my-2.5 py-2 bg-fuchsia-200'>
                <Button variant="ghost" size="icon" className="bg-muted cursor-pointer">
                    <Shuffle className="h-5 w-5" />
                </Button>


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

                <ThemeTogglePill />

            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                                ${isActive
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/5 border border-blue-100 dark:border-blue-800"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                                }
                            `}
                        >
                            <span className="font-semibold text-sm tracking-wide">{item.label}</span>

                            {/* Active indicator line */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom User Section */}
            <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md group-hover:scale-105 transition-transform">
                        JD
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">John Doe</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">Pro Plan</p>
                    </div>
                    <Settings
                        size={16}
                        className="text-slate-400 group-hover:rotate-90 transition-transform duration-500"
                    />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;