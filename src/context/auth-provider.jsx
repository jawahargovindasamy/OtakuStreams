import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState("EN");

  /* =============================
     Helpers
  ============================= */

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);


  }, []);

  const login = useCallback((data) => {
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
  }, []);

  /* =============================
     Axios Instance
  ============================= */

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

  /* =============================
     Restore session on refresh
  ============================= */

  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await api.get("/auth/me");

        const data = res.data.data;

        setUser({
          _id: data._id,
          name: data.username,
          email: data.email,
          avatar: data.avatar,
          role: data.role,
          createdAt: data.createdAt,
        });
      } catch (err) {
        // token invalid / expired
        logout();
      }
    };

    restoreUser();
  }, [api]);

  return (
    <AuthContext.Provider
      value={{
        user,
        language,
        setLanguage,
        api,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
