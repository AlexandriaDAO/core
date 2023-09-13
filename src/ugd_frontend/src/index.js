// import React, { useState, useEffect } from 'react';
// import { createRoot } from 'react-dom/client';
// import 'semantic-ui-css/semantic.min.css';
// import SemanticLibrary from './semantic-library/SemanticLibrary';
// import useBackgroundPosition from '../utils/useBackgroundPosition';

// // New Backend Function That takes input and returns "Hello, input": 
// import { ugd_backend } from "../../declarations/ugd_backend"


// function SemanticLibraryPage() {
//   const backgroundPosition = useBackgroundPosition();
//   const [imageUrl, setImageUrl] = useState(null);

//   useEffect(() => {
//     const image = require.context('../assets/public/images/', false, /\.(png|jpe?g|svg)$/);
//     setImageUrl(image('./BlackedOut.png').default);
//   }, []);

//   if (!imageUrl) return <div>Loading...</div>;

//   return (
//     <div style={{
//       position: 'relative',
//       minHeight: '100vh',
//     }}>
//       <div id="imageContainer" style={{
//         backgroundImage: `url(${imageUrl})`,
//         backgroundPosition: backgroundPosition,
//         backgroundSize: 'cover',
//         backgroundAttachment: 'fixed',
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         width: '100%',
//         height: '100%',
//         opacity: '0.1',
//         zIndex: -1,
//       }}/>
//       <div>
//         <SemanticLibrary/>
//       </div>
//     </div>
//   );
// }

// const root = document.getElementById('app');
// const appRoot = createRoot(root);

// appRoot.render(
//   <React.StrictMode>
//     <SemanticLibraryPage />
//   </React.StrictMode>
// );










// // First version that works with the origional index.html

// import { ugd_backend } from "../../declarations/ugd_backend"

// document.querySelector("form").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const button = e.target.querySelector("button");

//   const name = document.getElementById("name").value.toString();

//   button.setAttribute("disabled", true);

//   // Interact with foo actor, calling the greet method
//   const greeting = await ugd_backend.greet(name);

//   button.removeAttribute("disabled");

//   document.getElementById("greeting").innerText = greeting;

//   return false;
// });






import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import SemanticLibrary from './semantic-library/SemanticLibrary';
import { ugd_backend } from "../../declarations/ugd_backend"

// Initialize React App within an existing DOM
const initializeReactApp = () => {
  const semanticLibraryRoot = document.getElementById("semantic-library-root");
  if (semanticLibraryRoot) {
    ReactDOM.render(
      <React.StrictMode>
        <SemanticLibrary />
      </React.StrictMode>,
      semanticLibraryRoot
    );
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initializeReactApp();
  
  // Your existing code can stay here
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



