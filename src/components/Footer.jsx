import React from 'react'
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import LightLogo from "../assets/Logo Light.png";
import DarkLogo from "../assets/Logo Dark.png";
import { useTheme } from '@/context/theme-provider';
import { FaDiscord, FaRedditAlien, FaTelegramPlane, FaTwitter } from "react-icons/fa";
import { Separator } from "@/components/ui/separator"

const letters = ["0-9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

const Footer = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    // Social links configuration with brand colors
    const socialLinks = [
        { icon: FaDiscord, href: "#", label: "Discord", color: "bg-[#5865F2] hover:bg-[#4752C4]" },
        { icon: FaTelegramPlane, href: "#", label: "Telegram", color: "bg-[#0088cc] hover:bg-[#0077b3]" },
        { icon: FaRedditAlien, href: "#", label: "Reddit", color: "bg-[#FF4500] hover:bg-[#e03d00]" },
        { icon: FaTwitter, href: "#", label: "Twitter", color: "bg-[#1DA1F2] hover:bg-[#1a91da]" },
    ];

    return (
        <footer className="bg-background border-t border-border mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 lg:py-16">
                
                {/* Top Section: Logo & Social */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start sm:items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="transition-opacity hover:opacity-80 duration-200">
                            <img 
                                src={theme === "light" ? DarkLogo : LightLogo} 
                                alt="Logo" 
                                className='h-8 sm:h-10 w-auto object-contain'
                            />
                        </Link>
                        <Separator orientation="vertical" className="hidden sm:block h-8 bg-border" />
                    </div>

                    <div className='flex items-center gap-2'>
                        {socialLinks.map((social) => (
                            <Button 
                                key={social.label}
                                size="icon" 
                                className={`${social.color} text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 transition-all duration-200 hover:scale-110 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                                aria-label={social.label}
                                onClick={() => window.open(social.href, '_blank')}
                            >
                                <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        ))}
                    </div>
                </div>

                <Separator className="bg-border mb-8" />

                {/* A-Z List Section */}
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                            A-Z LIST
                        </h2>
                        <p className="text-sm text-muted-foreground sm:border-l sm:border-border sm:pl-4">
                            Searching anime order by alphabet name A to Z
                        </p>
                    </div>

                    {/* Alphabet Filter */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <Button 
                            size="sm" 
                            variant="secondary"
                            className="min-w-10 sm:min-w-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all duration-200 rounded-md"
                            onClick={() => navigate("/az-list")}
                        >
                            All
                        </Button>
                        
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="min-w-9 sm:min-w-10 border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-md font-medium"
                            onClick={() => navigate("/az-list/other")}
                        >
                            #
                        </Button>
                        
                        {letters.map((letter) => (
                            <Button 
                                key={letter} 
                                size="sm"
                                variant="outline"
                                className="min-w-9 sm:min-w-10 border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-md font-medium"
                                onClick={() => navigate(`/az-list/${letter}`)}
                            >
                                {letter}
                            </Button>
                        ))}
                    </div>
                </div>

                <Separator className="bg-border my-8" />

                {/* Bottom Section: Legal & Copyright */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-between items-start lg:items-center">
                    <nav className="flex flex-wrap gap-x-6 gap-y-2">
                        {[
                            { label: "Terms of Service", href: "/terms" },
                            { label: "DMCA", href: "/dmca" },
                            { label: "Contact", href: "/contact" },
                            { label: "OtakuStreams App", href: "/app" }
                        ].map((link) => (
                            <Link 
                                key={link.label}
                                to={link.href} 
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>

                    <div className="text-xs text-muted-foreground/80 max-w-2xl lg:text-right space-y-1">
                        <p>
                            OtakuStreams does not store any files on our server, we only link to media hosted on 3rd party services.
                        </p>
                        <p className="font-medium text-foreground/60">
                            © {new Date().getFullYear()} OtakuStreams. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer