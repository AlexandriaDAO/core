import React from 'react';
import { CardBackProps } from './types';
import '../../../styles/MessageCard/CardBack.css';

const CardBack: React.FC<CardBackProps> = ({ onFlip }) => (
  <div className="MC-card-face MC-card-back absolute inset-0 bg-[#faf8ef] text-center p-10 overflow-y-auto">
    <p>This is the back of the card. You can put more information or another component here!</p>
    <button onClick={onFlip} className="MC-flip-button">Flip</button>
  </div>
);

export default CardBack;