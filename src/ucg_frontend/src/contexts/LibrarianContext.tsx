// contexts/ActiveLibrarianContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface ActiveLibrarian {
  hash: bigint;
  name: string;
}

interface ActiveLibrarianContextProps {
  activeLibrarian: ActiveLibrarian | null;
  setActiveLibrarian: (librarian: ActiveLibrarian | null) => void;
}

const ActiveLibrarianContext = createContext<ActiveLibrarianContextProps>({
  activeLibrarian: null,
  setActiveLibrarian: () => {},
});

// export const useActiveLibrarian = () => useContext(ActiveLibrarianContext);
export const useActiveLibrarian = () => {
  const { activeLibrarian, setActiveLibrarian } = useContext(ActiveLibrarianContext);
  return { activeLibrarian, setActiveLibrarian };
};

export const ActiveLibrarianProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLibrarian, setActiveLibrarian] = useState<ActiveLibrarian | null>(null);
  console.log(" Active LIbrarian: ", activeLibrarian)

  return (
    <ActiveLibrarianContext.Provider value={{ activeLibrarian, setActiveLibrarian }}>
      {children}
    </ActiveLibrarianContext.Provider>
  );
};