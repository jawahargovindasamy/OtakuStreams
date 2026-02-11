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
      return res.data?.data ?? null;
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
      return res.data?.data ?? null;
    } catch (error) {
      console.error("Anime info fetch failed:", error);
      return null;
    }
  };

  /* -------------------- SEARCH -------------------- */

  const fetchsearch = async (keyword, page = "n") => {
    try {
      const res = await fetchWithRetry(() =>
        api.get(`/search?q=${keyword}`)
      );
      if (page === "n") {
        return res.data?.data?.anime ?? null;
      } else {
        return res.data?.data ?? null;
      }
    } catch (error) {
      console.error("Anime info fetch failed:", error);
      return null;
    }
  };

  const fetchadvancedsearch = async ({
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
        score: score?.toLowerCase(),
        season,
        language,
        start_date,
        end_date,
        sort,
        genres: genres?.length ? genres.map(g => g.toLowerCase()).join(",") : undefined,
      };

      const res = await fetchWithRetry(() => api.get("/search", { params }));
      return res.data?.data ?? null;
    } catch (error) {
      console.error("Search fetch failed:", error);
      return null;
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

  const fetchnextepisodeschedule = async (id) => {
    try {
      const res = await fetchWithRetry(() =>
        api.get(`/anime/${id}/next-episode-schedule`)
      );
      return res.data.data ?? null;
    } catch (error) {
      console.error("Episode fetch failed:", error);
      return null;
    }
  }

  const fetchcategories = async (category, page = 1) => {
    try {
      const res = await fetchWithRetry(() =>
        api.get(`/category/${category}`, {
          params: { page },
        })
      );
      return res.data.data ?? null;
    } catch (error) {
      console.error("AZ list fetch failed:", error);
    }
  };

  const fetchgenres = async (name, page = 1) => {
    try {
      const res = await fetchWithRetry(() =>
        api.get(`/genre/${name}`, {
          params: { page },
        })
      );

      return res.data.data ?? null;
    } catch (error) {
      console.error("AZ list fetch failed:", error);
    }
  };

  const fetchproducers = async (name, page = 1) => {
    try {
      const res = await fetchWithRetry(() =>
        api.get(`/producer/${name}`, {
          params: { page },
        })
      );
      return res.data.data ?? null;
    } catch (error) {
      console.error("AZ list fetch failed:", error);
    }
  };

  const fetchepisodeserver = async (id) => {
    try {
      const res = await fetchWithRetry(() =>
        api.get(`/episode/servers?animeEpisodeId=${id}`)
      );
      return res.data.data ?? null;
    } catch (error) {
      console.error("Episode server fetch failed:", error);
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
        searchdata,
        fetchHomedata,
        fetchazlistdata,
        fetchanimeinfo,
        fetchsearch,
        fetchadvancedsearch,
        fetchsearchsuggestions,
        fetchepisodeinfo,
        fetchestimatedschedules,
        fetchnextepisodeschedule,
        fetchcategories,
        fetchgenres,
        fetchproducers,
        fetchepisodeserver,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

/* -------------------- Hook -------------------- */

export const useData = () => useContext(DataContext);
