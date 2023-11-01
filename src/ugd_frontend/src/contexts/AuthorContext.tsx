// OG: Now makes author object from pure AUTHOR_INFO
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { Author, AUTHOR_INFO } from '../data/author_data';

interface AuthorContextProps {
  authors: Author[];
  
  stats: any,
  setStats: React.Dispatch<React.SetStateAction<any>>,
  shelf: any,
  setShelf: React.Dispatch<React.SetStateAction<any>>,  
}

const AuthorContext = createContext<AuthorContextProps | undefined>(undefined);

export const AuthorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authors = AUTHOR_INFO;

  // stats contains author id or null 
  const [stats, setStats] = useState(null);
  // shelf contains author id or null
  const [shelf, setShelf] = useState(null);

  return (
    <AuthorContext.Provider value={{ authors, stats, setStats, shelf, setShelf }}>
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

export const getBooksByAuthorId = (authorId: string, authors: Author[]): string[] => {
  const author = authors.find(author => author.id === authorId);
  if (author && author?.books?.length) {
    return author.books.slice(0, 3);
  }
  return [];
}
