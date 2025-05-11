"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  uuid: string;
  username: string;
  role: string;
};

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loadingUser: boolean;
  isSessionValid: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(true);

  useEffect(() => {
    async function loadUser() {
      // Load user from API
      try {
        const response = await fetch("/api/auth/user");
        if (!response.ok) {
          setUser(null);
          setIsSessionValid(false);
        } else {
          const data = await response.json();
          setUser(data.user);
          setIsSessionValid(true);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
        setIsSessionValid(false);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();

    // TODO: Implement session validation - need solution that has good performance

    // Check if session is valid every 1 minute
    // const intervalId = setInterval(loadUser, 60 * 1000);
    // return () => clearInterval(intervalId);
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser, loadingUser, isSessionValid }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
