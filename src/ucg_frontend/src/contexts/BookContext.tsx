import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Book {
    key: number;
    title: string;
    author: string;
    image: string;
    transactionId: string;
}

interface BookContextType {
    selectedBook: Book | null;
    setSelectedBook: (book: Book | null) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    return (
        <BookContext.Provider value={{ selectedBook, setSelectedBook }}>
            {children}
        </BookContext.Provider>
    );
};

export const useBook = () => {
    const context = useContext(BookContext);
    if (context === undefined) {
        throw new Error('useBook must be used within a BookProvider');
    }
    return context;
};