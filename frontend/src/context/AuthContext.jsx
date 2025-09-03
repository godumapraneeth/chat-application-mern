import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [totalUnread, setTotalUnread] = useState(0); // NEW

  const login = (data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setTotalUnread(0);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, totalUnread, setTotalUnread }}
    >
      {children}
    </AuthContext.Provider>
  );
};
