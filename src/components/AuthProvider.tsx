"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: "admin" | "consumer" | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  isLoading: true,
});

const ADMIN_EMAILS = [
  "prathamwadiyar@gmail.com",
  "prathamw092@gmail.com"
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<"admin" | "consumer" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkAuth = async () => {
      // 1. Check for real Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        setUser(session.user);
        setRole(ADMIN_EMAILS.includes(session.user.email || "") ? "admin" : "consumer");
        setIsLoading(false);
      } else {
        // 2. Check for Mock Admin Bypass
        const mockUserJson = localStorage.getItem("resource_watch_mock_user");
        if (mockUserJson) {
          try {
            const mockData = JSON.parse(mockUserJson);
            setUser(mockData.user);
            setRole("admin");
          } catch (e) {
            localStorage.removeItem("resource_watch_mock_user");
          }
        }
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setRole(ADMIN_EMAILS.includes(session.user.email || "") ? "admin" : "consumer");
      } else {
        // If Supabase logs out, also check if we should clear mock
        const mockUserJson = localStorage.getItem("resource_watch_mock_user");
        if (!mockUserJson) {
          setSession(null);
          setUser(null);
          setRole(null);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, role, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
