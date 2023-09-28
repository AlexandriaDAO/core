// // OG
// import React, { useState, useEffect } from 'react';
// import AuthorCards from './AuthorCards';
// import { Responsive, WidthProvider } from 'react-grid-layout';
// import { useResetCards } from '../contexts/CardStateContext';

// const ResponsiveGridLayout = WidthProvider(Responsive);

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

//   // Calculate layout dynamically
//   const generateLayout = () => {
//     const layouts = {};
//     const cols = { lg: 5, md: 4, sm: 3, xs: 3, xxs: 2 };

//     for (const [breakpoint, numCols] of Object.entries(cols)) {
//       let rowStart = 0;
//       let currentRow = [];
//       layouts[breakpoint] = [];

//       authors.forEach((author, index) => {
//         currentRow.push(index);

//         if (currentRow.length === numCols || index === authors.length - 1) {
//           const xStart = Math.floor((numCols - currentRow.length) / 2);
//           currentRow.forEach((i, j) => {
//             const x = xStart + j;
//             const y = rowStart;
//             layouts[breakpoint].push({
//               i: authors[i].id,
//               x,
//               y,
//               w: 0.9,
//               h: 1.5,
//             });
//           });
//           currentRow = [];
//           rowStart += 1.5;
//         }
//       });
//     }

//     return layouts;
//   };

//   const layouts = generateLayout();

//   return (
//     <div style={{ paddingBottom: '50px' }}> 
//     <ResponsiveGridLayout
//       className="layout"
//       layouts={layouts}
//       breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 710, xxs: 0 }}
//       cols={{ lg: 5, md: 4, sm: 3, xs: 3, xxs: 2 }}
//       autoSize={true}
//       isDraggable={false}
//     >
//       {authors.map((author) => (
//         <div key={author.id} 
//         onClick={() => handleCardClick(author.id)} 
//         className="flex justify-center items-center h-full"
//         >
//           <AuthorCards author={author} expanded={activeAuthor === author.id} />
//         </div>
//       ))}
//     </ResponsiveGridLayout>
//     </div>
//   );
// }

// export default AuthorPanel;







// // Using Exact Card Size.
// import React, { useState, useEffect } from 'react';
// import AuthorCards from './AuthorCards';
// import { Responsive, WidthProvider } from 'react-grid-layout';
// import { useResetCards } from '../contexts/CardStateContext';

// const ResponsiveGridLayout = WidthProvider(Responsive);

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

//   // Calculate layout dynamically
//   const generateLayout = () => {
//     const layouts = {};
//     const cols = { lg: 6, md: 5, sm: 4, xs: 3, xxs: 2 };

//     for (const [breakpoint, numCols] of Object.entries(cols)) {
//       let rowStart = 0;
//       let currentRow = [];
//       layouts[breakpoint] = [];

//       authors.forEach((author, index) => {
//         currentRow.push(index);

//         if (currentRow.length === numCols || index === authors.length - 1) {
//           const xStart = Math.floor((numCols - currentRow.length) / 2);
//           currentRow.forEach((i, j) => {
//             const x = xStart + j;
//             const y = rowStart;
//             layouts[breakpoint].push({
//               i: authors[i].id,
//               x,
//               y,
//               w: 1, // set width to 1 to occupy the whole column
//               h: 1, // set height to 1 to keep aspect ratio
//             });
//           });
//           currentRow = [];
//           rowStart += 1;
//         }
//       });
//     }

//     return layouts;
//   };

//   const layouts = generateLayout();

