// import React, { useState, useEffect } from 'react';
// import AuthorCards from './AuthorCards';
// // import '../../styles/AuthorCards.css';
// import { useResetCards } from '../contexts/CardStateContext';

// function AuthorPanel({ authors }) {
//   const [activeAuthor, setActiveAuthor] = useState(null);
//   const resetCards = useResetCards();

//   useEffect(() => {
//     setActiveAuthor(null);
//     resetCards();
//   }, []);

//   const handleCardClick = (authorId) => {
//     setActiveAuthor(authorId === activeAuthor ? null : authorId);
//   };

//   return (
//     <div className="grid">
//       {authors.map((author) => (
//         <div key={author.id} onClick={() => handleCardClick(author.id)}>
//           <AuthorCards 
//             author={author} 
//             expanded={activeAuthor === author.id} 
//           />
//         </div>
//       ))}
//     </div>
//   );
// }

// export default AuthorPanel;











import React, { useState, useEffect } from 'react';
import AuthorCards from './AuthorCards';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useResetCards } from '../contexts/CardStateContext';

const ResponsiveGridLayout = WidthProvider(Responsive);

function AuthorPanel({ authors }) {
  const [activeAuthor, setActiveAuthor] = useState(null);
  const resetCards = useResetCards();

  useEffect(() => {
    setActiveAuthor(null);
    resetCards();
  }, []);

  const handleCardClick = (authorId) => {
    setActiveAuthor(authorId === activeAuthor ? null : authorId);
  };

  // Calculate layout dynamically
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
              w: 0.9,
              h: 1.5,
            });
          });
          currentRow = [];
          rowStart += 1.5;
        }
      });
    }

    return layouts;
  };

  const layouts = generateLayout();

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 710, xxs: 0 }}
      cols={{ lg: 5, md: 4, sm: 3, xs: 3, xxs: 2 }}
      autoSize={true}
      margin={[0, 25]}
      containerPadding={[0, 70]}
    >
      {authors.map((author) => (
        <div key={author.id} onClick={() => handleCardClick(author.id)} className="flex justify-center items-center h-full">
        {/* <div key={author.id} onClick={() => handleCardClick(author.id)} > */}
          <AuthorCards author={author} expanded={activeAuthor === author.id} />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}

export default AuthorPanel;
