// import React, { useState } from 'react';
// import '../../../styles/MessageCard/MessageCard.css';
// import { Message, MessageCardProps } from './types';
// import CardFront from './CardFront';
// import CardBack from './CardBack';

// const MessageCard: React.FC<MessageCardProps> = ({ messageData, randomAuthorId }) => {
//   const [cardFlipped, setCardFlipped] = useState(false);

//   const handleClick = () => {
//     setCardFlipped(!cardFlipped);
//   };

//   if (!randomAuthorId) return null;

//   return (
//     <div className={`message-card-wrapper ${cardFlipped ? 'cardFlipped' : ''}`}>
//       <div className="message-card relative">
//         <CardFront messageData={messageData} onFlip={handleClick} randomAuthorId={randomAuthorId} />
//         <CardBack onFlip={handleClick} />
//       </div>
//     </div>
//   );
// };

// export default MessageCard;























// import MessageContext from '../../contexts/MessageContext';
// import React, { useState, useContext } from 'react';
// import '../../../styles/MessageCard/MessageCard.css';
// import CardFront from './CardFront';
// import CardBack from './CardBack';

// const MessageCard: React.FC = () => {
//   const [cardFlipped, setCardFlipped] = useState(false);

//   const { message: messageData, randomAuthorId } = useContext(MessageContext);

//   const handleClick = () => {
//     setCardFlipped(!cardFlipped);
//   };

//   if (!randomAuthorId) return null;

//   return (
//     <div className={`message-card-wrapper ${cardFlipped ? 'cardFlipped' : ''}`}>
//       <div className="message-card relative">
//         <CardFront messageData={messageData} onFlip={handleClick} randomAuthorId={randomAuthorId} />
//         <CardBack onFlip={handleClick} />
//       </div>
//     </div>
//   );
// };

// export default MessageCard;
import React, { useState, useContext } from 'react';
import '../../../styles/MessageCard/MessageCard.css';
import CardFront from './CardFront';
import CardBack from './CardBack';
import MessageContext from '../../contexts/MessageContext';

const MessageCard: React.FC = () => {
  const [cardFlipped, setCardFlipped] = useState(false);

  const context = useContext(MessageContext);  // Use context without destructuring here
  
  // Check if context is available and then use its values
  const messageData = context?.message;
  const randomAuthorId = context?.randomAuthorId;

  const handleClick = () => {
    setCardFlipped(!cardFlipped);
  };

  if (!randomAuthorId || !messageData) return null;

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
