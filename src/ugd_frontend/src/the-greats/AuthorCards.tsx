// // AuthorCard.tsx
// import React from 'react';
// // import '../../styles/AuthorCards.css';
// import useStreamingText from '../../utils/Stream';
// import { useCardState } from '../contexts/CardStateContext';
// import VirtualBookShelfComponent from '../semantic-library/VirtualBookshelf';

// interface AuthorCardsProps {
//   author: {
//     id: string;
//     description: string;
//   };
//   expanded: boolean;
// }

// const AuthorCards: React.FC<AuthorCardsProps> = ({ author, expanded }) => {
//   const { cardState, flipCard } = useCardState(author.id);
//   const streamedDescription = useStreamingText(author.description, 15, cardState.startStreaming || false);

//   const handleClick = () => {
//     flipCard();
//   };

//   return (
//     <div className="card">
//       <div onClick={handleClick} className={`cardContainer ${cardState.isFlipped ? "cardFlipped" : ''}`}>
//         {cardState.isFlipped ? (
//           <div className="cardBack">
//             <div className="cardContent">
//               <p>{streamedDescription}</p>
//             </div>
//           </div>
//         ) : (
//           <div className="cardFront">
//             <div>
//               <img src={`/images/${author.id}.png`} className="cardImage" alt={`${author.id}`} />
//             </div>
//             <div className="cardContent">
//               <p style={{ fontSize: '16px', fontWeight: 'bold'}}>{`${author.id}`}</p>
//             </div>
//           </div>
//         )}
//       </div>
//       {expanded && (
//         <VirtualBookShelfComponent author={author.id} />
//       )}
//     </div>
//   );
// };

// export default AuthorCards;
















// New version tailwind.

import React from 'react';
import useStreamingText from '../../utils/Stream';
import { useCardState } from '../contexts/CardStateContext';
import VirtualBookShelfComponent from '../semantic-library/VirtualBookshelf';
import '../../styles/AuthorCards.css'

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
  // const streamedDescription = useStreamingText(author.description, 15, cardState.startStreaming || false);
  const streamedDescription = "Placeholder Text Lorum Ipusm ..."
  const author_categories = ["author.categories", "Example Category 2", "Example Category 3"];

  const handleClick = () => {
    flipCard();
  };

  return (
    <>
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
            {/* Here you can put the content of the back side */}
          </div>
        </div>
      </div>
      {expanded && <VirtualBookShelfComponent author={author.id} />}
    </>
  );
  
};

export default AuthorCards;
















