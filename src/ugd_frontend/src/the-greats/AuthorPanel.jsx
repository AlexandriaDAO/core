// import React, { useState, useMemo } from 'react';
// import Scaler from '../cards/Scaler';
// import AuthorCards from '../cards/AuthorCards';
// import { Responsive, WidthProvider } from 'react-grid-layout';
// import VirtualBookShelfComponent from '../semantic-library/VirtualBookshelf';

// const ResponsiveGridLayout = WidthProvider(Responsive);

// function AuthorPanel({ authors }) {
//   const [activeAuthor, setActiveAuthor] = useState(null);

//   const handleCardClick = (authorId) => {
//     setActiveAuthor(authorId === activeAuthor ? null : authorId);
//   };

//   const CARD_WIDTH = 180;
//   const CARD_HEIGHT = 217.5;

//   const generateLayout = () => {
//     const layouts = {};
//     const cols = { lg: 5, md: 4, sm: 3, xs: 2, xxs: 2 };

//     for (const [breakpoint, numCols] of Object.entries(cols)) {
//       layouts[breakpoint] = [];
//       authors.forEach((author, index) => {
//         layouts[breakpoint].push({
//           i: author.id,
//           x: index % numCols,
//           y: Math.floor(index / numCols),
//           w: 1,
//           h: 1
//         });
//       });

//       if (activeAuthor) {
//         const index = authors.findIndex(a => a.id === activeAuthor);
//         layouts[breakpoint].push({
//           i: `extra-${activeAuthor}`,
//           x: 0,
//           y: Math.floor(index / numCols) + 1,
//           w: numCols, 
//           h: 1,
//         });
//       }
//     }
//     return layouts;
//   };

//   const layouts = useMemo(generateLayout, [activeAuthor, authors]);

//   return (
//     <div style={{ paddingBottom: '3000px' }}>
//       <Scaler>
//         <ResponsiveGridLayout
//           className="layout"
//           layouts={layouts}
//           breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
//           cols={{ lg: 5, md: 4, sm: 3, xs: 2, xxs: 2 }}
//           rowHeight={CARD_HEIGHT}
//           containerPadding={[0, 0]}
//           margin={[0, 0]}
//           autoSize={true}
//           isDraggable={false}
//         >
//           {authors.map((author) => (
//             <div 
//               key={author.id} 
//               onClick={() => handleCardClick(author.id)} 
//               className="flex justify-center items-center h-full"
//               style={{ width: CARD_WIDTH }}
//             >
//               <AuthorCards author={author} expanded={activeAuthor === author.id} />
//             </div>
//           ))}
//           {/* Render the extra rows */}
//           {activeAuthor && (
//             <div key={`extra-${activeAuthor}`} className="virtual-bookshelf-container" style={{ height: '100%', gridColumnStart: 1, gridColumnEnd: -1 }}>
//               <VirtualBookShelfComponent author={activeAuthor} />
//             </div>
//           )}
//         </ResponsiveGridLayout>
//       </Scaler>
//     </div>
//   );
// }

// export default AuthorPanel;








// import React, { useState, useMemo } from 'react';
// import Scaler from '../cards/Scaler';
// import AuthorCards from '../cards/AuthorCards';
// import { Responsive, WidthProvider } from 'react-grid-layout';
// import VirtualBookShelfComponent from '../semantic-library/VirtualBookshelf';

// const ResponsiveGridLayout = WidthProvider(Responsive);

// function AuthorPanel({ authors }) {
//   const [activeAuthor, setActiveAuthor] = useState(null);

//   const handleCardClick = (authorId) => {
//     setActiveAuthor(authorId === activeAuthor ? null : authorId);
//   };

//   const CARD_WIDTH = 180;

//   const generateLayout = () => {
//     const layouts = {};
//     const cols = { lg: 5, md: 4, sm: 3, xs: 2, xxs: 2 };

//     for (const [breakpoint, numCols] of Object.entries(cols)) {
//       layouts[breakpoint] = [];
//       authors.forEach((author, index) => {
//         layouts[breakpoint].push({
//           i: author.id,
//           x: index % numCols,
//           y: Math.floor(index / numCols),
//           w: 1,
//           h: 1
//         });
//       });

