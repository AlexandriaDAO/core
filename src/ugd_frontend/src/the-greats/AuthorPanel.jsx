import React, { useState, useEffect, useMemo, useRef } from 'react';
import AuthorCard from '../cards/AuthorCard';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { AuthorProvider } from '../contexts/AuthorContext';

const ResponsiveGridLayout = WidthProvider(Responsive);

import '../../styles/react-grid-layout.css'

function AuthorPanel({ authors }) {
  const [activeAuthor, setActiveAuthor] = useState(null);
  const [numCols, setNumCols] = useState(1);

  const CARD_WIDTH = 300;
  const CARD_HEIGHT = 500;

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

  useEffect(() => {
    const calculateCols = () => {
      const columns = Math.floor(containerWidth / CARD_WIDTH);
      setNumCols(columns > 0 ? columns : 1);
    };
    
    calculateCols();
  }, [containerWidth]);

  const generateLayout = () => {
    const layouts = { xxs: [] };
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

  const layouts = useMemo(generateLayout, [activeAuthor, authors, numCols]);

  return (
    <div ref={containerRef} style={{ paddingBottom: '3000px' }}>
      <AuthorProvider>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ xxs: 0 }}
          cols={{ xxs: numCols }}
          rowHeight={CARD_HEIGHT}
          containerPadding={[0, 0]}
          margin={[0, 0]}
          autoSize={true}
          isDraggable={true}
        >            
          {authors.map((author) => (
            <div 
              key={author.id} 
              // onClick={() => handleCardClick(author.id)} 
              className="flex justify-center items-center h-full"
              style={{ width: CARD_WIDTH }}
            >
              <AuthorCard authorId={author.id} setActiveAuthor={setActiveAuthor}/>
            </div>
          ))}
        </ResponsiveGridLayout>
      </AuthorProvider>

        
    </div>
  );
}

export default AuthorPanel;