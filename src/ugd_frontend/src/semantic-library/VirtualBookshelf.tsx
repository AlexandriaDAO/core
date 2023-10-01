// import React, { useState, useEffect } from 'react';
// // import { handleReadBookClick } from '../../utils/handleReadBookClick';
// import '../../styles/VirtualBookshelf.css';
// import BookCards from '../cards/BookCards';

// interface Book {
//   author: string;
//   title: string;
//   imagePath: string;
// }

// const VirtualBookShelfComponent = ({ author }: { author: string }) => {
//   const [groupedBooks, setGroupedBooks] = useState<{ [author: string]: Book[] }>({});
//   const booksByThisAuthor = groupedBooks[author] || [];

//   const [hasFlipped, setHasFlipped] = useState(false);
//   const [cardFlipped, setCardFlipped] = useState(false);

//   useEffect(() => {
//     fetch('/public/books.json')
//       .then((response) => response.json())
//       .then((data: Book[]) => {
//         const authorGroups: { [author: string]: Book[] } = {};
//         data.forEach((book) => {
//           if (!authorGroups[book.author]) {
//             authorGroups[book.author] = [];
//           }
//           authorGroups[book.author].push(book);
//         });
//         setGroupedBooks(authorGroups);
//       });
//   }, []);

//   const handleCardFlip = (bookId: string) => {
//     // Add flipping logic
//     console.log(`Flipping card for book: ${bookId}`);
//   };

// return (
//   <div className="carousel-container">
//     <div className="segment-area">
//       <div className="carousel-wrapper">
//         {/* {booksByThisAuthor.map((book, bookIndex) => (
//           <div 
//             className="carousel-card"
//             key={bookIndex}
//             onCardClick={handleCardFlip(book.title)}
//             // onClick={() => handleReadBookClick(book.author, book.title)}
//           >
//             <BookCards
//               book={{
//                 id: book.title,
//                 description: "Lorem ipsum",
//                 categories: [],
//                 imagePath: book.imagePath,
//                 title: book.title,
//               }}
//             />
//           </div>
//         ))} */}
//         {booksByThisAuthor.map((book, bookIndex) => (
//           <div 
//             className="carousel-card"
//             key={bookIndex}
//           >
//             <BookCards
//               book={{
//                 id: book.title,
//                 description: "Lorem ipsum",
//                 categories: [],
//                 imagePath: book.imagePath,
//                 title: book.title,
//               }}
//               onCardClick={() => handleCardFlip(book.title)}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );  
// };


// export default VirtualBookShelfComponent;












import React, { useState, useEffect } from 'react';
import '../../styles/VirtualBookshelf.css';
import BookCards from '../cards/BookCards';

interface Book {
  author: string;
  title: string;
  imagePath: string;
}

const VirtualBookShelfComponent = ({ author }: { author: string }) => {
  const [groupedBooks, setGroupedBooks] = useState<{ [author: string]: Book[] }>({});
  const booksByThisAuthor = groupedBooks[author] || [];
  const [flippedCards, setFlippedCards] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    fetch('/public/books.json')
      .then((response) => response.json())
      .then((data: Book[]) => {
        const authorGroups: { [author: string]: Book[] } = {};
        data.forEach((book) => {
          if (!authorGroups[book.author]) {
            authorGroups[book.author] = [];
          }
          authorGroups[book.author].push(book);
        });
        setGroupedBooks(authorGroups);
      });
  }, []);

  return (
    <div className="carousel-container">
      <div className="segment-area">
        <div className="carousel-wrapper">
          {booksByThisAuthor.map((book, bookIndex) => (
            <div className="carousel-card" key={bookIndex}>
              <BookCards
                book={{
                  id: book.title,
                  description: "Lorem ipsum",
                  categories: [],
                  imagePath: book.imagePath,
                  title: book.title,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );  
};

export default VirtualBookShelfComponent;















