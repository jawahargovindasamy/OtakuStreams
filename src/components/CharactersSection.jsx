// components/CharactersSection.jsx
import React from "react";
import { Users } from "lucide-react";
import CharacterCard from "./CharacterCard";
import SectionHeader from "@/components/SectionHeader";

const CharactersSection = ({ charactersVoiceActors }) => {
  if (!charactersVoiceActors?.length) return null;

  return (
    <section>
      {/* Header */}
      <SectionHeader 
        title="Characters & Voice Actors" 
        icon={Users}
        className="mb-4 sm:mb-6"
      />

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {charactersVoiceActors.map((item) => (
          <CharacterCard key={item.character.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default CharactersSection;