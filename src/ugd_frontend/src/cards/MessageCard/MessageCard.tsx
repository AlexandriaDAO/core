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




// import React, { useState, useEffect } from 'react';
// import '../../../styles/MessageCard/MessageCard.css';
// import { Message, MessageCardProps } from './types';
// import CardFront from './CardFront';
// import CardBack from './CardBack';
// import { Book } from './types'; // import Book type if not already imported

// const MessageCard: React.FC<MessageCardProps> = ({ messageData, randomAuthorId }) => {
//   const [cardFlipped, setCardFlipped] = useState(false);
//   const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);

//   useEffect(() => {
//     fetch('/public/books.json')
//       .then((response) => response.json())
//       .then((data: Book[]) => {
//         setSelectedBooks(data);
//       });
//   }, []);

//   const handleClick = () => {
//     setCardFlipped(!cardFlipped);
//   };

//   if (!randomAuthorId) return null;

//   return (
//     <div className={`message-card-wrapper ${cardFlipped ? 'cardFlipped' : ''}`}>
//       <div className="message-card relative">
//         <CardFront messageData={messageData} onFlip={handleClick} randomAuthorId={randomAuthorId} />
//         <CardBack onFlip={handleClick} selectedBooks={selectedBooks} />
//       </div>
//     </div>
//   );
// };

// export default MessageCard;
