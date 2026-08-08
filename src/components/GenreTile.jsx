import React from "react";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/lib/utils";

const GenreTile = ({ name, from, to }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/genre/${slugify(name)}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Browse ${name} anime`}
      className="group relative min-h-24 p-4 w-full rounded-2xl overflow-hidden flex items-end text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 active:scale-[0.98] cursor-pointer"
    >
      {/* Layer 0: Gradient Surface */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
      />

      {/* Layer 1: Dark Scrim (Lightens on hover for gradient bloom) */}
      <div
        className="absolute inset-0 bg-black/25 transition-opacity duration-200 group-hover:bg-black/10"
        aria-hidden="true"
      />

      {/* Layer 2: Genre Label (Bottom-Left anchored) */}
      <span className="relative z-10 font-display font-bold text-white text-base sm:text-lg leading-none select-none">
        {name}
      </span>
    </button>
  );
};

export default GenreTile;
