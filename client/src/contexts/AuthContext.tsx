'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: () => void;
  handleGoogleCallback: (token: string) => void; // keep it
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
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
      if (!res.ok) throw new Error('Failed to fetch user profile');
      const data = await res.json();
      setUser(data.data.user);
    } catch (err) {
      console.error('Fetch profile error:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const loginWithGoogle = () => {
    // Redirect to server Google OAuth route
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const handleGoogleCallback = (tokenFromUrl: string) => {
    // Store token from Google OAuth redirect and fetch user profile
    localStorage.setItem('token', tokenFromUrl);
    setToken(tokenFromUrl);
    fetchUserProfile(tokenFromUrl);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, loginWithGoogle, handleGoogleCallback, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
