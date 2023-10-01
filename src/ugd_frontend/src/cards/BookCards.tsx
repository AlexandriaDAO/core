import React from 'react';
import BookCard from './BookCard'

interface AuthorCardsProps {
  book: {
    id: string;
    description: string;
    categories: string[];
    imagePath: string;
    title: string;
  };
}

const BookCards: React.FC<AuthorCardsProps> = ({ book }) => {
  const streamedDescription = "Demo description for now";

  return (
    <div className="author-container flex w-[150px]">
      <BookCard
        image={`/public${book.imagePath}`}
        title={book.title}
        description={streamedDescription}
      />
    </div>
  );
};

export default BookCards;
