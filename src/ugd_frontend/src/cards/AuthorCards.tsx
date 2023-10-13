import React, { useState, useEffect } from 'react';
import useStreamingText from '../../utils/Stream';
import AuthorCard from './AuthorCard';
import '../../styles/AuthorCards.css';
import { useAuthors } from '../contexts/AuthorContext';

interface AuthorCardsProps {
  authorId: string;
}

const AuthorCards: React.FC<AuthorCardsProps> = ({ authorId }) => {
  const { authors } = useAuthors();
  const author = authors.find(a => a.id === authorId);

  if (!author) {
    return null;
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



