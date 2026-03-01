import axios from "axios";
import { createContext, useContext, useEffect, useState, useRef } from "react";

/* -------------------- Axios Instance -------------------- */

const api = axios.create({
  baseURL: import.meta.env.VITE_ANIWATCH_URL,
  timeout: 10000,
});

/* -------------------- Retry Helper -------------------- */

const fetchWithRetry = async (fn, retries = 5, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    const shouldRetry =
      !error.response || error.response.status >= 500;

    if (retries > 0 && shouldRetry) {
      await new Promise((res) => setTimeout(res, delay));
      return fetchWithRetry(fn, retries - 1, Math.min(delay * 2, 8000));
    }

    throw error;
  }
};

/* -------------------- Context -------------------- */

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [homedata, setHomedata] = useState(null);

  const cacheRef = useRef(new Map());
  const inFlightRef = useRef(new Map());
  const CACHE_TTL = 1000 * 60 * 10;



  const fetchWithCache = async (key, fn, ttl = CACHE_TTL) => {
    const now = Date.now();
    const cached = cacheRef.current.get(key);

    // 🧹 Remove expired cache
    if (cached && now - cached.timestamp >= ttl) {
      cacheRef.current.delete(key);
    }

    // ✅ Return valid cache
    if (cached && now - cached.timestamp < ttl) {
      return cached.data;
    }

    // 🔁 Deduplicate in-flight requests
    if (inFlightRef.current.has(key)) {
      return inFlightRef.current.get(key);
    }

    const promise = (async () => {
      try {
        const result = await fn();

        cacheRef.current.set(key, {
          data: result,
          timestamp: Date.now(),
        });

        return result;
      } finally {
        inFlightRef.current.delete(key);
      }
    })();

    inFlightRef.current.set(key, promise);
    return promise;
  };

  /* -------------------- HOME -------------------- */
  const fetchHomedata = async () => {
    try {
      const data = await fetchWithCache("home", async () => {
        const res = await fetchWithRetry(() =>
          api.get("/home")
        );
        return res.data;
      });

      setHomedata(data);
      return data;
    } catch (error) {
      console.error("Home fetch failed:", error);
      return null;
    }
  };

  /* -------------------- A–Z LIST -------------------- */
  const fetchazlistdata = async (azlist, page = 1) => {
    const key = `azlist-${azlist}-page-${page}`;

    return fetchWithCache(key, async () => {
      try {
        const res = await fetchWithRetry(() =>
          api.get(`/azlist/${azlist}`, {
            params: { page },
          })
        );

        return res.data?.data ?? null;
      } catch (error) {
        console.error("AZ list fetch failed:", error);
        return null;
      }
    });
  };

  /* -------------------- ANIME INFO -------------------- */
  const fetchanimeinfo = async (id) => {
    return fetchWithCache(`anime-${id}`, async () => {
      try {
        const res = await fetchWithRetry(() =>
          api.get(`/anime/${id}`)
        );
        return res.data?.data ?? null;
      } catch (error) {
        console.error("Anime info fetch failed:", error);
        return null;
      }
    });
  };

  /* -------------------- SEARCH -------------------- */

  const fetchsearch = async (keyword, page = 1) => {
    const key = `search-${keyword}-page-${page}`;

    return fetchWithCache(key, async () => {
      const res = await fetchWithRetry(() =>
        api.get(`/search`, {
          params: { q: keyword, page }
        })
      );

      return res.data?.data ?? null;
    });
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
    return fetchWithCache(`episodes-${id}`, async () => {
      try {
        const res = await fetchWithRetry(() =>
          api.get(`/anime/${id}/episodes`)
        );
        return res.data ?? null;
      } catch (error) {
        console.error("Episode fetch failed:", error);
        return null;
      }
    });
  };

  const fetchestimatedschedules = async (date) => {
    const key = `schedule-${date}`;
    const ONE_DAY = 1000 * 60 * 60 * 24;

    return fetchWithCache(key, async () => {
      try {
        const res = await fetchWithRetry(() =>
          api.get(`/schedule`, {
            params: { date },
          })
        );

        return res.data ?? null;
      } catch (error) {
        console.error("Schedule fetch failed:", error);
        return null;
      }
    },ONE_DAY);
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
    const key = `category-${category}-page-${page}`;

    return fetchWithCache(key, async () => {
      try {
        const res = await fetchWithRetry(() =>
          api.get(`/category/${category}`, {
            params: { page },
          })
        );

        return res.data?.data ?? null;
      } catch (error) {
        console.error("Category fetch failed:", error);
        return null;
      }
    });
  };

  const fetchgenres = async (name, page = 1) => {
    const key = `genre-${name}-page-${page}`;

    return fetchWithCache(key, async () => {
      try {
        const res = await fetchWithRetry(() =>
          api.get(`/genre/${name}`, {
            params: { page },
          })
        );

        return res.data?.data ?? null;
      } catch (error) {
        console.error("Genre fetch failed:", error);
        return null;
      }
    });
  };

  const fetchproducers = async (name, page = 1) => {
    const key = `producer-${name}-page-${page}`;

    return fetchWithCache(key, async () => {
      try {
        const res = await fetchWithRetry(() =>
          api.get(`/producer/${name}`, {
            params: { page },
          })
        );

        return res.data?.data ?? null;
      } catch (error) {
        console.error("Producer fetch failed:", error);
        return null;
      }
    });
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
    const cached = cacheRef.current.get("home");

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setHomedata(cached.data);
    } else {
      fetchHomedata();
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        homedata,
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
