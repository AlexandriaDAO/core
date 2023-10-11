import React, { useState, useEffect, useMemo, useRef } from 'react';
import AuthorCards from '../cards/AuthorCards';
import { Responsive, WidthProvider } from 'react-grid-layout';
import VirtualBookShelfComponent from '../semantic-library/VirtualBookshelf';
import { AuthorProvider } from '../contexts/AuthorContext';

const ResponsiveGridLayout = WidthProvider(Responsive);

function AuthorPanel({ authors }) {
  const [activeAuthor, setActiveAuthor] = useState(null);

  const handleCardClick = (authorId) => {
    setActiveAuthor(authorId === activeAuthor ? null : authorId);
  };

  const CARD_WIDTH = 180;
  const CARD_HEIGHT = 217.5;

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const updateContainerWidth = () => {
    if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
    }
  };

  useEffect(() => {
    updateContainerWidth();

    const handleResize = () => {
        updateContainerWidth();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCols = () => {
    const numCols = Math.floor(containerWidth / CARD_WIDTH);
    console.log("Number of Columms: ", numCols)
    return numCols > 0 ? numCols : 1;
  };

  const generateLayout = () => {
    const layouts = { xxs: [] };
    const numCols = getCols();
    const numCards = authors.length;
    const fullRows = Math.floor(numCards / numCols);
    const lastRowCards = numCards % numCols;

    authors.forEach((author, index) => {
      let xAdjustment = (index >= fullRows * numCols && lastRowCards !== 0) ? (numCols - lastRowCards) : 0;

      layouts['xxs'].push({
        i: author.id.toString(),
        x: (index % numCols) + xAdjustment,
        y: Math.floor(index / numCols),
        w: 1,
        h: 1
      });
    });

    const index = activeAuthor ? authors.findIndex(a => a.id === activeAuthor) : 0;
    let yPosition;

    if (index >= fullRows * numCols) {
        yPosition = Math.floor(index / numCols) + 1;
    } else {
        yPosition = Math.floor(index / numCols);
    }

    layouts['xxs'].push({
        i: `extra-${activeAuthor || 'none'}`,
        x: 0,
        y: yPosition,
        w: numCols,
        h: activeAuthor ? 1 : 0,
    });
  
    return layouts;
  };

  const layouts = useMemo(generateLayout, [activeAuthor, authors, containerWidth]);

  return (
    <div ref={containerRef} style={{ paddingBottom: '3000px' }}>
      <AuthorProvider>  {/* Wrap content with the AuthorProvider */}
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ xxs: 0 }}
          cols={{ xxs: getCols() }}
          rowHeight={CARD_HEIGHT}
          containerPadding={[0, 0]}
          margin={[0, 0]}
          autoSize={true}
          isDraggable={false}
        >            
          {authors.map((author) => (
            <div 
              key={author.id} 
              onClick={() => handleCardClick(author.id)} 
              className="flex justify-center items-center h-full"
              style={{ width: CARD_WIDTH }}
            >
              {/* Provide the authorId instead of the entire author object */}
              <AuthorCards authorId={author.id} expanded={activeAuthor === author.id} />
            </div>
          ))}
          {activeAuthor && (
            <div key={`extra-${activeAuthor}`} className="virtual-bookshelf-container" style={{ height: '100%', gridColumnStart: 1, gridColumnEnd: -1 }}>
              <VirtualBookShelfComponent author={activeAuthor} />
            </div>
          )}
        </ResponsiveGridLayout>
      </AuthorProvider>
    </div>
  );
}

export default AuthorPanel;