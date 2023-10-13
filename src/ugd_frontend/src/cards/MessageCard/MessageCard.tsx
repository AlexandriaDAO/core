import React, { useState } from 'react';
import '../../../styles/MessageCard/MessageCard.css';
import { Message, MessageCardProps } from './types';
import CardFront from './CardFront';
import CardBack from './CardBack';

const MessageCard: React.FC<MessageCardProps> = ({ messageData, randomAuthorId }) => {
  const [cardFlipped, setCardFlipped] = useState(false);

  const handleClick = () => {
    setCardFlipped(!cardFlipped);
  };

  if (!randomAuthorId) return null;

  return (
    <div className={`message-card-wrapper ${cardFlipped ? 'cardFlipped' : ''}`}>
      <div className="message-card relative">
        <CardFront messageData={messageData} onFlip={handleClick} randomAuthorId={randomAuthorId} />
        <CardBack onFlip={handleClick} />
      </div>
    </div>
  );
};

export default MessageCard;



