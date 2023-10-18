import React from 'react';
import BookCards from '../BookCards';
import { CardBackProps } from './types';
import '../../../styles/MessageCard/CardBack.css';
import useAuthorBooks from '../../../utils/useAuthorBooks';
import { useSettings } from '../../contexts/SettingsContext';

const CardBack: React.FC<CardBackProps> = ({ onFlip, currentAuthorId }) => {
  const books = useAuthorBooks(currentAuthorId);
  const { topBooksCount } = useSettings();
  const topNBooks = books.slice(0, topBooksCount); 

  return (
    <div className="MC-card-face MC-card-back absolute inset-0 bg-[#faf8ef] text-center p-10 overflow-y-auto">
      <button className="MC-flip-button" onClick={onFlip}>Flip</button>
      <div className="MC-book-cards-container">
        {topNBooks.map((book, index) => (
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