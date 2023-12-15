import React, { createContext, useContext, ReactNode, useState } from 'react';

interface SourceCard {
  post_id: bigint;
  user_query: string;
  author: string;
  title: string;
  heading: string;
  content: string;
  summary: string;
  bookmarked: boolean;
};

interface BookMarkedSourceCardContextProps {
  bookmarkedSourceCards: SourceCard[] | [];
  SetBookmarkedSourceCards: (newSourceCards: SourceCard[] | []) => void
  UpdateBookmarkedSourceCards: (newSourceCards: SourceCard) => void
}

export const BookMarkedSourceCardContext = createContext<BookMarkedSourceCardContextProps | undefined>(undefined);

export const BookMarkedSourceCardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookmarkedSourceCards, setBookmarkedSourceCards] = useState<SourceCard[] | []>([])

  const SetBookmarkedSourceCards = (newSourceCards: SourceCard[] | []) => {
    setBookmarkedSourceCards(newSourceCards)
  }

  const UpdateBookmarkedSourceCards = (newSourceCard: SourceCard) => {
    setBookmarkedSourceCards((prev) => ([...prev, newSourceCard]))
  }

  return (
    <BookMarkedSourceCardContext.Provider value={{ bookmarkedSourceCards, SetBookmarkedSourceCards, UpdateBookmarkedSourceCards }}>
      {children}
    </BookMarkedSourceCardContext.Provider>
  );
};

