import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CharacterCard = ({ item }) => {
  const { character, voiceActor } = item;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="group flex items-center gap-3 sm:gap-4 rounded-xl bg-card/50 border border-border/50 px-3 sm:px-4 py-3 backdrop-blur-sm hover:bg-accent/50 hover:border-primary/20 transition-all duration-300">
        {/* Character Image */}
        <div className="relative shrink-0">
          <img
            src={character.poster}
            alt={character.name}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-300"
          />
          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card" />
        </div>

        {/* Character Info */}
        <div className="min-w-0 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm sm:text-base font-semibold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1 cursor-default">
                {character.name}
              </p>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground border-border">
              {character.name}
            </TooltipContent>
          </Tooltip>
          <p className="text-xs text-muted-foreground mt-0.5">{character.cast}</p>
        </div>

        {/* Voice Actor Info */}
        <div className="min-w-0 text-right flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm sm:text-base font-medium text-foreground leading-tight line-clamp-1 cursor-default">
                {voiceActor.name}
              </p>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground border-border">
              {voiceActor.name}
            </TooltipContent>
          </Tooltip>
          <p className="text-xs text-muted-foreground mt-0.5">{voiceActor.cast}</p>
        </div>

        {/* Voice Actor Image */}
        <div className="relative shrink-0">
          <img
            src={voiceActor.poster}
            alt={voiceActor.name}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 ring-2 ring-border/50 group-hover:ring-primary/30"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CharacterCard;