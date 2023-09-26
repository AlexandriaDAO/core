// AuthorCard.tsx
import React from 'react';
import '../../styles/AuthorCards.css';
import useStreamingText from './Stream';
import { useCardState } from '../contexts/CardStateContext';
import VirtualBookShelfComponent from '../semantic-library/VirtualBookshelf';

interface AuthorCardsProps {
  author: {
    id: string;
    description: string;
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
    <div className="card">
      <div onClick={handleClick} className={`cardContainer ${cardState.isFlipped ? "cardFlipped" : ''}`}>
        {cardState.isFlipped ? (
          <div className="cardBack">
            <div className="cardContent">
              <p>{streamedDescription}</p>
            </div>
          </div>
        ) : (
          <div className="cardFront">
            <div>
              <img src={`/images/${author.id}.png`} className="cardImage" alt={`${author.id}`} />
            </div>
            <div className="cardContent">
              <p style={{ fontSize: '16px', fontWeight: 'bold'}}>{`${author.id}`}</p>
            </div>
          </div>
        )}
      </div>
      {expanded && (
        <VirtualBookShelfComponent author={author.id} />
      )}
    </div>
  );
};

export default AuthorCards;
