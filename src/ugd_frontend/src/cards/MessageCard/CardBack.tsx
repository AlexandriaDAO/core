// import React from 'react';
// import { CardBackProps } from './types';
// import '../../../styles/MessageCard/CardBack.css';

// const CardBack: React.FC<CardBackProps> = ({ onFlip }) => (
//   <div className="MC-card-face MC-card-back absolute inset-0 bg-[#faf8ef] text-center p-10 overflow-y-auto">
//     <p>This is the back of the card. You can put more information or another component here!</p>
//     <button onClick={onFlip} className="MC-flip-button">Flip</button>
//   </div>
// );

// export default CardBack;







import React, { useState, useEffect } from 'react';
import BookCards from '../BookCards';
import { CardBackProps, Book } from './types';
import '../../../styles/MessageCard/CardBack.css';

const CardBack: React.FC<CardBackProps> = ({ onFlip }) => {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    fetch('/public/books.json')
      .then((response) => response.json())
      .then((data: Book[]) => {
        setBooks(data);
      });
  }, []);

  const getRandomBooks = (count: number = 3) => {
    const shuffledBooks = [...books].sort(() => 0.5 - Math.random());
    return shuffledBooks.slice(0, count);
  };

  const randomBooksToShow = getRandomBooks();

  return (
    <div className="MC-card-face MC-card-back absolute inset-0 bg-[#faf8ef] text-center p-10 overflow-y-auto">
      <p>This is the back of the card. Here are some random books for you:</p>
      {randomBooksToShow.map((book, index) => (
        <BookCards 
          key={index}
          book={{
            author: book.author,
            description: "Some default description",
            categories: [],
            imagePath: book.imagePath,
            title: book.title,
          }}
        />
      ))}
      <button onClick={onFlip} className="MC-flip-button">Flip</button>
    </div>
  );
};

export default CardBack;
