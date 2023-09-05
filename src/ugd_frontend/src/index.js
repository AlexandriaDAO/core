import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import 'semantic-ui-css/semantic.min.css';
import SemanticLibrary from './semantic-library/SemanticLibrary';
import useBackgroundPosition from '../utils/useBackgroundPosition';

function SemanticLibraryPage() {
  const backgroundPosition = useBackgroundPosition();
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const image = require.context('../assets/public/images/', false, /\.(png|jpe?g|svg)$/);
    setImageUrl(image('./BlackedOut.png').default);
  }, []);

  if (!imageUrl) return <div>Loading...</div>;

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
    }}>
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
      }}/>
      <div>
        <SemanticLibrary/>
      </div>
    </div>
  );
}

const root = document.getElementById('app');
const appRoot = createRoot(root);

appRoot.render(
  <React.StrictMode>
    <SemanticLibraryPage />
  </React.StrictMode>
);
