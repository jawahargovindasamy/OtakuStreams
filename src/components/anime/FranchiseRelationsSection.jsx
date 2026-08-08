import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { slugify } from "@/lib/utils";

const FranchiseRelationsSection = ({ relations }) => {
  const navigate = useNavigate();

  if (!relations || relations.length === 0) return null;

  return (
    <section className="w-full py-6 sm:py-8 text-foreground font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 space-y-6 sm:space-y-8">
        
        {/* Section Header */}
        <div className="space-y-1 text-left">
          <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em]">
            RELATIONS
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
            Part of the story
          </h2>
        </div>

        {/* Relation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
          {relations.map((rel, idx) => {
            const node = rel.node || rel.media || rel;
            const title =
              node?.title?.english ||
              node?.title?.romaji ||
              node?.title?.native ||
              rel.name ||
              "Anime Title";

            const animeId = node?.id || node?.idMal || rel.id;
            const poster = node?.coverImage?.large || node?.coverImage?.extraLarge || rel.poster;
            const bgColor = node?.coverImage?.color || "var(--card)";
            const relationType = (rel.relationType || rel.type || "RELATED").replace(/_/g, " ");
            const format = (node?.format || node?.type || "TV").replace("_", " ");
            const score = node?.averageScore ? `${node.averageScore}%` : null;

            const handleCardClick = () => {
              navigate(`/${slugify(title)}/${animeId}`);
            };

            return (
              <div
                key={animeId || idx}
                onClick={handleCardClick}
                className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 items-center p-3 rounded-2xl border border-border/60 hover:border-primary/50 bg-card/30 hover:bg-card/60 transition-all duration-300 cursor-pointer group text-left shadow-soft"
              >
                {/* 88px 2:3 Ratio Poster */}
                <div
                  style={{ backgroundColor: bgColor }}
                  className="w-[88px] aspect-[2/3] rounded-xl overflow-hidden shrink-0 relative bg-muted shadow-xs"
                >
                  <img
                    src={poster}
                    alt={`${title} poster`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content Block */}
                <div className="space-y-1.5 min-w-0">
                  {/* Relationship Badge */}
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[10px] font-bold uppercase tracking-wider inline-block">
                    {relationType}
                  </span>

                  {/* Title */}
                  <h3 className="font-display font-semibold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {title}
                  </h3>

                  {/* Format & Score Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans">
                    <span>{format}</span>
                    {score && (
                      <span className="flex items-center gap-1 text-success font-mono font-semibold">
                        <Star className="w-3 h-3 fill-current" />
                        {score}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FranchiseRelationsSection;
