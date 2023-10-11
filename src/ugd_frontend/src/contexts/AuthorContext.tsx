// AuthorContext.tsx

// // I'd eventualy like to use this to get the author's info directly from AUTHOR_INFO, and only from AUTHOR_INFO.
import React, { createContext, useContext, ReactNode } from 'react';
import { Author, AUTHOR_INFO } from '../../assets/author_data';

interface AuthorContextProps {
  authors: Author[];
}

const AuthorContext = createContext<AuthorContextProps | undefined>(undefined);

export const AuthorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authors = AUTHOR_INFO;

  return (
    <AuthorContext.Provider value={{ authors }}>
      {children}
    </AuthorContext.Provider>
  );
};

export const useAuthors = () => {
  const context = useContext(AuthorContext);
  if (!context) {
    throw new Error('useAuthors must be used within an AuthorProvider');
  }
  return context;
};
