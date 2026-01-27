import React, { createContext, useContext, useState, ReactNode } from "react";

type RepositoriesContextType = {
  repositories: string[];
  setRepositories: (repos: string[]) => void;
};

const RepositoriesContext = createContext<RepositoriesContextType | undefined>(undefined);

export const RepositoriesProvider = ({ children }: { children: ReactNode }) => {
  const [repositories, setRepositories] = useState<string[]>([]);

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