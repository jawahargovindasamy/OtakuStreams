import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, User, X } from "lucide-react";

const avatarCategories = {
  DragonBall: import.meta.glob("/src/assets/dragonball/*.{png,jpg,jpeg,webp}", {
    eager: true,
    import: "default",
  }),
  OnePiece: import.meta.glob("/src/assets/One Piece/*.{png,jpg,jpeg,webp}", {
    eager: true,
    import: "default",
  }),
  AttackOnTitan: import.meta.glob("/src/assets/AOT/*.{png,jpg,jpeg,webp}", {
    eager: true,
    import: "default",
  }),
  Naruto: import.meta.glob("/src/assets/N/*.{png,jpg,jpeg,webp}", {
    eager: true,
    import: "default",
  }),
  HunterxHunter: import.meta.glob("/src/assets/HxH/*.{png,jpg,jpeg,webp}", {
    eager: true,
    import: "default",
  }),
  JJK: import.meta.glob("/src/assets/JJK/*.{png,jpg,jpeg,webp}", {
    eager: true,
    import: "default",
  }),
  OnePunchMan: import.meta.glob("/src/assets/OPM/*.{png,jpg,jpeg,webp}", {
    eager: true,
    import: "default",
  }),
};

const formatCategoryName = (name) => {
  return name.replace(/([A-Z])/g, " $1").trim();
};

export default function AvatarPicker({ open, onOpenChange, onSelect, selectedAvatar = null }) {
  const [activeCategory, setActiveCategory] = useState("DragonBall");
  const [hoveredAvatar, setHoveredAvatar] = useState(null);

  const images = Object.values(avatarCategories[activeCategory]);
  const categories = Object.keys(avatarCategories);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 gap-0 bg-background border-border max-h-[90vh] flex flex-col">
        
        {/* Fixed Header */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate">
                  Choose Your Avatar
                </DialogTitle>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                  Select from {categories.length} anime series
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 shrink-0 -mr-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Categories - Horizontal Scrollable */}
          <div className="mt-3 sm:mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent -mx-1 px-1">
            <div className="flex gap-1.5 sm:gap-2 w-max min-w-full">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border shrink-0",
                    activeCategory === category
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-secondary/50 text-secondary-foreground border-transparent hover:bg-secondary hover:border-border"
                  )}
                >
                  #{formatCategoryName(category)}
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full">
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              
              {/* Info Bar */}
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                  {formatCategoryName(activeCategory)}
                </h3>
                <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted px-2 py-0.5 sm:py-1 rounded-full">
                  {images.length} avatars
                </span>
              </div>

              {/* Avatar Grid - All visible with vertical scroll */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 pb-4">
                {images.map((src, index) => {
                  const isSelected = selectedAvatar === src;
                  const isHovered = hoveredAvatar === src;

                  return (
                    <button
                      key={`${activeCategory}-${index}`}
                      onClick={() => {
                        onSelect(src);
                        onOpenChange(false);
                      }}
                      onMouseEnter={() => setHoveredAvatar(src)}
                      onMouseLeave={() => setHoveredAvatar(null)}
                      className={cn(
                        "group relative aspect-square rounded-lg sm:rounded-xl bg-muted/50",
                        "transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "hover:scale-105 hover:shadow-md hover:shadow-primary/10",
                        isSelected &&
                          "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 shadow-lg shadow-primary/20"
                      )}
                    >
                      {/* Image Container */}
                      <div className="absolute inset-0 p-1 sm:p-1.5">
                        <div className="relative h-full w-full rounded-md sm:rounded-lg overflow-hidden bg-background">
                          <img
                            src={src}
                            alt={`${activeCategory} avatar ${index + 1}`}
                            className={cn(
                              "h-full w-full object-cover transition-transform duration-300",
                              isHovered && !isSelected && "scale-110",
                              isSelected && "scale-105"
                            )}
                            loading="lazy"
                          />

                          {/* Selection Overlay */}
                          <div
                            className={cn(
                              "absolute inset-0 bg-primary/30 transition-opacity duration-200 flex items-center justify-center",
                              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}
                          >
                            {isSelected && (
                              <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Border */}
                      <div
                        className={cn(
                          "absolute inset-0 rounded-lg sm:rounded-xl border-2 transition-colors pointer-events-none",
                          isSelected
                            ? "border-primary"
                            : "border-transparent group-hover:border-primary/50"
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Bottom padding for scroll */}
              <div className="h-2" />
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4 shrink-0 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            Click any avatar to select it
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-xs sm:text-sm px-3 sm:px-4"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}