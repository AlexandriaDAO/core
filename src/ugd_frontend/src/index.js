// pages/the-greats.tsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import SemanticLibrary from './semantic-library/SemanticLibrary';
import { ugd_backend } from "../../declarations/ugd_backend";
import useBackgroundPosition from '../utils/useBackgroundPosition';
import '../styles/main.css';

import AuthorPanel from './the-greats/AuthorPanel';
import AUTHOR_INFO from '../assets/author_data';


const App = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const backgroundPosition = useBackgroundPosition();

  useEffect(() => {
    const image = require.context('../assets/public/images/', false, /\.(png|jpe?g|svg)$/);
    setImageUrl(image('./BlackedOut.png').default);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {imageUrl && (
        <div id="imageContainer" style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: backgroundPosition,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: '0.1',
          zIndex: -1,
        }} />
      )}
      <div>
        <SemanticLibrary />
        <AuthorPanel authors={AUTHOR_INFO} />
      </div>
    </div>
  );
};

  document.addEventListener("DOMContentLoaded", () => {
  const semanticLibraryRoot = document.getElementById("semantic-library-root");
  if (semanticLibraryRoot) {
    const root = createRoot(semanticLibraryRoot);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }

  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const button = e.target.querySelector("button");
      const name = document.getElementById("name").value.toString();
      button.setAttribute("disabled", true);

      const greeting = await ugd_backend.greet(name);
      button.removeAttribute("disabled");
      document.getElementById("greeting").innerText = greeting;

      return false;
    });
  }
});
















// // Compbined Version: 
// // index.js
// import React, { useEffect, useState } from 'react';
// import { createRoot } from 'react-dom/client';
// import SemanticLibrary from './semantic-library/SemanticLibrary';
// import { ugd_backend } from "../../declarations/ugd_backend";
// import useBackgroundPosition from '../utils/useBackgroundPosition';
// import '../styles/main.css';
// import AUTHOR_INFO from '../assets/author_data';
// import AuthorCards from './the-greats/AuthorCards'

// // Your original HomePage code, now embedded into this file
// function HomePage({ authors }) {
//   const [activeAuthor, setActiveAuthor] = useState(null);

//   useEffect(() => {
//     setActiveAuthor(null);
//   }, []);

//   const handleCardClick = (authorId) => {
//     setActiveAuthor(authorId === activeAuthor ? null : authorId);
//   };

//   return (
//     <div className="grid">
//       {authors.map((author) => (
//         <div key={author.id} onClick={() => handleCardClick(author.id)}>
//           {/* Assume AuthorCard is available or imported */}
//           <AuthorCards 
//             author={author} 
//             expanded={activeAuthor === author.id} 
//           />
//         </div>
//       ))}
//     </div>
//   );
// }

// const App = () => {
//   const [imageUrl, setImageUrl] = useState(null);
//   const backgroundPosition = useBackgroundPosition();

//   useEffect(() => {
//     const image = require.context('../assets/public/images/', false, /\.(png|jpe?g|svg)$/);
//     setImageUrl(image('./BlackedOut.png').default);
//   }, []);

//   return (
//     <div style={{ position: 'relative', minHeight: '100vh' }}>
//       {imageUrl && (
//         <div id="imageContainer" style={{
//           backgroundImage: `url(${imageUrl})`,
//           backgroundPosition: backgroundPosition,
//           backgroundSize: 'cover',
//           backgroundAttachment: 'fixed',
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '100%',
//           height: '100%',
//           opacity: '0.1',
//           zIndex: -1,
//         }} />
//       )}
//       <div>
//         <SemanticLibrary />
//       </div>
//       {/* Embed HomePage right under SemanticLibrary */}
//       <div>
//         {/* <HomePage authors={AUTHOR_INFO} /> */}
//       </div>
//     </div>
//   );
// };

// document.addEventListener("DOMContentLoaded", () => {
//   const semanticLibraryRoot = document.getElementById("semantic-library-root");
//   if (semanticLibraryRoot) {
//     const root = createRoot(semanticLibraryRoot);
//     root.render(
//       <React.StrictMode>
//         <App />
//       </React.StrictMode>
//     );
//   }

//   const form = document.querySelector("form");
//   if (form) {
//     form.addEventListener("submit", async (e) => {
//       e.preventDefault();
//       const button = e.target.querySelector("button");
//       const name = document.getElementById("name").value.toString();
//       button.setAttribute("disabled", true);

//       const greeting = await ugd_backend.greet(name);
//       button.removeAttribute("disabled");
//       document.getElementById("greeting").innerText = greeting;

//       return false;
//     });
//   }
// });
