import React from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, FileText, Settings, ChevronLeft, Notebook, Shuffle, X } from "lucide-react";
import { useTheme } from '@/context/theme-provider';
import LightLogo from "../assets/Logo Light.png";
import DarkLogo from "../assets/Logo Dark.png";
import { useAuth } from '@/context/auth-provider';
import ThemeTogglePill from './ThemeTogglePill';

const Sidebar = ({ onClose }) => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { language, setLanguage } = useAuth();

    const navItems = [
        { path: "/home", label: "Home" },
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
        <div className="w-full h-full bg-background flex flex-col border-r border-border">
            {/* Header with Close */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors duration-200 group"
                    aria-label="Close menu"
                >
                    <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                    Close Menu
                </button>
            </div>

            {/* Logo Area */}
            <div className="flex justify-center py-6 border-b border-border/50 bg-linear-to-b from-muted/30 to-transparent">
                <Link
                    to="/"
                    onClick={onClose}
                    className="transition-transform hover:scale-105 duration-300"
                >
                    <img
                        src={theme === "light" ? DarkLogo : LightLogo}
                        alt="Logo"
                        className="h-8 sm:h-10 w-auto object-contain"
                    />
                </Link>
            </div>

            {/* Mobile Controls */}
            <div className='flex gap-2 justify-center items-center w-full p-4 bg-muted/30 border-b border-border/50 md:hidden'>
                <Button
                    variant="outline"
                    size="icon"
                    className="border-border hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                    <Shuffle className="h-4 w-4" />
                </Button>

                <ToggleGroup
                    type="single"
                    value={language}
                    onValueChange={(value) => value && setLanguage(value)}
                    className="flex border border-input rounded-lg bg-background p-0.5"
                >
                    <ToggleGroupItem
                        value="EN"
                        className="px-3 py-1 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-200 rounded-md"
                    >
                        EN
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="JP"
                        className="px-3 py-1 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-200 rounded-md"
                    >
                        JP
                    </ToggleGroupItem>
                </ToggleGroup>

                <ThemeTogglePill />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                                ${isActive
                                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium"
                                }
                            `}
                        >
                            {/* Hover gradient effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-r from-primary/5 to-transparent pointer-events-none" />

                            <span className="relative z-10 text-sm tracking-wide">{item.label}</span>

                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom User Section */}
            <div className="p-4 border-t border-border/50 bg-muted/30">
                <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
                    onClick={() => navigate('/settings')}
                >
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-border hover:ring-primary/50 transition-all duration-200">
                        <AvatarImage src={user.avatar} alt={user.name || user.username} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-bold text-foreground truncate">{user.name || user.username}</p>
                    </div>
                    <Settings
                        size={16}
                        className="text-muted-foreground group-hover:rotate-90 group-hover:text-foreground transition-all duration-500"
                    />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;