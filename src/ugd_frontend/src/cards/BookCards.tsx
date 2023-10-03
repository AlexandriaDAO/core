// import React from 'react';
// import BookCard from './BookCard'
// import AUTHOR_INFO from '../../assets/author_data';

// interface AuthorCardsProps {
//   book: {
//     id: string;
//     description: string;
//     categories: string[];
//     imagePath: string;
//     title: string;
//   };
// }

// const BookCards: React.FC<AuthorCardsProps> = ({ book }) => {
//   const streamedDescription = "Demo description for now";

//   return (
//     <div className="author-container flex w-[150px]">
//       <BookCard
//         image={`/public${book.imagePath}`}
//         title={book.title}
//         description={streamedDescription}
//       />
//     </div>
//   );
// };

// export default BookCards;





import React, {useState} from 'react';
import BookCard from './BookCard'
import AUTHOR_INFO from '../../assets/author_data';
import useStreamingText from '../../utils/Stream';

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
  const [flipped, setFlipped] = useState(false);

  const onCardClick = () => {
    setFlipped(!flipped);
  };

  // Find the author object from AUTHOR_INFO by checking if the books array includes the book title
  const author = AUTHOR_INFO.find(author => author?.books?.includes(book.title));

  let bookDescription = "Description not found";
  if (author) {
    const bookIndex = author?.books?.indexOf(book.title);
    bookDescription = author?.book_descriptions ? author.book_descriptions[bookIndex as number] : "Description not found";
  }

  const shouldStartStreaming = flipped;
  const streamedDescription = useStreamingText(bookDescription, 15, shouldStartStreaming);

  return (
    <div className="author-container flex w-[150px]">
      <BookCard
        image={`/public${book.imagePath}`}
        title={book.title}
        description={streamedDescription}
        flipped={flipped}
        onCardClick={onCardClick}
      />
    </div>
  );
};

export default BookCards;



















// import React, { useState, useEffect } from 'react';
// import useStreamingText from '../../utils/Stream';
// import BookCard from './BookCard';
// import AUTHOR_INFO from '../../assets/author_data';

// interface AuthorCardsProps {
//   book: {
//     id: string;
//     description: string;
//     categories: string[];
//     imagePath: string;
//     title: string;
//   };
// }

// const BookCards: React.FC<AuthorCardsProps> = ({ book }) => {
//   const [hasFlipped, setHasFlipped] = useState(false);
//   const [cardFlipped, setCardFlipped] = useState(false);
//   const shouldStartStreaming = hasFlipped;

  // // Find the author object from AUTHOR_INFO by checking if the books array includes the book title
  // const author = AUTHOR_INFO.find(author => author?.books?.includes(book.title));

  // let bookDescription = "Description not found";
  // if (author) {
  //   const bookIndex = author?.books?.indexOf(book.title);
  //   bookDescription = author?.book_descriptions ? author.book_descriptions[bookIndex as number] : "Description not found";
  // }

//   const streamedDescription = useStreamingText(bookDescription, 15, shouldStartStreaming);

//   useEffect(() => {
//     if (cardFlipped && !hasFlipped) {
//       setHasFlipped(true);
//     }
//   }, [cardFlipped]);

//   const handleClick = () => {
//     setCardFlipped(!cardFlipped);
//   };

//   return (
//     <div
//       className={`author-container flex ${cardFlipped ? 'expanded w-auto' : 'w-[150px]'}`}
//     >
//       <BookCard
//         image={`/public${book.imagePath}`}
//         title={book.title}
//         onCardClick={handleClick}
//         flipped={cardFlipped}
//         description={streamedDescription}
//       />
//     </div>
//   );
// };

// export default BookCards;
