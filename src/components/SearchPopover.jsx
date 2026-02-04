import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip";
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

import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";


import { useAuth } from "@/context/auth-provider";

const SearchPopover = ({
    open,
    setOpen,
    searchQuery,
    setSearchQuery,
    suggestion,
    isMobile = false,
}) => {
    const navigate = useNavigate();
    const { language } = useAuth();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="relative w-full group">
                    <Input
                        placeholder="Search anime..."
                        value={searchQuery}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSearchQuery(val);
                            setOpen(val.trim().length > 0);
                        }}
                        onKeyDown={(e) => {
                            if(e.key === "Enter") {
                                e.preventDefault();
                                const trimmed = searchQuery.trim();
                                if(trimmed){
                                    navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
                                    setSearchQuery("");
                                    setOpen(false);
                                }
                            }
                        }}
                        className="w-full pr-24 pl-4 h-10 sm:h-11 border-input bg-background/50 backdrop-blur-sm focus:bg-background transition-all duration-200 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <div className="flex items-center gap-1.5 absolute right-2 top-1/2 -translate-y-1/2">
                        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                        <Button 
                            size="sm" 
                            className="h-7 px-2.5 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200"
                            onClick={() => navigate("/search")}
                        >
                            Filter
                        </Button>
                    </div>
                </div>
            </PopoverTrigger>

            <PopoverContent
                className={`
                    p-0 shadow-2xl border-border bg-popover text-popover-foreground rounded-xl overflow-hidden
                    ${isMobile
                        ? "w-[calc(100vw-1.5rem)] max-w-none mx-0"
                        : "w-85 sm:w-95 xl:w-105"
                    }
                `}
                align="start"
                sideOffset={8}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command className="w-full bg-transparent">
                    <CommandList className="max-h-[60vh] sm:max-h-100 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        <CommandGroup heading="Results" className="overflow-hidden px-1 py-2">
                            {!suggestion?.data?.suggestions?.length ? (
                                <CommandItem className="flex gap-3 p-4 cursor-default rounded-lg">
                                    <span className="text-muted-foreground text-sm">
                                        No results found
                                    </span>
                                </CommandItem>
                            ) : (
                                suggestion.data.suggestions.map((result) => (
                                    <CommandItem
                                        key={result.id}
                                        className="p-2 rounded-lg hover:bg-accent transition-colors duration-150 cursor-pointer aria-selected:bg-accent"
                                        onSelect={() => {
                                            navigate(`/${result.id}`);
                                            setOpen(false);
                                        }}
                                    >
                                        <TooltipProvider delayDuration={300}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex w-full gap-3">
                                                        <div className="relative shrink-0">
                                                            <img
                                                                src={result.poster}
                                                                alt={language === "EN" ? result.name : result.jname}
                                                                className="w-12 h-16 sm:w-14 sm:h-18 object-cover rounded-lg shadow-md bg-muted"
                                                                loading="lazy"
                                                            />
                                                            {result.subtitle && (
                                                                <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                                                                    {result.subtitle.includes("SUB") ? "SUB" : "DUB"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="grow min-w-0 py-0.5">
                                                            <h4 className="font-semibold text-sm text-foreground truncate leading-tight">
                                                                {language === "EN" ? result.name : result.jname}
                                                            </h4>
                                                            <h4 className="text-xs text-muted-foreground truncate mt-0.5">
                                                                {language === "EN" ? result.jname : result.name}
                                                            </h4>
                                                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] sm:text-xs text-muted-foreground mt-1.5">
                                                                {result.moreInfo?.slice(0, 3).map((info, i) => (
                                                                    <React.Fragment key={i}>
                                                                        {i > 0 && <span className="text-border">•</span>}
                                                                        <span className="bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{info}</span>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent 
                                                    side="bottom" 
                                                    className="bg-popover border-border text-popover-foreground max-w-62.5"
                                                >
                                                    {language === "EN" ? result.name : result.jname}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </CommandItem>
                                ))
                            )}

                            {suggestion?.data?.suggestions?.length > 0 && (
                                <div className="p-2 mt-1">
                                    <Button
                                        className="w-full cursor-pointer rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30"
                                        onClick={() => {
                                            navigate(`search?keyword=${searchQuery}`);
                                            setOpen(false);
                                        }}
                                    >
                                        View all results
                                    </Button>
                                </div>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default SearchPopover;