import React, { useState, useContext } from 'react';
import '../../../styles/MessageCard/MessageCard.css';
import CardFront from './CardFront';
import CardBack from './CardBack';
import MessageContext from '../../contexts/MessageContext';

const MessageCard: React.FC = () => {
  const [cardFlipped, setCardFlipped] = useState(false);

  const context = useContext(MessageContext);
  const messageData = context?.message;
  const currentAuthorId = context?.currentAuthorId;

  const handleClick = () => {
    setCardFlipped(!cardFlipped);
  };

  if (!currentAuthorId || !messageData) return null;

  return (
    <div className={`message-card-wrapper ${cardFlipped ? 'cardFlipped' : ''}`}>
      <div className="message-card">
        <CardFront messageData={messageData} onFlip={handleClick} currentAuthorId={currentAuthorId} />
        <CardBack onFlip={handleClick} currentAuthorId={currentAuthorId} />
      </div>
    </div>
  );
};

export default MessageCard;