//       if (activeAuthor) {
//         const index = authors.findIndex(a => a.id === activeAuthor);
//         layouts[breakpoint].push({
//           i: `extra-${activeAuthor}`,
//           x: 0,
//           y: Math.floor(index / numCols) + 1,
//           w: numCols, 
//           h: 1,
//         });
//       }
//     }
//     return layouts;
//   };

//   const layouts = useMemo(generateLayout, [activeAuthor, authors]);

//   return (
//     <div style={{ paddingBottom: '3000px' }}>
//       <Scaler>
//         <ResponsiveGridLayout
//           className="layout"
//           layouts={layouts}
//           breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
//           cols={{ lg: 5, md: 4, sm: 3, xs: 2, xxs: 2 }}
//           containerPadding={[0, 0]}
//           margin={[0, 0]}
//           isDraggable={false}
//         >
//           {authors.map((author) => (
//             <div 
//               key={author.id} 
//               onClick={() => handleCardClick(author.id)} 
//               className="flex justify-center items-center h-full"
//               style={{ width: CARD_WIDTH }}
//             >
//               <AuthorCards author={author} expanded={activeAuthor === author.id} />
//             </div>
//           ))}
//           {activeAuthor && (
//             <div key={`extra-${activeAuthor}`} className="virtual-bookshelf-container" style={{ height: '100%', gridColumnStart: 1, gridColumnEnd: -1 }}>
//               <VirtualBookShelfComponent author={activeAuthor} />
//             </div>
//           )}
//         </ResponsiveGridLayout>
//       </Scaler>
//     </div>
//   );
// }

// export default AuthorPanel;















import React, { useState, useMemo } from 'react';
import Scaler from '../cards/Scaler';
import { useScale } from '../cards/Scaler';
import AuthorCards from '../cards/AuthorCards';
import { Responsive, WidthProvider } from 'react-grid-layout';
import VirtualBookShelfComponent from '../semantic-library/VirtualBookshelf';

const ResponsiveGridLayout = WidthProvider(Responsive);

function AuthorPanel({ authors }) {
  const [activeAuthor, setActiveAuthor] = useState(null);

  const handleCardClick = (authorId) => {
    setActiveAuthor(authorId === activeAuthor ? null : authorId);
  };


  const scale = useScale();
  
  const CARD_WIDTH = 180 * scale;
  const CARD_HEIGHT = 217.5 * scale;

  // const CARD_WIDTH = 180;
  // const CARD_HEIGHT = 217.5;

  const containerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Listen for container width changes
  React.useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }

    // Optionally, listen to window resize if you expect dynamic changes
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCols = () => {
    // Dynamically determine number of columns based on container width and card width
    const numCols = Math.floor(containerWidth / CARD_WIDTH);
    return numCols > 0 ? numCols : 1;
  };

  const generateLayout = () => {
    const layouts = {};
    const numCols = getCols();

    layouts['xxs'] = [];
    authors.forEach((author, index) => {
      layouts['xxs'].push({
        i: author.id,
        x: index % numCols,
        y: Math.floor(index / numCols),
        w: 1,
        h: 1
      });
    });

    if (activeAuthor) {
      const index = authors.findIndex(a => a.id === activeAuthor);
      layouts['xxs'].push({
        i: `extra-${activeAuthor}`,
        x: 0,
        y: Math.floor(index / numCols) + 1,
        w: numCols, 
        h: 1,
      });
    }
    return layouts;
  };

  const layouts = useMemo(generateLayout, [activeAuthor, authors, containerWidth]);

  return (
    <div ref={containerRef} style={{ paddingBottom: '3000px' }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ xxs: 0 }}
          cols={{ xxs: getCols() }}
          rowHeight={CARD_HEIGHT}
          containerPadding={[0, 0]}
          margin={[0, 0]}
          autoSize={true}
          isDraggable={true}
        >            
          {authors.map((author) => (
            <div 
              key={author.id} 
              onClick={() => handleCardClick(author.id)} 
              className="flex justify-center items-center h-full"
              style={{ width: CARD_WIDTH, border: '1px solid red' }}
            >
              <AuthorCards author={author} expanded={activeAuthor === author.id} />
            </div>
          ))}
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
