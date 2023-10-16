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







// import React, { useEffect, useState } from 'react';
// import { useAuthors } from '../../contexts/AuthorContext';
// import { CardBackProps } from './types';
// import '../../../styles/MessageCard/CardBack.css';
// import BookCards from '../BookCards';
// import { sanitizeTitleForPath } from '../../../utils/handleReadBookClick';

// const CardBack: React.FC<CardBackProps> = ({ onFlip, currentAuthorId }) => {
//   const { authors } = useAuthors();
//   const [top3Books, setTop3Books] = useState<any[]>([]);

//   useEffect(() => {
//     if (currentAuthorId) {
//       const matchedAuthor = authors.find(author => author.id === currentAuthorId);
//       if (matchedAuthor) {
//         const booksWithDescriptions = (matchedAuthor.books?.slice(0, 3) || []).map((title, index) => {
//           return {
//             title,
//             description: matchedAuthor.book_descriptions?.[index] || "Description not available",
//             imagePath: `/bookimages/${matchedAuthor.id}/${sanitizeTitleForPath(title)}.png`,
//           };
//         });
//         setTop3Books(booksWithDescriptions);
//       }
//     }
//   }, [currentAuthorId, authors]);

//   return (
//     <div className="MC-card-face MC-card-back absolute inset-0 bg-[#faf8ef] text-center p-10 overflow-y-auto">
//       {top3Books.map((book, index) => (
//         <BookCards
//           key={index}
//           book={{
//             author: "",
//             description: book.description,
//             categories: [],
//             imagePath: book.imagePath,
//             title: book.title
//           }}
//         />
//       ))}
//       <button onClick={onFlip} className="MC-flip-button">Flip</button>
//     </div>
//   );
// };

// export default CardBack;














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
      {top3Books.map((book, index) => (
        <BookCards
          key={index}
          book={book}
        />
      ))}
      <button onClick={onFlip} className="MC-flip-button">Flip</button>
    </div>
  );
};

export default CardBack;