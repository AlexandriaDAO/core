// // First hello world version that works with the origional index.html

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











import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import SemanticLibrary from './semantic-library/SemanticLibrary';
import { ugd_backend } from "../../declarations/ugd_backend";
import useBackgroundPosition from '../utils/useBackgroundPosition';
import '../styles/main.css';

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

  // Your existing form code can stay here
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
