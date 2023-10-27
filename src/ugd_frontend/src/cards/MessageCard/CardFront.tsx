import React from 'react';
import AuthorCards from '../AuthorCard';
import { CardFrontProps } from './types';
import '../../../styles/MessageCard/CardFront.css';

const CardFront: React.FC<CardFrontProps> = ({ messageData, onFlip, currentAuthorId }) => (
  <div className="MC-card-face MC-card-front absolute inset-0 bg-[#faf8ef] border border-[#d3c2af] rounded-[.5rem] flex flex-row items-center">
    <div className="MC-author-card-container">
      <AuthorCards authorId={currentAuthorId} />
    </div>
    <div className="MC-text-container">
      <h3 className="MC-message-card-query">Input Query:</h3>
      <p className="MC-message-card-query-content">{messageData.user_query}</p>
      <hr className="MC-content-divider" />
      <p className="MC-message-card-content">{messageData.message}</p>
      <button onClick={onFlip} className="MC-flip-button">Flip</button>
    </div>
  </div>
);

export default CardFront;



