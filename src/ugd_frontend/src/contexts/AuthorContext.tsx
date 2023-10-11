// OG: Now makes author object from pure AUTHOR_INFO
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
