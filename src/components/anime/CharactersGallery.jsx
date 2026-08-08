import React from "react";

const CharactersGallery = ({ characters }) => {
  if (!characters || characters.length === 0) return null;

  return (
    <section className="w-full border-y border-border/70 bg-card/20 py-6 sm:py-8 text-foreground font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 space-y-6 sm:space-y-8">
        
        {/* Section Header */}
        <div className="space-y-1 text-left">
          <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em]">
            CAST
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
            Characters
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl font-sans">
            Who make the quiet feel alive.
          </p>
        </div>

        {/* Characters Layout: Mobile Snap Rail / Desktop Responsive Grid */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-3 sm:pb-0 snap-x snap-mandatory w-full">
          {characters.map((char, idx) => {
            const characterObj = char.character || char.node || char;
            const charName =
              typeof characterObj?.name === "object"
                ? characterObj?.name?.full || characterObj?.name?.userPreferred || characterObj?.name?.native
                : characterObj?.name || char?.name || "Character";

            const charRole = (characterObj?.role || char?.role || "MAIN").replace(/_/g, " ");

            const charImage =
              characterObj?.image?.large ||
              characterObj?.image?.medium ||
              (typeof characterObj?.image === "string" ? characterObj.image : null) ||
              characterObj?.poster ||
              char?.poster ||
              char?.image ||
              "";

            const bgColor = characterObj?.coverColor || char?.coverColor || "var(--card)";

            // Voice actor info
            const vaObj = char.voiceActor || (Array.isArray(char.voiceActors) ? char.voiceActors[0] : char.voiceActors);
            const vaName =
              typeof vaObj?.name === "object"
                ? vaObj?.name?.full || vaObj?.name?.userPreferred
                : vaObj?.name || "To be announced";
            const vaLang = vaObj?.languageV2 || vaObj?.language || "Japanese";

            return (
              <article
                key={characterObj?.id || idx}
                className="snap-start shrink-0 w-[72vw] max-w-[240px] sm:w-auto cursor-pointer group flex flex-col focus-within:ring-2 focus-within:ring-primary rounded-2xl"
              >
                {/* 2:3 Ratio Portrait Container */}
                <div
                  style={{ backgroundColor: bgColor }}
                  className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-card/40 border border-border/60 hover:border-primary/50 shadow-soft hover:shadow-glow transition-all duration-500 group-hover:-translate-y-2"
                >
                  {/* Character Image */}
                  <img
                    src={charImage}
                    alt={`${charName} portrait`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Scrim Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                  {/* Floating Voice-Actor Glass Plate */}
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-surface/90 backdrop-blur-md border border-border/70 text-left shadow-soft opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-3 sm:group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block leading-none mb-1">
                      VOICE ACTOR
                    </span>
                    <p className="text-xs font-semibold text-foreground truncate leading-tight">
                      {vaName}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5 font-mono">
                      {vaLang}
                    </p>
                  </div>
                </div>

                {/* Card Metadata outside image */}
                <div className="mt-3 text-left space-y-0.5">
                  <h3 className="font-display font-bold text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {charName}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-sans">
                    {charRole}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CharactersGallery;
