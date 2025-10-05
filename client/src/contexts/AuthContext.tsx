"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  userType: "tenant" | "manager"; // ✅ added roles
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    userType: "tenant" | "manager" // ✅ fixed type
  ) => Promise<void>;
  loginWithGoogle: () => void;
  handleGoogleCallback: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // Initialize auth from localStorage
  // -------------------------
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await fetchUserProfile(savedToken);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user profile");
      const data = await res.json();
      setUser(data.data.user);
    } catch (err) {
      console.error("Fetch profile error:", err);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    setUser(data.data.user);
    setToken(data.data.token);
    localStorage.setItem("token", data.data.token);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    userType: "tenant" | "manager" // ✅ added
  ) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, userType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    setUser(data.data.user);
    setToken(data.data.token);
    localStorage.setItem("token", data.data.token);
  };

  const loginWithGoogle = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const handleGoogleCallback = async (tokenFromUrl: string) => {
    if (!tokenFromUrl) throw new Error("No token provided");

    setToken(tokenFromUrl);
    localStorage.setItem("token", tokenFromUrl);

    try {
      await fetchUserProfile(tokenFromUrl);
    } catch (err) {
      console.error("Fetch profile after Google login failed:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogle,
        handleGoogleCallback,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
