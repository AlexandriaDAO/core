import React, { useState, useEffect } from 'react';
import { handleReadBookClick } from '../../utils/handleReadBookClick';

interface Book {
  author: string;
  title: string;
  imagePath: string;
}

const VirtualBookShelfComponent = ({ author }: { author: string }) => {
  const [groupedBooks, setGroupedBooks] = useState<{ [author: string]: Book[] }>({});
  const booksByThisAuthor = groupedBooks[author] || [];

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
    <div className="relative w-3/5 left-0 top-4 font-serif text-center text-gray-300" style={{ backgroundColor: '#F0F0F0' }}>
      <div className="flex flex-col overflow-auto">
        <div className="flex flex-nowrap overflow-x-auto w-full p-2 rounded-lg shadow-lg" style={{ backgroundColor: '#E0E0E0' }}>
          {booksByThisAuthor.map((book, bookIndex) => (
            <div className="flex-shrink-0 p-0 pr-4 transition-transform duration-400 relative transform hover:scale-105 hover:z-10" key={bookIndex}>
              <div 
                className="flex flex-col w-36 cursor-pointer rounded-lg shadow-md hover:shadow-lg" 
                style={{ backgroundColor: '#D0D0D0' }}
                onClick={() => handleReadBookClick(book.author, book.title)}
              >
                <div className="p-2 flex items-center justify-center">
                  <img
                    src={`/public${book.imagePath}`}
                    alt={book.title}
                    className="w-9/10 object-cover object-center rounded-t-lg"
                  />
                </div>
                <div className="text-black font-bold text-md font-CALIBRI truncate h-16 leading-snug p-2 rounded-b-lg">
                  {book.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  

};

export default VirtualBookShelfComponent;


  // // OG No Styles
  // return (
  //   <div>
  //     <div style={{ width: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
  //       <div style={{ display: 'inline-block' }}>
  //         {booksByThisAuthor.map((book, bookIndex) => (
  //           <div key={bookIndex} style={{ display: 'inline-block' }}>
  //             <div onClick={() => handleReadBookClick(book.author, book.title)}>
  //               <div>
  //                 <img
  //                   src={`/public${book.imagePath}`}
  //                   alt={book.title}
  //                 />
  //               </div>
  //               <div>
  //                 {book.title}
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );










// OG with all the facny styling.

















// // Semantic UI Carousel version w/o shuffled books.

// import React, { useState, useEffect } from 'react';
// import { handleReadBookClick } from '../../utils/handleReadBookClick';
// import { Card, Image, Segment } from 'semantic-ui-react';
// import '../../styles/VirtualBookshelf.css';

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
//     <div className="✍️">
//       <div className="🌐🌈">
//         <Segment
//           className={`🌟 📜 🕵️‍♀️📜`}
//           style={{ display: 'flex', overflowX: 'auto' }}
//         >
//           {booksByThisAuthor.map((book, bookIndex) => (
//             <div className="👤🎴-container" key={bookIndex}>
//               <Card 
//                 className={`👤🎴 👤🎴-custom`} 
//                 onClick={() => handleReadBookClick(book.author, book.title)}
//               >
//                 <div className="🖼️🌌">
//                   <Image
//                     src={`/public${book.imagePath}`}
//                     alt={book.title}
//                     className="👩‍🎨📷"
//                   />
//                 </div>
//                 <Card.Content className="👤🎴-header">
//                     {book.title}
//                 </Card.Content>
//               </Card>
//             </div>
//           ))}
//         </Segment>
//       </div>
//     </div>
//   );  
// };

// export default VirtualBookShelfComponent;










// // OG Version Before I merged ChatPage and Semantic Library

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { handleReadBookClick } from '../../utils/handleReadBookClick';
// import '../../styles/VirtualBookshelf.css';

// const VirtualBookshelf: React.FC = () => {
//   const [books, setBooks] = useState<any[]>([]);
//   const [displayedBooks, setDisplayedBooks] = useState<any[]>([]);
//   const [loadingMore, setLoadingMore] = useState<boolean>(false);
//   const observer = useRef<IntersectionObserver | null>(null);
//   const lastBookRef = useRef<HTMLDivElement | null>(null);

//   const loadMoreBooks = useCallback(() => {
//     if (loadingMore) return;
//     setLoadingMore(true);
//     setDisplayedBooks(books.slice(0, displayedBooks.length + 15));
//     setLoadingMore(false);
//   }, [displayedBooks, loadingMore, books]);

//   useEffect(() => {
//     fetch('/public/books.json')
//       .then((response) => response.json())
//       .then((data) => {
//         const shuffledBooks = shuffleArray(data);
//         setBooks(shuffledBooks);
//         setDisplayedBooks(shuffledBooks.slice(0, 20));
//       });
//   }, []);

//   useEffect(() => {
//     if (observer.current) observer.current.disconnect();
//     observer.current = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           loadMoreBooks();
//         }
//       },
//       { rootMargin: '0px 0px 200px 0px' }
//     );

//     if (lastBookRef.current) observer.current.observe(lastBookRef.current);

//     return () => {
//       if (observer.current) observer.current.disconnect();
//     };
//   }, [loadMoreBooks, displayedBooks]);

//   return (
//     <div className="bookshelf">
//       {displayedBooks.map((book, index) => {
//         const isLastBook = index === displayedBooks.length - 1;
//         const pathParts = book.imagePath.split('/');
//         const authorId = pathParts[pathParts.length - 2].split(' ').join('_');
//         const title = pathParts[pathParts.length - 1].replace('.png', '').split(' ').join('_');
        
//         return (
//           <div key={index} ref={isLastBook ? lastBookRef : null} className="book">
//             <a href="#" onClick={(e) => { 
//                 e.preventDefault();
//                 console.log("Clicked"); 
//                 handleReadBookClick(authorId, title); 
//             }} className="bookImage">
//               <img src={`/public${book.imagePath}`}  alt={title} className="image" />
//             </a>
//             <div className="bookInfo">
//               <p className="title">{title.replace(/_/g, ' ')}</p>
//               <p className="author">{authorId.replace(/_/g, ' ')}</p>
//             </div>
//           </div>
//         );
//       })}
//       {loadingMore && <div className="loadingMore">Loading more books...</div>}
//     </div>
//   );
// };

// function shuffleArray(array: any[]) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

// export default VirtualBookshelf;



// // Working, but with imageMap instead of UseSate and useEffect.

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { handleReadBookClick } from '../utils/handleReadBookClick';
// import imageMap from '../assets/imageMap';
// import '../styles/VirtualBookshelf.css';

// const VirtualBookshelf = () => {
//   const [books, setBooks] = useState([]);
//   const [displayedBooks, setDisplayedBooks] = useState([]);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const observer = useRef(null);
//   const lastBookRef = useRef(null);

//   const loadMoreBooks = useCallback(() => {
//     if (loadingMore) return;
//     setLoadingMore(true);
//     setDisplayedBooks(books.slice(0, displayedBooks.length + 15));
//     setLoadingMore(false);
//   }, [displayedBooks, loadingMore, books]);

//   useEffect(() => {
//     fetch('/public/books.json')
//       .then((response) => response.json())
//       .then((data) => {
//         const shuffledBooks = shuffleArray(data);
//         setBooks(shuffledBooks);
//         setDisplayedBooks(shuffledBooks.slice(0, 20));
//       });
//   }, []);

//   useEffect(() => {
//     if (observer.current) observer.current.disconnect();
//     observer.current = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           loadMoreBooks();
//         }
//       },
//       { rootMargin: '0px 0px 200px 0px' }
//     );

//     if (lastBookRef.current) observer.current.observe(lastBookRef.current);

//     return () => {
//       if (observer.current) observer.current.disconnect();
//     };
//   }, [loadMoreBooks, displayedBooks]);

//   return (
//     <div className="bookshelf">
//       {displayedBooks.map((book, index) => {
//         const isLastBook = index === displayedBooks.length - 1;
//         const pathParts = book.imagePath.split('/');
//         const authorId = pathParts[pathParts.length - 2].split(' ').join('_');
//         const title = pathParts[pathParts.length - 1].replace('.png', '').split(' ').join('_');
//         const imageIdentifier = `${authorId}_${title}`;
//         const imageUrl = `/public${imageMap[imageIdentifier]}` || '';

//         console.log('Image URL:', imageUrl);
//         console.log('Image Identifier:', imageIdentifier);

//         return (
//           <div key={index} ref={isLastBook ? lastBookRef : null} className="book">
//             <a href="#" onClick={(e) => { 
//                 e.preventDefault();
//                 console.log("Clicked"); 
//                 handleReadBookClick(authorId, title); 
//             }} className="bookImage">
//               <img src={imageUrl} alt={title} className="image" />
//             </a>
//             <div className="bookInfo">
//               <p className="title">{title.replace(/_/g, ' ')}</p>
//               <p className="author">{authorId.replace(/_/g, ' ')}</p>
//             </div>
//           </div>
//         );
//       })}
//       {loadingMore && <div className="loadingMore">Loading more books...</div>}
//     </div>
//   );
// };

// function shuffleArray(array) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

// export default VirtualBookshelf;






// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { handleReadBookClick } from '../utils/handleReadBookClick';
// import imageMap from '../assets/imageMap';
// import '../styles/VirtualBookshelf.css';

// const VirtualBookshelf = () => {
//   const [books, setBooks] = useState([]);
//   const [displayedBooks, setDisplayedBooks] = useState([]);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [imageUrls, setImageUrls] = useState({}); // New state to manage image URLs
//   const observer = useRef(null);
//   const lastBookRef = useRef(null);

//   const loadMoreBooks = useCallback(() => {
//     if (loadingMore) return;
//     setLoadingMore(true);
//     setDisplayedBooks(books.slice(0, displayedBooks.length + 15));
//     setLoadingMore(false);
//   }, [displayedBooks, loadingMore, books]);

//   useEffect(() => {
//     // Fetch book data and images
//     fetch('/public/books.json')
//       .then((response) => response.json())
//       .then((data) => {
//         const shuffledBooks = shuffleArray(data);
//         setBooks(shuffledBooks);
//         setDisplayedBooks(shuffledBooks.slice(0, 20));

//         const newImageUrls = {};
//         shuffledBooks.forEach((book) => {
//           const pathParts = book.imagePath.split('/');
//           const authorId = pathParts[pathParts.length - 2].split(' ').join('_');
//           const title = pathParts[pathParts.length - 1].replace('.png', '').split(' ').join('_');
//           const imageIdentifier = `${authorId}_${title}`;
//           newImageUrls[imageIdentifier] = `/public${imageMap[imageIdentifier]}`;
//         });
//         setImageUrls(newImageUrls);  // Set the image URLs using useState
//       });
//   }, []);

//   useEffect(() => {
//     if (observer.current) observer.current.disconnect();
//     observer.current = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           loadMoreBooks();
//         }
//       },
//       { rootMargin: '0px 0px 200px 0px' }
//     );

//     if (lastBookRef.current) observer.current.observe(lastBookRef.current);

//     return () => {
//       if (observer.current) observer.current.disconnect();
//     };
//   }, [loadMoreBooks, displayedBooks]);

//   return (
//     <div className="bookshelf">
//       {displayedBooks.map((book, index) => {
//         const isLastBook = index === displayedBooks.length - 1;
//         const pathParts = book.imagePath.split('/');
//         const authorId = pathParts[pathParts.length - 2].split(' ').join('_');
//         const title = pathParts[pathParts.length - 1].replace('.png', '').split(' ').join('_');
//         const imageIdentifier = `${authorId}_${title}`;
//         const imageUrl = imageUrls[imageIdentifier] || '';
//         console.log('ImageUrlFromState: ', imageUrl)
//         // const images = require.context('../assets/public/bookimages/', false, /\.(png|jpe?g|svg)$/);
//         // const image = require.context('../assets/public/bookimages/', false, /\.(png|jpe?g|svg)$/);
//         // console.log(`./${imageIdentifier}.png`)
//         // const imageUrlFromContext = image(`./${imageIdentifier}.png`).default;
//         // console.log('URL using require.context: ', imageUrlFromContext);




//         return (
//           <div key={index} ref={isLastBook ? lastBookRef : null} className="book">
//             <a href="#" onClick={(e) => { 
//                 e.preventDefault();
//                 console.log("Clicked"); 
//                 handleReadBookClick(authorId, title); 
//             }} className="bookImage">
//               <img src={imageUrl} alt={title} className="image" />
//             </a>
//             <div className="bookInfo">
//               <p className="title">{title.replace(/_/g, ' ')}</p>
//               <p className="author">{authorId.replace(/_/g, ' ')}</p>
//             </div>
//           </div>
//         );
//       })}
//       {loadingMore && <div className="loadingMore">Loading more books...</div>}
//     </div>
//   );
// };

// function shuffleArray(array) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

// export default VirtualBookshelf;







// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { handleReadBookClick } from '../utils/handleReadBookClick';
// import '../styles/VirtualBookshelf.css';

// const VirtualBookshelf = () => {
//   const [books, setBooks] = useState([]);
//   const [displayedBooks, setDisplayedBooks] = useState([]);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const observer = useRef(null);
//   const lastBookRef = useRef(null);

//   const loadMoreBooks = useCallback(() => {
//     if (loadingMore) return;
//     setLoadingMore(true);
//     setDisplayedBooks(books.slice(0, displayedBooks.length + 15));
//     setLoadingMore(false);
//   }, [displayedBooks, loadingMore, books]);

//   useEffect(() => {
//     fetch('/public/books.json')
//       .then((response) => response.json())
//       .then((data) => {
//         const shuffledBooks = shuffleArray(data);
//         setBooks(shuffledBooks);
//         setDisplayedBooks(shuffledBooks.slice(0, 20));
//       });
//   }, []);

//   useEffect(() => {
//     if (observer.current) observer.current.disconnect();
//     observer.current = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           loadMoreBooks();
//         }
//       },
//       { rootMargin: '0px 0px 200px 0px' }
//     );

//     if (lastBookRef.current) observer.current.observe(lastBookRef.current);

//     return () => {
//       if (observer.current) observer.current.disconnect();
//     };
//   }, [loadMoreBooks, displayedBooks]);

//   return (
//     <div className="bookshelf">
//       {displayedBooks.map((book, index) => {
//         const isLastBook = index === displayedBooks.length - 1;
//         const pathParts = book.imagePath.split('/');
//         const authorId = pathParts[pathParts.length - 2].split(' ').join(' ');
//         const title = pathParts[pathParts.length - 1].replace('.png', '').split(' ').join(' ');
//         const imageUrl = `/public/bookimages/${authorId}/${title}.png`;

//         return (
//           <div key={index} ref={isLastBook ? lastBookRef : null} className="book">
//             <a href="#" onClick={(e) => { 
//                 e.preventDefault();
//                 handleReadBookClick(authorId, title); 
//             }} className="bookImage">
//               <img src={imageUrl} alt={title} className="image" />
//             </a>
//             <div className="bookInfo">
//               <p className="title">{title.replace(/_/g, ' ')}</p>
//               <p className="author">{authorId.replace(/_/g, ' ')}</p>
//             </div>
//           </div>
//         );
//       })}
//       {loadingMore && <div className="loadingMore">Loading more books...</div>}
//     </div>
//   );
// };

// function shuffleArray(array) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

// export default VirtualBookshelf;




