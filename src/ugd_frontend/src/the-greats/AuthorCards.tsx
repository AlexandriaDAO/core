import React from 'react';
import useStreamingText from '../../utils/Stream';
import { useCardState } from '../contexts/CardStateContext';
// import VirtualBookShelfComponent from '../semantic-library/VirtualBookshelf';
import '../../styles/AuthorCards.css';

interface AuthorCardsProps {
  author: {
    id: string;
    description: string;
    categories: string[];
  };
  expanded: boolean;
}

const AuthorCards: React.FC<AuthorCardsProps> = ({ author, expanded }) => {
  const { cardState, flipCard } = useCardState(author.id);
  const streamedDescription = useStreamingText(author.description, 15, cardState.startStreaming || false);

  const handleClick = () => {
    flipCard();
  };

  return (
    <>
      <div className={`author-container flex ${expanded ? 'expanded' : ''}`}>
        <div className={`card-wrapper ${expanded ? 'cardFlipped' : ''}`}>
        <div className="author-card" onClick={handleClick}>
            <div className="card-face card-front">
              <div className="image-container w-full h-32 rounded-t-lg overflow-hidden shadow-inner">
                <img src={`/images/${author.id}.png`} className="object-cover min-w-full min-h-full" alt={`${author.id}`} />
              </div>
              <div className="text-container w-full h-8 flex items-center justify-center bg-gray-100 rounded-b-lg">
                <p className="text-xs font-semibold text-gray-700">{`${author.id}`}</p>
              </div>
            </div>
            <div className="card-face card-back">
              {/* <div className="extension"></div>  */}
              {/* Here you can put the content of the back side */}
            </div>
           </div>
        </div>
      </div>
    </>
  );
};              

export default AuthorCards;



// <div className={`virtual-bookshelf-container transform transition-transform duration-500 ease-in-out ${expanded ? 'translate-x-0' : '-translate-x-full'}`}>
//   {expanded && <VirtualBookShelfComponent author={author.id} />}
// </div>










// import React from 'react';
// import { Responsive, WidthProvider } from 'react-grid-layout';
// import useStreamingText from '../../utils/Stream';
// import { useCardState } from '../contexts/CardStateContext';
// import '../../styles/AuthorCards.css'
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// interface AuthorCardsProps {
//   author: {
//     id: string;
//     description: string;
//     categories: string[];
//   };
//   expanded: boolean;
// }

// const ResponsiveGridLayout = WidthProvider(Responsive);

// const AuthorCards: React.FC<AuthorCardsProps> = ({ author, expanded }) => {
//   const { cardState, flipCard } = useCardState(author.id);
//   const streamedDescription = useStreamingText(
//     author.description,
//     15,
//     cardState.startStreaming || false
//   );

//   const handleClick = () => {
//     flipCard();
//   };

//   const layout = [
//     { i: 'a', x: 0, y: 0, w: 1, h: 1 },
//   ];

//   return (
//     <>
//       <ResponsiveGridLayout
//         className="layout"
//         layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
//         breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
//         cols={{ lg: 5, md: 4, sm: 3, xs: 2, xxs: 2 }} // Adjust the number of columns here
//       >
//         <div key="a" className={`author-container flex ${expanded ? 'expanded' : ''}`}>
//           <div className={`card-wrapper ${expanded ? 'cardFlipped' : ''}`}>
//             <div className="author-card" onClick={handleClick}>
//               <div className="card-face card-front">
//                 <div className="image-container w-full h-32 rounded-t-lg overflow-hidden shadow-inner">
//                   <img src={`/images/${author.id}.png`} className="object-cover min-w-full min-h-full" alt={`${author.id}`} />
//                 </div>
//                 <div className="text-container w-full h-8 flex items-center justify-center bg-gray-100 rounded-b-lg">
//                   <p className="text-xs font-semibold text-gray-700">{`${author.id}`}</p>
//                 </div>
//               </div>
//               <div className="card-face card-back">
//                 <div className="extension"></div>
//                 {/* Here you can put the content of the back side */}
//               </div>
//             </div>
//           </div>
//         </div>
//       </ResponsiveGridLayout>
//     </>
//   );
// };

// export default AuthorCards;



