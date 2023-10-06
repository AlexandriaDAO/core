// import React, { useState, useEffect } from 'react';
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

//   return (
//     <div className="carousel-container scale-down">
//       <div className="segment-area">
//         <div className="carousel-wrapper">
//           {booksByThisAuthor.map((book, bookIndex) => (
//             <div className="carousel-card" key={bookIndex}>
//               <BookCards
//                 book={{
//                   author: book.author,
//                   description: "Lorem ipsum",
//                   categories: [],
//                   imagePath: book.imagePath,
//                   title: book.title,
//                 }}
//               />
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );  
// };

// export default VirtualBookShelfComponent;













































import React, { useState, useEffect, useRef } from 'react';
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
  const carouselWrapperRef = useRef<HTMLDivElement | null>(null);  // ref for the carousel wrapper

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

  useEffect(() => {
    const adjustScaleBasedOnPosition = () => {
      const currentRef = carouselWrapperRef.current;
      if (currentRef) {
        const cards = currentRef.querySelectorAll('.carousel-card') as NodeListOf<HTMLDivElement>;
        const carouselMidpoint = currentRef.offsetWidth * 0.8 / 2;

        cards.forEach(card => {
          const cardMidpoint = card.getBoundingClientRect().left + card.offsetWidth / 2 - currentRef.getBoundingClientRect().left;
          const distanceFromCenter = Math.abs(carouselMidpoint - cardMidpoint);

          const scale = 1.1 - Math.min(distanceFromCenter / 1000, 0.2);
          card.style.transform = `scale(${scale})`;
        });
      }
    }

    const currentRef = carouselWrapperRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', adjustScaleBasedOnPosition);
      adjustScaleBasedOnPosition();

      return () => {
        currentRef.removeEventListener('scroll', adjustScaleBasedOnPosition);
      }
    }
  }, [carouselWrapperRef, booksByThisAuthor]);


  return (
    <div className="carousel-container scale-down">
      <div className="segment-area">
        <div className="carousel-wrapper" ref={carouselWrapperRef}>
          {booksByThisAuthor.map((book, bookIndex) => (
            <div className="carousel-card" key={bookIndex}>
              <BookCards
                book={{
                  author: book.author,
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

