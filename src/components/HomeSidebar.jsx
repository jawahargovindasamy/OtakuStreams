import SectionHeader from "./SectionHeader";
import VerticalList from "./VerticalList";
import { Button } from "@/components/ui/button";

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
    <>
      {/* Genres */}
      <div>
        <SectionHeader title="Genres" />
        <div className="bg-gray-900 p-4 rounded-xl">
          <div className="grid grid-cols-3 gap-3">
            {genresToShow.map((genre) => (
              <div
                key={genre}
                onClick={() =>
                  navigate(`/genres/${encodeURIComponent(genre.toLowerCase())}`)
                }
                className="cursor-pointer text-sm font-medium transition hover:text-white"
                style={{ color: getGenreColor(genre) }}
              >
                {genre}
              </div>
            ))}
          </div>

          {data.genres.length > maxInitial && (
            <button
              className="cursor-pointer w-full mt-3 py-2 rounded text-white bg-white/10"
              onClick={() => setShowAll((p) => !p)}
            >
              {showAll ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>

      {/* Top 10 */}
      <div className="mt-6">
        <SectionHeader title="Top 10" />
        <div className="flex gap-2 mb-3">
          {["today", "week", "month"].map((t) => (
            <Button
              key={t}
              onClick={() => setTop10Animes(t)}
              className="cursor-pointer capitalize"
              variant={top10Animes === t ? "default" : "secondary"}
            >
              {t}
            </Button>
          ))}
        </div>

        <VerticalList anime={data.top10Animes[top10Animes]} list={10} />
      </div>
    </>
  );
};

export default HomeSidebar;
