// AuthorCard.tsx

import React from 'react';
import { Card, Image } from 'semantic-ui-react';
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
    <div>
      {/* Existing Author Card */}
      <div onClick={handleClick} className={`"cardContainer" ${cardState.isFlipped ? "cardFlipped" : ''}`}>
        {cardState.isFlipped ? (
          <Card className="cardBack" raised>
            <Card.Content textAlign='center' style={{ minHeight: "210px", maxHeight: "210px", overflowY: "auto" }}>
              <Card.Description>{streamedDescription}</Card.Description>
            </Card.Content>
          </Card>
        ) : (
          <Card className="cardFront" raised>
            <div>
              <Image src={`/images/${author.id}.png`} className="cardImage" />
            </div>
            <Card.Content textAlign='center'>
              <Card.Content style={{ fontSize: '16px', fontWeight: 'bold'}}>{`${author.id}`}</Card.Content>
            </Card.Content>
          </Card>
        )}
      </div>
      {expanded && (
        <VirtualBookShelfComponent author={author.id} />
      )}
    </div>
  );
};

export default AuthorCards;