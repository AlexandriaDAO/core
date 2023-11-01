import React, { useState, useContext, ReactNode } from 'react';

interface SettingContext {
  topBooksCount: number,
  setTopBooksCount: React.Dispatch<React.SetStateAction<number>>,
}

const SettingsContext = React.createContext<SettingContext | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [topBooksCount, setTopBooksCount] = useState(3);

  return (
    <SettingsContext.Provider value={{ topBooksCount, setTopBooksCount }}>
      {children}
    </SettingsContext.Provider>
  );
};
