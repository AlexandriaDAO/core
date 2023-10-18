import React, { createContext, useState, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [topBooksCount, setTopBooksCount] = useState(3);

  return (
    <SettingsContext.Provider value={{ topBooksCount, setTopBooksCount }}>
      {children}
    </SettingsContext.Provider>
  );
};
