import React, { useState, useEffect, useRef, useCallback } from 'react';
import { handleReadBookClick } from '../../utils/handleReadBookClick';
import '../../styles/VirtualBookshelf.css';

const VirtualBookshelf: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [displayedBooks, setDisplayedBooks] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastBookRef = useRef<HTMLDivElement | null>(null);

  const loadMoreBooks = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    setDisplayedBooks(books.slice(0, displayedBooks.length + 15));
    setLoadingMore(false);
  }, [displayedBooks, loadingMore, books]);

  useEffect(() => {
    fetch('/public/books.json')
      .then((response) => response.json())
      .then((data) => {
        const shuffledBooks = shuffleArray(data);
        setBooks(shuffledBooks);
        setDisplayedBooks(shuffledBooks.slice(0, 20));
      });
  }, []);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMoreBooks();
        }
      },
      { rootMargin: '0px 0px 200px 0px' }
    );

    if (lastBookRef.current) observer.current.observe(lastBookRef.current);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loadMoreBooks, displayedBooks]);

  return (
    <div className="bookshelf">
      {displayedBooks.map((book, index) => {
        const isLastBook = index === displayedBooks.length - 1;
        const pathParts = book.imagePath.split('/');
        const authorId = pathParts[pathParts.length - 2].split(' ').join('_');
        const title = pathParts[pathParts.length - 1].replace('.png', '').split(' ').join('_');
        
        return (
          <div key={index} ref={isLastBook ? lastBookRef : null} className="book">
            <a href="#" onClick={(e) => { 
                e.preventDefault();
                console.log("Clicked"); 
                handleReadBookClick(authorId, title); 
            }} className="bookImage">
              <img src={`/public${book.imagePath}`}  alt={title} className="image" />
            </a>
            <div className="bookInfo">
              <p className="title">{title.replace(/_/g, ' ')}</p>
              <p className="author">{authorId.replace(/_/g, ' ')}</p>
            </div>
          </div>
        );
      })}
      {loadingMore && <div className="loadingMore">Loading more books...</div>}
    </div>
  );
};

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default VirtualBookshelf;



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




