import React, { useState, useEffect } from 'react';
import useStreamingText from '../../utils/Stream';
import '../../styles/AuthorCards.css';

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
    <>
      <div className={`author-container flex ${cardFlipped ? 'expanded' : ''}`}>
        <div className={`card-wrapper ${cardFlipped ? 'cardFlipped' : ''}`}>
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
              <p className="text-xs font-semibold text-gray-700">{streamedDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthorCards;