//   return (
//     <div style={{ paddingBottom: '50px', paddingRight: '25px' }}>
//       <ResponsiveGridLayout
//         className="layout"
//         layouts={layouts}
//         breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
//         cols={{ lg: 6, md: 5, sm: 4, xs: 3, xxs: 2 }} // Defined directly here
//         // rowHeight={217.5} // set the rowHeight to 217.5px
//         rowHeight={250}
//         containerPadding={[0, 0]} // optional: remove padding if needed
//         margin={[0, 0]} // optional: remove margin if needed
//         autoSize={true}
//         isDraggable={false}
//       >
//         {authors.map((author) => (
//           <div 
//             key={author.id} 
//             onClick={() => handleCardClick(author.id)} 
//             // className="flex justify-center items-center h-full"
//             className="flex justify-center"
//           >
//             <AuthorCards author={author} expanded={activeAuthor === author.id} />
//           </div>
//         ))}
//       </ResponsiveGridLayout>
//     </div>
//   );
// }

// export default AuthorPanel;






// // A Really interesting way off getting the expander to take up a row: 
// import React, { useState, useEffect, useMemo } from 'react';
// import AuthorCards from './AuthorCards';
// import { Responsive, WidthProvider } from 'react-grid-layout';
// import { useResetCards } from '../contexts/CardStateContext';

// const ResponsiveGridLayout = WidthProvider(Responsive);

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

//   // Calculate layout dynamically
//   const generateLayout = () => {
//     const layouts = {};
//     const cols = { lg: 5, md: 4, sm: 3, xs: 3, xxs: 2 };

//     for (const [breakpoint, numCols] of Object.entries(cols)) {
//       let rowStart = 0;
//       let currentRow = [];
//       layouts[breakpoint] = [];

//       authors.forEach((author, index) => {
//         currentRow.push(index);
      
//         if (currentRow.length === numCols || index === authors.length - 1) {
//           const xStart = Math.floor((numCols - currentRow.length) / 2);
//           currentRow.forEach((i, j) => {
//             const x = author.id === activeAuthor ? 0 : xStart + j;
//             const y = rowStart;
//             layouts[breakpoint].push({
//               i: authors[i].id,
//               x,
//               y,
//               w: authors[i].id === activeAuthor ? numCols : 0.9,
//               h: 1.5,
//             });
//           });
//           currentRow = [];
//           rowStart += 1.5;
//         }
//       });      
//     }

//     return layouts;
//   };


//   const layouts = useMemo(generateLayout, [activeAuthor, authors]);

//   return (
//     <div style={{ paddingBottom: '50px' }}> 
//     <ResponsiveGridLayout
//       className="layout"
//       layouts={layouts}
//       breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 710, xxs: 0 }}
//       cols={{ lg: 5, md: 4, sm: 3, xs: 3, xxs: 2 }}
//       autoSize={true}
//       isDraggable={false}
//     >
//       {authors.map((author) => (
//         <div key={author.id} 
//         onClick={() => handleCardClick(author.id)} 
//         className="flex justify-center items-center h-full"
//         >
//           <AuthorCards author={author} expanded={activeAuthor === author.id} />
//         </div>
//       ))}
//     </ResponsiveGridLayout>
//     </div>
//   );
// }

// export default AuthorPanel;















import React, { useState, useEffect, useMemo } from 'react';
import AuthorCards from './AuthorCards';
import { Responsive, WidthProvider } from 'react-grid-layout';
import VirtualBookShelfComponent from '../semantic-library/VirtualBookshelf';

const ResponsiveGridLayout = WidthProvider(Responsive);

function AuthorPanel({ authors }) {
  const [activeAuthor, setActiveAuthor] = useState(null);

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
              w: 1, 
              h: 1,
            });
          });

          // Check if the currentRow contains the activeAuthor, if so, add an extra row
          if (authors.some(a => currentRow.includes(authors.indexOf(a)) && a.id === activeAuthor)) {
            layouts[breakpoint].push({
              i: `extra-${activeAuthor}`,
              x: 0,
              y: rowStart + 1, // place extra row just below the current row
              w: numCols, 
              h: 1,
            });
            rowStart++; // increment rowStart after adding the extra row
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
    <div style={{ paddingBottom: '5000px', paddingRight: '25px' }}> 
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
