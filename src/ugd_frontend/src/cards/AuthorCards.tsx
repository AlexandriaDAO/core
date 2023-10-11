// import React, { useState, useEffect } from 'react';
// import useStreamingText from '../../utils/Stream';
// import AuthorCard from './AuthorCard'
// import '../../styles/AuthorCards.css'

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
//       <AuthorCard
//         image={`/images/${author.id}.png`}
//         title={author.id}
//         onCardClick={handleClick}
//         flipped={cardFlipped}
//         description={streamedDescription}
//       />
//   );
// };

// export default AuthorCards;



import React, { useState, useEffect } from 'react';
import useStreamingText from '../../utils/Stream';
import AuthorCard from './AuthorCard';
import '../../styles/AuthorCards.css';
import { useAuthors } from '../contexts/AuthorContext';

interface AuthorCardsProps {
  authorId: string;  // Just need the authorId as prop now
}

const AuthorCards: React.FC<AuthorCardsProps> = ({ authorId }) => {
  const { authors } = useAuthors();  // Use the context
  const author = authors.find(a => a.id === authorId);  // Find the author based on the provided id

  if (!author) {
    return null;  // Handle cases where the author isn't found for the given ID
  }

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
      <AuthorCard
        image={`/images/${author.id}.png`}
        title={author.id}
        onCardClick={handleClick}
        flipped={cardFlipped}
        description={streamedDescription}
      />
  );
};

export default AuthorCards;
