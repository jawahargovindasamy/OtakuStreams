import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function AvatarPicker({ open, onOpenChange, onSelect }) {
  const [activeCategory, setActiveCategory] = useState("DragonBall");

  const images = Object.values(avatarCategories[activeCategory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Choose Avatar</DialogTitle>
        </DialogHeader>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(avatarCategories).map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
            >
              #{category}
            </Button>
          ))}
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-4 gap-4">
          {images.map((src) => (
            <button
              key={src}
              onClick={() => {
                onSelect(src);
                onOpenChange(false);
              }}
              className={cn(
                "rounded-full h-24 w-24 border-2 border-transparent hover:border-primary transition"
              )}
            >
              <img
                src={src}
                alt="avatar"
                className="rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
