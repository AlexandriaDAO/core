// import React, { useState } from 'react';
// import '../../styles/MessageCard.css';
// import AuthorCards from './AuthorCards';

// interface Message {
//   user_query: string;
//   message: string;
//   // ... other properties
// }

// interface MessageCardProps {
//   messageData: Message;
//   randomAuthorId: string | null;
// }

// const CardFront: React.FC<{ messageData: Message; onFlip: () => void; randomAuthorId: string }> = ({ messageData, onFlip, randomAuthorId }) => (
//   <div className="card-face card-front absolute inset-0 bg-[#faf8ef] border border-[#d3c2af] rounded-[.5rem] flex flex-row">
//     <div className="author-card-container">
//       <AuthorCards authorId={randomAuthorId} />
//     </div>
//     <div className="text-container">
//       <h3 className="message-card-query">Input Query:</h3>
//       <p className="message-card-query-content">{messageData.user_query}</p>
//       <hr className="content-divider" />
//       <p className="message-card-content">{messageData.message}</p>
//       <button onClick={onFlip} className="flip-button">Flip</button>
//     </div>
//   </div>
// );

// const CardBack: React.FC<{ onFlip: () => void; }> = ({ onFlip }) => (
//   <div className="card-face card-back absolute inset-0 bg-[#faf8ef] text-center p-10 overflow-y-auto">
//     <p>This is the back of the card. You can put more information or another component here!</p>
//     <button onClick={onFlip} className="flip-button">Flip</button>
//   </div>
// );

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

