// import React, { useState, useEffect } from 'react';
// import useStreamingText from '../../utils/Stream';
// import '../../styles/AuthorCards.css';

// interface AuthorCardsProps {
//   author: {
//     id: string;
//     description: string;
//     categories: string[];
//   };
// }

// const AuthorCards: React.FC<AuthorCardsProps> = ({ author }) => {
//   const [hasFlipped, setHasFlipped] = useState(false);
//   const [cardFlipped, setCardFlipped] = useState(false);
//   const shouldStartStreaming = hasFlipped;
  
//   const streamedDescription = useStreamingText(author.description, 15, shouldStartStreaming);

//   useEffect(() => {
//     if (cardFlipped && !hasFlipped) {
//       setHasFlipped(true);
//     }
//   }, [cardFlipped]);

//   const handleClick = () => {
//     setCardFlipped(!cardFlipped);
//   };

//   return (
//     <div className={`
//         author-container flex 
//         ${cardFlipped ? 'expanded w-auto' : 'w-[150px]'}
//       `}>
//       <div className={`
//           card-wrapper 
//           ${cardFlipped ? 'cardFlipped transform rotate-y-180' : ''} 
//           transition-transform duration-500 ease-in-out 
//           perspective-[1000px] w-150 h-150
//         `} onClick={handleClick}>
//         <div className="author-card relative transform-gpu transition-transform duration-500 ease-in-out">
//           <div className="card-face card-front absolute inset-0 bg-[#fbfbf8] border border-[#252525] rounded-[.5rem] flex flex-col items-center">
//             <div className="image-container w-full h-full minus-mb-[25px] overflow-hidden rounded-t-[.5rem] shadow-inner">
//               <img src={`/images/${author.id}.png`} className="object-cover w-full h-full" alt={`${author.id}`} />
//             </div>
//             <div className="text-container w-[95%] h-[15px] bg-gray-100 rounded-b-lg flex items-center justify-center">
//               <p className="overflow-hidden overflow-ellipsis author-name">{`${author.id}`}</p>
//             </div>
//           </div>
//           <div className="card-face card-back absolute inset-0 bg-[#fbfbf8] text-center p-10 overflow-y-auto">
//             <p className="streamed-description">{streamedDescription}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthorCards;





import React, { useState, useEffect } from 'react';
import useStreamingText from '../../utils/Stream';
import AuthorCard from '../cards/AuthorCard'

interface AuthorCardsProps {
  author: {
    id: string;
    description: string;
    categories: string[];
  };
}

const AuthorCards: React.FC<AuthorCardsProps> = ({ author }) => {
  const [hasFlipped, setHasFlipped] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const shouldStartStreaming = hasFlipped;
  
  const streamedDescription = useStreamingText(author.description, 15, shouldStartStreaming);

  useEffect(() => {
    if (cardFlipped && !hasFlipped) {
      setHasFlipped(true);
    }
  }, [cardFlipped]);

  const handleClick = () => {
    setCardFlipped(!cardFlipped);
  };

  return (
    <div
      className={`
        author-container flex
        ${cardFlipped ? 'expanded w-auto' : 'w-[150px]'}
      `}
    >
      <AuthorCard
        image={`/images/${author.id}.png`}
        title={author.id}
        onCardClick={handleClick}
        flipped={cardFlipped}
        description={streamedDescription}
      />
    </div>
  );
};

export default AuthorCards;