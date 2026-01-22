import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    name: "Jawahar",
    email: "jawahar@email.com",
    createdAt: "2023-01-01",
    avatar: "/src/assets/JJK/av-jjk-02.png",
  });

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
