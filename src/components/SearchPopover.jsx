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
                <div className="relative w-full">
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
                    <div className="flex items-center gap-2 absolute right-3 top-1/2 -translate-y-1/2">
                        <Search className=" h-4 w-4 text-muted-foreground" />
                        <Button className="h-7 cursor-pointer" onClick={() => navigate("/fiter")}>Filter</Button>
                    </div>
                </div>
            </PopoverTrigger>

            <PopoverContent
                className={
                    isMobile
                        ? "w-screen max-w-none p-0 shadow-lg border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                        : "w-76 p-0 shadow-lg border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                }
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Command className="w-full">
                    <CommandList className="max-h-123 overflow-y-auto">
                        <CommandGroup heading="Results" className="overflow-hidden">
                            {suggestion?.data?.suggestions?.length === 0 ? (
                                <CommandItem className="flex gap-3 p-3 cursor-pointer rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        No results found
                                    </span>
                                </CommandItem>
                            ) : (
                                suggestion?.data?.suggestions?.map((result) => (
                                    <CommandItem
                                        key={result.id}
                                        className="rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
                                        onSelect={() => {
                                            navigate(`/${result.id}`);
                                            setOpen(false);
                                        }}
                                    >
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex w-full gap-3 cursor-pointer">
                                                        <img
                                                            src={result.poster}
                                                            alt={language === "EN" ? result.name : result.jname}
                                                            className="w-12 h-12 object-cover rounded shrink-0"
                                                        />
                                                        <div className="grow min-w-0">
                                                            <h4 className="font-bold truncate text-gray-900 dark:text-gray-100">
                                                                {language === "EN" ? result.name : result.jname}
                                                            </h4>
                                                            <h4 className="text-muted-foreground truncate">
                                                                {language === "EN" ? result.jname : result.name}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {result.subtitle}
                                                            </p>
                                                            <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                {result.moreInfo?.slice(0, 3).map((info, i) => (
                                                                    <React.Fragment key={i}>
                                                                        {i > 0 && <span>•</span>}
                                                                        <span>{info}</span>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">{language === "EN" ? result.name : result.jname}</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </CommandItem>
                                ))
                            )}

                            {suggestion?.data?.suggestions?.length > 0 && (
                                <CommandItem>
                                    <Button
                                        className="bg-[#ffbade] w-full cursor-pointer rounded-md"
                                        onClick={() => {
                                            navigate(`search?keyword=${searchQuery}`);
                                            setOpen(false);
                                        }}
                                    >
                                        View all results
                                    </Button>
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default SearchPopover;