import SectionHeader from "./SectionHeader";
import VerticalList from "./VerticalList";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const HomeSidebar = ({
  data,
  navigate,
  genresToShow,
  getGenreColor,
  showAll,
  setShowAll,
  maxInitial,
  top10Animes,
  setTop10Animes,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Genres Section */}
      <section className="space-y-3 sm:space-y-4">
        <SectionHeader title="Genres" />
        <div className="bg-card/50 border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {genresToShow.map((genre) => (
              <div
                key={genre}
                onClick={() =>
                  navigate(`/genres/${encodeURIComponent(genre.toLowerCase())}`)
                }
                className="group cursor-pointer text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-muted/50 hover:bg-accent border border-transparent hover:border-border/50 transition-all duration-200 flex items-center gap-1.5"
              >
                <span 
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getGenreColor(genre) }}
                />
                <span className="truncate text-foreground group-hover:text-primary transition-colors">
                  {genre}
                </span>
              </div>
            ))}
          </div>

          {data.genres.length > maxInitial && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setShowAll((p) => !p)}
            >
              {showAll ? (
                <span className="flex items-center gap-1.5">
                  Show Less <ChevronUp className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Show More <ChevronDown className="h-3.5 w-3.5" />
                </span>
              )}
            </Button>
          )}
        </div>
      </section>

      {/* Top 10 Section */}
      <section className="space-y-3 sm:space-y-4">
        <SectionHeader title="Top 10" />
        
        {/* Time Period Toggle */}
        <div className="flex gap-1.5 sm:gap-2 p-1 bg-muted/50 rounded-lg border border-border/50">
          {["today", "week", "month"].map((t) => (
            <Button
              key={t}
              onClick={() => setTop10Animes(t)}
              size="sm"
              className={`flex-1 capitalize text-xs sm:text-sm font-medium transition-all duration-200 rounded-md ${
                top10Animes === t
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {t}
            </Button>
          ))}
        </div>

        <div className="bg-card/30 rounded-xl sm:rounded-2xl border border-border/50 p-2 sm:p-3">
          <VerticalList 
            anime={data.top10Animes[top10Animes]} 
            list={10} 
          />
        </div>
      </section>
    </div>
  );
};

export default HomeSidebar;