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



  const login = useCallback(async (data) => {
    localStorage.setItem("token", data.token);

    const mappedUser = {
      _id: data._id,
      name: data.username,
      email: data.email,
      avatar: data.avatar,
      role: data.role,
      createdAt: data.createdAt,
    };

    localStorage.setItem("user", JSON.stringify(mappedUser));
    setUser(mappedUser);

    await fetchContinueWatching();
  }, []);
  
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
        return;
      }

      // If not in localStorage, fetch from API
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await api.get("/auth/me");
        const data = res.data.data;

        const mappedUser = {
          _id: data._id,
          name: data.username,
          email: data.email,
          avatar: data.avatar,
          role: data.role,
          createdAt: data.createdAt,
        };

        setUser(mappedUser);
        localStorage.setItem("user", JSON.stringify(mappedUser));

        await fetchContinueWatching();
      } catch {
        // token invalid / expired
        logout();
      }
    };

    restoreUser();
  }, [api, fetchContinueWatching, logout]);




  return (
    <AuthContext.Provider
      value={{
        user,
        api,
        language,
        setLanguage,
        login,
        logout,
        continueWatching,
        setContinueWatching,
        fetchContinueWatching,
        updateProgress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
