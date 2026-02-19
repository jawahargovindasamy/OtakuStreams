import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState("EN");
  const [continueWatching, setContinueWatching] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  const [ignoredFolders, setIgnoredFolders] = useState({
    watching: false,
    onHold: false,
    planToWatch: false,
    dropped: false,
    completed: false,
  });

  useEffect(() => {
    if (!user?.notificationIgnore) return;

    setIgnoredFolders({
      watching: user.notificationIgnore.watching,
      onHold: user.notificationIgnore.on_hold,
      planToWatch: user.notificationIgnore.plan_to_watch,
      dropped: user.notificationIgnore.dropped,
      completed: user.notificationIgnore.completed,
    });
  }, [user]);


  /* =============================
     Helpers
  ============================= */

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setContinueWatching([]);


  }, []);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_OTAKUSTREAMS_BACKEND_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // attach token
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // auto logout on 401
    instance.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [logout]);

  const fetchContinueWatching = useCallback(async () => {
    try {
      const res = await api.get("/continue-watching");

      setContinueWatching(res.data.data || []);

    } catch (error) {
      console.error("Failed to fetch continue watching:", error);
      setContinueWatching([]);
    }
  }, [api]);


  const fetchWatchlist = useCallback(async (status) => {
    try {
      const res = await api.get("/watchlist", {
        params: status ? { ...status } : {},
      });

      if (!status)
        setWatchlist(res.data.data || []);

      return res.data.data || [];

    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
      setWatchlist([]);
    }
  }, [api])

  const watchlistMap = useMemo(() => {
    const map = new Map();

    watchlist.forEach((item) => {
      map.set(item.animeId, item);
    });

    return map;
  }, [watchlist]);

  const updateWatchlist = useCallback(
    async (id, status) => {
      try {
        const res = await api.put(`/watchlist/${id}`, {
          status,
        });

        const updatedItem = res.data.data;

        setWatchlist((prev) => {
          const index = prev.findIndex(
            (item) => item._id === updatedItem._id
          );

          if (index !== -1) {
            const copy = [...prev];
            copy[index] = updatedItem;
            return copy;
          }

          return [updatedItem, ...prev];
        });

        return updatedItem;
      } catch (error) {
        console.error("Failed to update watchlist:", error);
        throw error;
      }
    },
    [api]
  );

  const addWatchlist = useCallback(async (animeId, animeTitle, animeImage, status) => {
    try {
      const res = await api.post("/watchlist", {
        animeId: animeId,
        animeTitle: animeTitle,
        animeImage: animeImage,
        status: status,
      });

      const updatedItem = res.data.data;

      console.log(updatedItem);


      setWatchlist((prev) => [updatedItem, ...prev]);

      return updatedItem;

    } catch (error) {
      console.error("Failed to Add watchlist:", error);
    }
  }, [api])


  // const 


  const removeWatchlist = useCallback(async (id) => {
    try {
      await api.delete(`/watchlist/${id}`);
      setWatchlist((prev) => prev.filter((item) => item._id !== id))

    } catch (error) {
      console.error("Failed to fetch Remove watchlist:", error);
    }


  }, [api]);

  const login = useCallback(async (data) => {
    localStorage.setItem("token", data.token);

    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);

    await fetchContinueWatching();
    await fetchWatchlist();
  }, [fetchContinueWatching, fetchWatchlist]);

  const updateProgress = useCallback(
    async (progressData) => {
      try {
        const res = await api.post("/continue-watching", progressData);
        const updated = res.data.data;

        setContinueWatching((prev) => {
          const index = prev.findIndex(
            (i) =>
              i.animeId === updated.animeId
          );

          if (index !== -1) {
            const copy = [...prev];
            copy[index] = updated;

            const [item] = copy.splice(index, 1);
            return [item, ...copy];
          }

          return [updated, ...prev];
        });

      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    },
    [api]
  );

  const updateProfile = useCallback(
    async (profileData) => {
      try {
        const res = await api.put("users/profile", profileData);
        const updated = res.data.data;

        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));

        if (!res.data.success) {
          throw new Error(res.data.message);
        }


      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    }, [api])

  const updateSettings = useCallback(
    async (settings) => {
      try {
        const res = await api.put("users/settings", settings);
        const updated = res.data.data;

        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    }, [api]);





  /* ============================= 
   Restore session on refresh 
============================= */
  useEffect(() => {
    const restoreUser = async () => {
      // Check localStorage first
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        await fetchContinueWatching();
        await fetchWatchlist();
        return;
      }

      // If not in localStorage, fetch from API
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await api.get("/auth/me");
        const data = res.data.data;

        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));

        await fetchContinueWatching();
        await fetchWatchlist();
      } catch {
        // token invalid / expired
        logout();
      }
    };

    restoreUser();
  }, [api, fetchContinueWatching, fetchWatchlist, logout]);




  return (
    <AuthContext.Provider
      value={{
        user,
        api,
        language,
        setLanguage,
        ignoredFolders,
        setIgnoredFolders,
        login,
        logout,
        continueWatching,
        setContinueWatching,
        watchlist,
        setWatchlist,
        fetchContinueWatching,
        fetchWatchlist,
        watchlistMap,
        updateWatchlist,
        addWatchlist,
        removeWatchlist,
        updateProgress,
        updateProfile,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
