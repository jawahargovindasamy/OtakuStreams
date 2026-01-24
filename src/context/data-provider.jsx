import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [homedata, setHomedata] = useState(null);
  const [azlistdata, setAzlistdata] = useState(null);
  const [searchdata, setSearchdata] = useState(null);
  const [searchsuggestions, setSearchSuggestions] = useState(null);
  

  const fetchHomedata = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ANIWATCH_URL}/home`,
      );
      setHomedata(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchazlistdata = async (azlist, page = 1) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ANIWATCH_URL}/azlist/${azlist}?page=${page}`,
      );
      setAzlistdata(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchanimeinfo = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ANIWATCH_URL}/anime/${id}`,
      );
      return response.data.data.anime;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchsearchdata = async ({
    q,
    page = 1,
    type,
    status,
    rated,
    score,
    season,
    language,
    start_date,
    end_date,
    sort,
    genres,
  }) => {
    try {
      const params = new URLSearchParams();

      // Required
      if (q) params.append("q", q);

      // Optional
      params.append("page", page);
      if (type) params.append("type", type);
      if (status) params.append("status", status);
      if (rated) params.append("rated", rated);
      if (score) params.append("score", score);
      if (season) params.append("season", season);
      if (language) params.append("language", language);
      if (start_date) params.append("start_date", start_date);
      if (end_date) params.append("end_date", end_date);
      if (sort) params.append("sort", sort);
      if (genres?.length) params.append("genres", genres.join(","));

      const response = await axios.get(
        `${import.meta.env.VITE_ANIWATCH_URL}/search?${params.toString()}`,
      );

      setSearchdata(response.data);

      const res = await axios.get(
        `${import.meta.env.VITE_ANIWATCH_URL}/search/suggestion?q=${q}`,
      );

      setSearchSuggestions(res.data);
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const fetchepisodeinfo = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ANIWATCH_URL}/anime/${id}/episodes`,
      );
      return response.data
    } catch (error) {
      console.error("Error fetching Episode data:", error);
    }
  };

  useEffect(() => {
    fetchHomedata();
  }, []);

  return (
    <DataContext.Provider
      value={{
        homedata,
        azlistdata,
        fetchazlistdata,
        fetchanimeinfo,
        searchdata,
        searchsuggestions,
        fetchsearchdata,
        fetchepisodeinfo
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
