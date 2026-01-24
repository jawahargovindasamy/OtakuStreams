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

    return (
        <footer className="p-6">

            <div className="flex gap-2 justify-start items-center mb-4">
                <img src={theme === "light" ? DarkLogo : LightLogo} alt="" className='h-6 md:h-10 pe-2 md:pe-1.5 sm:mb-0 border-e border-black dark:border-white ' />
                <div className='flex justify-center items-center gap-1'>
                    <Button className="bg-[#1d9bf0] cursor-pointer w-7 h-7" size="icon">
                        <FaDiscord />
                    </Button>
                    <Button className="bg-[#1d9bf0] cursor-pointer w-7 h-7" size="icon">
                        <FaTelegramPlane />
                    </Button>
                    <Button className="bg-[#1d9bf0] cursor-pointer w-7 h-7" size="icon">
                        <FaRedditAlien />
                    </Button>
                    <Button className="bg-[#1d9bf0] cursor-pointer w-7 h-7" size="icon">
                        <FaTwitter />
                    </Button>
                </div>
            </div>

            <Separator className="bg-black dark:bg-white"/>

            {/* Header */}
            <div className="md:flex gap-2 justify-start items-center my-4">
                <h1 className="text-2xl md:pe-1.5 font-bold mb-2 sm:mb-0 md:border-e-3 md:border-black dark:md:border-white">A-Z LIST</h1>
                <p className="text-muted-foreground text-sm">Searching anime order by alphabet name A to Z.</p>
            </div>

            {/* Alphabet buttons */}
            <div className="flex flex-wrap gap-1 mb-4">
                <Button size="sm" className="hover:bg-[#ffbade] hover:text-black cursor-pointer w-10" onClick={() => navigate("/az-list")}>
                    All
                </Button>
                <Button size="sm" className="hover:bg-[#ffbade] hover:text-black cursor-pointer w-8" onClick={() => navigate("/az-list/other")}>
                    #
                </Button>
                {letters.map((letter) => (
                    <Button key={letter} size="sm" className="hover:bg-[#ffbade] hover:text-black cursor-pointer w-8" onClick={() => navigate(`/az-list/${letter}`)}>
                        {letter}
                    </Button>
                ))}
            </div>

            <Separator className="bg-black dark:bg-white"/>

            {/* Footer */}
            <div className="pt-4 text-gray-400 text-sm flex flex-col gap-2">
                <div className="flex gap-4">
                    <Link to="/" className="hover:text-gray-200">Terms of service</Link>
                    <Link to="/" className="hover:text-gray-200">DMCA</Link>
                    <Link to="/" className="hover:text-gray-200">Contact</Link>
                    <Link to="/" className="hover:text-gray-200">OtakuStreams App</Link>
                </div>
                <p className="mt-2 sm:mt-0 text-gray-500 text-xs">
                    OtakuStreams does not store any files on our server, we only link to media hosted on 3rd party services. <br />
                    © OtakuStreams. All rights reserved.
                </p>
            </div>
        </footer>
    )
}

export default Footer