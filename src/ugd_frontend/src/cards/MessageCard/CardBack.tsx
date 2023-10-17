import React from 'react';
import '../../../styles/MessageCard/CardBack.css';
import BookCards from '../BookCards';
import { CardBackProps } from './types';
import useAuthorBooks from '../../../utils/useAuthorBooks';

const CardBack: React.FC<CardBackProps> = ({ onFlip, currentAuthorId }) => {
  const books = useAuthorBooks(currentAuthorId);
  const top3Books = books.slice(0, 3);

  return (
    <div className="MC-card-face MC-card-back absolute inset-0 bg-[#faf8ef] text-center p-10 overflow-y-auto">
      <button className="MC-flip-button" onClick={onFlip}>Flip</button>
      <div className="MC-book-cards-container">
        {top3Books.map((book, index) => (
          <BookCards
            key={index}
            book={book}
          />
        ))}
      </div>
    </div>
  );
};

export default CardBack;