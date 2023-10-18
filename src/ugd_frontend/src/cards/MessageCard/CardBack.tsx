import React from 'react';
import BookCards from '../BookCards';
import { CardBackProps } from './types';
import '../../../styles/MessageCard/CardBack.css';
import useAuthorBooks from '../../../utils/useAuthorBooks';
import { useSettings } from '../../contexts/SettingsContext';


const CardBack: React.FC<CardBackProps> = ({ currentAuthorId }) => {
  const books = useAuthorBooks(currentAuthorId);
  const { topBooksCount } = useSettings();
  const topNBooks = books.slice(0, topBooksCount); 

  return (
    <div className="MC-card-back absolute inset-0 bg-[#faf8ef] flex flex-column items-center">
      <div className="MC-book-cards-container">
        {topNBooks.map((book, index) => (
          <div className="SC-source-card" key={index}>
            <div className="SC-book-card-container">
              <BookCards book={book} />
            </div>
            <div className="SC-text-container">
              <span className="SC-message-card-content">Demo text: This will be an extractive summary of the source itself, with an option to expand into the full source snippet, and eventually ebook.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default CardBack;





