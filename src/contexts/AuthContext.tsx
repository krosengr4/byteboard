"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

interface User {
  id: number;
  username: string;
  role: string;
  firstName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // TODO: Validate token and fetch user info
      // For now, we'll just set loading to false
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { data } = await api.post("login", { username, password });

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Set user data
      setUser({
        id: data.user.user_id,
        username: data.user.username,
        role: data.user.role,
        firstName: data.user.first_name,
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (
    username: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const { data } = await api.post("/register", {
        username,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Set user data
      setUser({
        id: data.user.user_id,
        username: data.user.username,
        role: data.user.role,
        firstName: data.profile?.first_name || "",
      });
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
