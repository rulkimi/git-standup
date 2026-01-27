import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

type RepositoriesContextType = {
  repositories: string[];
  setRepositories: (repos: string[]) => void;
};

const LOCALSTORAGE_KEY = "selected_repositories";

const RepositoriesContext = createContext<RepositoriesContextType | undefined>(undefined);

function getInitialRepositories(): string[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(LOCALSTORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Ignore malformed localStorage
    }
  }
  return [];
}

export const RepositoriesProvider = ({ children }: { children: ReactNode }) => {
  const [repositories, setRepositoriesState] = useState<string[]>(getInitialRepositories);

  // Whenever repositories changes, persist to localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(repositories));
    }
  }, [repositories]);

  // Memoized setter that updates both state and localStorage
  const setRepositories = useCallback((repos: string[]) => {
    setRepositoriesState(repos);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(repos));
    }
  }, []);

  return (
    <RepositoriesContext.Provider value={{ repositories, setRepositories }}>
      {children}
    </RepositoriesContext.Provider>
  );
};

export const useRepositories = () => {
  const context = useContext(RepositoriesContext);
  if (!context) {
    throw new Error("useRepositories must be used within a RepositoriesProvider");
  }
  return context;
};