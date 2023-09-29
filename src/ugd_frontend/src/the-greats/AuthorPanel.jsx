import React, { useState, useMemo } from 'react';
import AuthorCards from './AuthorCards';
import { Responsive, WidthProvider } from 'react-grid-layout';
import VirtualBookShelfComponent from '../semantic-library/VirtualBookshelf';

const ResponsiveGridLayout = WidthProvider(Responsive);

function AuthorPanel({ authors }) {
  const [activeAuthor, setActiveAuthor] = useState(null);

  const handleCardClick = (authorId) => {
    setActiveAuthor(authorId === activeAuthor ? null : authorId);
  };

  const generateLayout = () => {
    const layouts = {};
    const cols = { lg: 5, md: 4, sm: 3, xs: 3, xxs: 2 };

    for (const [breakpoint, numCols] of Object.entries(cols)) {
      let rowStart = 0;
      let currentRow = [];
      layouts[breakpoint] = [];

      authors.forEach((author, index) => {
        currentRow.push(index);
      
        if (currentRow.length === numCols || index === authors.length - 1) {
          const xStart = Math.floor((numCols - currentRow.length) / 2);
          currentRow.forEach((i, j) => {
            const x = xStart + j;
            const y = rowStart;
            layouts[breakpoint].push({
              i: authors[i].id,
              x,
              y,
              w: 1, 
              h: 1,
            });
          });

          if (authors.some(a => currentRow.includes(authors.indexOf(a)) && a.id === activeAuthor)) {
            layouts[breakpoint].push({
              i: `extra-${activeAuthor}`,
              x: 0,
              y: rowStart + 1,
              w: numCols, 
              h: 1,
            });
            rowStart++;
          }

          currentRow = [];
          rowStart++;
        }
      });      
    }

    return layouts;
  };


  const layouts = useMemo(generateLayout, [activeAuthor, authors]);

  return (
    <div style={{ paddingBottom: '3000px', paddingRight: '25px' }}> 
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 5, md: 4, sm: 3, xs: 3, xxs: 2 }}
      rowHeight={250}
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
        >
          <AuthorCards author={author} expanded={activeAuthor === author.id} />
        </div>
      ))}
      {/* Render the extra rows */}
      {activeAuthor && (
        <div key={`extra-${activeAuthor}`} className="virtual-bookshelf-container" style={{ height: '100%', gridColumnStart: 1, gridColumnEnd: -1 }}>
          <VirtualBookShelfComponent author={activeAuthor} />
        </div>
      )}
    </ResponsiveGridLayout>
    </div>
  );
}

export default AuthorPanel;
