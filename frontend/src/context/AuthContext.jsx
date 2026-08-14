import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { api } from "../services/api";

// Create context FIRST
const AuthContext = createContext(null);

// Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user after page refresh
  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("skillbytes_user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error(
        "Failed to restore user:",
        error
      );

      localStorage.removeItem(
        "skillbytes_user"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  async function login(credentials) {
    const response = await api.login(
      credentials
    );

    const loggedInUser =
      response?.user || response;

    setUser(loggedInUser);

    localStorage.setItem(
      "skillbytes_user",
      JSON.stringify(loggedInUser)
    );

    return response;
  }

  // Logout
  function logout() {
    setUser(null);

    localStorage.removeItem(
      "skillbytes_user"
    );
  }

  const value = {
    user,
    loading,

    isAuthenticated: Boolean(user),

    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}