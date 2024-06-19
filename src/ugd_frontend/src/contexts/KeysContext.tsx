// contexts/KeysContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface Keys {
  publicKey: string;
  privateKey: string;
}

interface KeysContextProps {
  Keys: Keys | null;
  setKeys: (keys: Keys | null) => void;
}

const KeysContext = createContext<KeysContextProps>({
  Keys: null,
  setKeys: () => {},
});

export const useKeys = () => useContext(KeysContext);

export const KeysProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [Keys, setKeys] = useState<Keys | null>(null);

  return (
    <KeysContext.Provider value={{ Keys, setKeys }}>
      {children}
    </KeysContext.Provider>
  );
};