import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

/* -------------------- Axios Instance -------------------- */

const api = axios.create({
  baseURL: import.meta.env.VITE_ANIWATCH_URL,
  timeout: 10000,
});

/* -------------------- Retry Helper -------------------- */

const fetchWithRetry = async (fn, retries = 20, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    const shouldRetry =
      !error.response || error.response.status >= 500;

    if (retries > 0 && shouldRetry) {
      await new Promise((res) => setTimeout(res, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }

    throw error;
  }
};

/* -------------------- Context -------------------- */

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [homedata, setHomedata] = useState(null);
  const [azlistdata, setAzlistdata] = useState(null);
  const [searchdata, setSearchdata] = useState(null);

  /* -------------------- HOME -------------------- */
  const fetchHomedata = async () => {
    try {
      const res = await fetchWithRetry(() =>
        api.get("/home")
      );
      setHomedata(res.data);
    } catch (error) {
      console.error("Home fetch failed:", error);
    }
  };

  /* -------------------- A–Z LIST -------------------- */
  const fetchazlistdata = async (azlist, page = 1) => {
    try {
      const res = await api.get(`/azlist/${azlist}`, {
        params: { page },
      });
      setAzlistdata(res.data);
    } catch (error) {
      console.error("AZ list fetch failed:", error);
    }
  };

  /* -------------------- ANIME INFO -------------------- */
  const fetchanimeinfo = async (id) => {
    try {
      const res = await fetchWithRetry(() =>
        api.get(`/anime/${id}`)
      );
      return res.data?.data?.anime ?? null;
    } catch (error) {
      console.error("Anime info fetch failed:", error);
      return null;
    }
  };

  /* -------------------- SEARCH -------------------- */
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
      const params = {
        q,
        page,
        type,
        status,
        rated,
        score,
        season,
        language,
        start_date,
        end_date,
        sort,
        genres: genres?.length ? genres.join(",") : undefined,
      };

      const res = await fetchWithRetry(() =>
        api.get("/search", { params })
      );

      setSearchdata(res.data);
    } catch (error) {
      console.error("Search fetch failed:", error);
      setSearchdata(null);
    }
  };

  /* -------------------- SEARCH SUGGESTIONS -------------------- */
  const fetchsearchsuggestions = async (q) => {
    try {
      const res = await api.get("/search/suggestion", {
        params: { q },
      });
      return res.data;
    } catch (error) {
      console.error("Search suggestions failed:", error);
      return null;
    }
  };

  /* -------------------- EPISODES -------------------- */
  const fetchepisodeinfo = async (id) => {
    try {
      const res = await fetchWithRetry(() =>
        api.get(`/anime/${id}/episodes`)
      );
      return res.data ?? null;
    } catch (error) {
      console.error("Episode fetch failed:", error);
      return null;
    }
  };

  const fetchestimatedschedules = async (date) => {
    try {
      const res = await fetchWithRetry(() =>
        api.get(`/schedule?date=${date}`)
      );
      return res.data ?? null;
    } catch (error) {
      console.error("Episode fetch failed:", error);
      return null;
    }
  };

  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    fetchHomedata();
  }, []);

  return (
    <DataContext.Provider
      value={{
        homedata,
        azlistdata,
        searchdata,
        fetchHomedata,
        fetchazlistdata,
        fetchanimeinfo,
        fetchsearchdata,
        fetchsearchsuggestions,
        fetchepisodeinfo,
        fetchestimatedschedules,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

/* -------------------- Hook -------------------- */

export const useData = () => useContext(DataContext);
