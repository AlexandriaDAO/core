// import React, {useState} from 'react';
// import BookCard from './BookCard'
// import AUTHOR_INFO from '../../assets/author_data';
// import useStreamingText from '../../utils/Stream';
// import { handleReadBookClick } from '../../utils/handleReadBookClick';

// interface AuthorCardsProps {
//   book: {
//     author: string;
//     description: string;
//     categories: string[];
//     imagePath: string;
//     title: string;
//   };
// }

// const BookCards: React.FC<AuthorCardsProps> = ({ book }) => {
//   const [flipped, setFlipped] = useState(false);

//   const onCardClick = () => {
//     setFlipped(!flipped);
//   };

//   // Find the author object from AUTHOR_INFO by checking if the books array includes the book title
//   const author = AUTHOR_INFO.find(author => author?.books?.includes(book.title));

//   const onReadBookClick = (event: React.MouseEvent) => {
//     event.stopPropagation();
//     handleReadBookClick(book.author, book.title);
//     console.log("Author", author)
//     console.log("book.id", book.author)
//     console.log("title.id", book.title)
//   };

//   let bookDescription = "Description not found";
//   if (author) {
//     const bookIndex = author?.books?.indexOf(book.title);
//     bookDescription = author?.book_descriptions ? author.book_descriptions[bookIndex as number] : "Description not found";
//   }

//   const shouldStartStreaming = flipped;
//   const streamedDescription = useStreamingText(bookDescription, 15, shouldStartStreaming);

//   return (
//     <div className="author-container flex w-[150px]">
//       <BookCard
//         image={`/public${book.imagePath}`}
//         title={book.title}
//         description={streamedDescription}
//         flipped={flipped}
//         onCardClick={onCardClick}
//         onReadBookClick={onReadBookClick}
//       />
//     </div>
//   );
// };

// export default BookCards;



















import React, { useState } from 'react';
import BookCard from './BookCard';
import useStreamingText from '../../utils/Stream';
import { handleReadBookClick } from '../../utils/handleReadBookClick';
import { useAuthors } from '../contexts/AuthorContext';  // Import useAuthors

interface BookCardsProps {
  book: {
    author: string;
    description: string;
    categories: string[];
    imagePath: string;
    title: string;
  };
}

const BookCards: React.FC<BookCardsProps> = ({ book }) => {
  const { authors } = useAuthors();  // Use the context

  const [flipped, setFlipped] = useState(false);

  const onCardClick = () => {
    setFlipped(!flipped);
  };

  // Find the author object from the context by checking if the books array includes the book title
  const author = authors.find(author => author?.books?.includes(book.title));

  const onReadBookClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleReadBookClick(book.author, book.title);
  };

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
        onReadBookClick={onReadBookClick}
      />
    </div>
  );
};

export default BookCards;
