import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { slugify } from "@/lib/utils";

const AuthContext = createContext(null);

const THREE_HOURS = 1000 * 60 * 60 * 3;

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem("anime_language") || "EN";
    } catch {
      return "EN";
    }
  });

  const setLanguage = useCallback((newLang) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem("anime_language", newLang);
    } catch {}
  }, []);
  const [continueWatching, setContinueWatching] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [notification, setNotification] = useState([]);
  const [preferences, setPreferences] = useState({ audio: "sub", server: "hd-1" });
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  const [ignoredFolders, setIgnoredFolders] = useState({
    watching: false,
    onHold: false,
    planToWatch: false,
    dropped: false,
    completed: false,
  });

  const cacheRef = useRef(new Map());
  const inFlightRef = useRef(new Map());

  const fetchWithCache = useCallback(async (key, fn, ttl = THREE_HOURS) => {
    const now = Date.now();
    const cached = cacheRef.current.get(key);

    if (cached && now - cached.timestamp >= ttl) {
      cacheRef.current.delete(key);
    }

    if (cached && now - cached.timestamp < ttl) {
      return cached.data;
    }

    if (inFlightRef.current.has(key)) {
      return inFlightRef.current.get(key);
    }

    const promise = (async () => {
      try {
        const result = await fn();
        if (result !== null) {
          cacheRef.current.set(key, { data: result, timestamp: Date.now() });
        }
        return result;
      } finally {
        inFlightRef.current.delete(key);
      }
    })();

    inFlightRef.current.set(key, promise);
    return promise;
  }, []);

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

    cacheRef.current.clear();
    inFlightRef.current.clear();

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
      const data = await fetchWithCache("continue-watching", async () => {
        const res = await api.get("/continue-watching");
        return res.data.data ?? null;
      });

      setContinueWatching(data || []);
    } catch (error) {
      console.error("Failed to fetch continue watching:", error);
      setContinueWatching([]);
    }
  }, [api, fetchWithCache]);


  const fetchWatchlist = useCallback(async (status) => {
    const cacheKey = status
      ? `watchlist-${JSON.stringify(status)}`
      : "watchlist-all";

    try {
      const data = await fetchWithCache(cacheKey, async () => {
        const res = await api.get("/watchlist", {
          params: status ? { ...status } : {},
        });
        return res.data.data ?? null;
      });

      if (!status) setWatchlist(data || []);
      return data || [];
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
      setWatchlist([]);
    }
  }, [api, fetchWithCache]);

  const fetchPreferences = useCallback(async () => {
    // If not logged in, load from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      const stored = localStorage.getItem("preferences");
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
      return;
    }

    try {
      const res = await api.get("/users/preferences");
      if (res.data.success) {
        setPreferences(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    }
  }, [api]);

  const updatePreferences = useCallback(async (newPrefs) => {
    // Optimistic update
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };

      // If not logged in, save to localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.setItem("preferences", JSON.stringify(updated));
      }

      return updated;
    });

    // If logged in, save to API
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await api.put("/users/preferences", newPrefs);
      } catch (error) {
        console.error("Failed to update preferences:", error);
      }
    }
  }, [api]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notification");
      setNotification(res.data.data || []);

    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotification([]);
    }
  }, [api])

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Use backend URL, stripping /api if it exists so socket.io connects to root
    const baseUrl = import.meta.env.VITE_OTAKUSTREAMS_BACKEND_URL?.replace(/\/api\/?$/, '');
    
    const newSocket = io(baseUrl || "http://localhost:5000", {
      auth: {
        token: token,
      },
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connected:", newSocket.id);
      fetchNotifications();
    });

    newSocket.on("newNotification", (notif) => {
      console.log("New real-time notification received:", notif);
      
      // Play notification sound
      try {
        const audio = new Audio("/notification.mp3");
        audio.play().catch((err) => {
          console.warn("Browser blocked notification sound autoplay:", err);
        });
      } catch (err) {
        console.error("Failed to play notification sound:", err);
      }

      setNotification((prev) => {
        // Prevent duplicate notifications in case of reconnects or dual-events
        if (prev.some((n) => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, fetchNotifications]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

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

        cacheRef.current.delete("watchlist-all");

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
      cacheRef.current.delete("watchlist-all");

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
      cacheRef.current.delete("watchlist-all");

    } catch (error) {
      console.error("Failed to fetch Remove watchlist:", error);
    }


  }, [api]);

  const login = useCallback(async (data) => {
    localStorage.setItem("token", data.token);

    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);

    cacheRef.current.clear();

    await fetchContinueWatching();
    await fetchWatchlist();
    await fetchNotifications();
    await fetchPreferences();
  }, [fetchContinueWatching, fetchWatchlist, fetchNotifications, fetchPreferences]);


  const markRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/notification/${notificationId}/read`);
      setNotification((prev) => prev.map((item) => item._id === notificationId ? { ...item, read: true } : item));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, [api])

  const clearNotifications = useCallback(async () => {
    try {
      await api.delete("/notification/clear");
      setNotification([]);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }, [api])

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/notification/${notificationId}`);
      setNotification((prev) => prev.filter((item) => item._id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setNotification((prev) => prev.filter((item) => item._id !== notificationId));
    }
  }, [api])

  const updateProgress = useCallback(
    async (progressData) => {
      if (!user) return;
      try {
        const res = await api.post("/continue-watching", progressData);
        const updated = res.data.data;

        setContinueWatching((prev) => {
          const index = prev.findIndex((i) => i.animeId === updated.animeId);
          if (index !== -1) {
            const copy = [...prev];
            copy[index] = updated;
            const [item] = copy.splice(index, 1);
            return [item, ...copy];
          }
          return [updated, ...prev];
        });

        cacheRef.current.delete("continue-watching");
      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    },
    [api, user]
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
        await fetchNotifications();
        await fetchPreferences();
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
        await fetchNotifications();
        await fetchPreferences();
      } catch {
        // token invalid / expired
        logout();
      }
    };

    restoreUser();
  }, [api, fetchContinueWatching, fetchWatchlist, fetchNotifications, logout]);


  const handleRandom = async () => {
    try {
      const { data } = await api.get("/random");

      if (data?.success && data?.data?.id) {
        navigate(`/${slugify(data.data.name)}/${data.data.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };



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
        notification,
        fetchContinueWatching,
        fetchWatchlist,
        fetchNotifications,
        watchlistMap,
        removeWatchlist,
        updateWatchlist,
        addWatchlist,
        preferences,
        updatePreferences,
        fetchPreferences,
        updateProfile,
        updateSettings,
        markRead,
        clearNotifications,
        deleteNotification,
        updateProgress,
        handleRandom,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
