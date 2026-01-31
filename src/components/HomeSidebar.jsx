import GenresList from "./GenresList";
import Top10 from "./Top10";

const HomeSidebar = ({
  data,
  showAll,
  setShowAll,
  top10Animes,
  setTop10Animes,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Genres Section */}
      <GenresList
        data={data}
        showAll={showAll}
        setShowAll={setShowAll}
      />

      {/* Top 10 Section */}
      <Top10 data={data} top10Animes={top10Animes} setTop10Animes={setTop10Animes} />
    </div>
  );
};

export default HomeSidebar;