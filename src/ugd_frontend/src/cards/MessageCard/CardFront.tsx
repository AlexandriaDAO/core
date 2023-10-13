import React from 'react';
import AuthorCards from '../AuthorCards';
import { CardFrontProps } from './types';
import '../../../styles/MessageCard/CardFront.css';

const CardFront: React.FC<CardFrontProps> = ({ messageData, onFlip, randomAuthorId }) => (
  <div className="card-face card-front absolute inset-0 bg-[#faf8ef] border border-[#d3c2af] rounded-[.5rem] flex flex-row">
    <div className="author-card-container">
      <AuthorCards authorId={randomAuthorId} />
    </div>
    <div className="text-container">
      <h3 className="message-card-query">Input Query:</h3>
      <p className="message-card-query-content">{messageData.user_query}</p>
      <hr className="content-divider" />
      <p className="message-card-content">{messageData.message}</p>
      <button onClick={onFlip} className="flip-button">Flip</button>
    </div>
  </div>
);

export default CardFront;
