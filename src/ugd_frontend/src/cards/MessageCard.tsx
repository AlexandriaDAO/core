// import React from 'react';
// import '../../styles/MessageCard.css'


// interface MessageCardProps {
//   userQuery: string;
//   messageContent: string;
// }

// const MessageCard: React.FC<MessageCardProps> = ({ userQuery, messageContent }) => {
//   return (
//     <div className="message-card">
//       <h3 className="message-card-query">Query: {userQuery}</h3>
//       <p className="message-card-content">{messageContent}</p>
//     </div>
//   );
// };

// export default MessageCard;




import React from 'react';
import '../../styles/MessageCard.css'

interface Message {
  user_query: string;
  message: string;
  // ... any other properties you might add in the future.
}

interface MessageCardProps {
  messageData: Message;
}

const MessageCard: React.FC<MessageCardProps> = ({ messageData }) => {
  return (
    <div className="message-card">
      <h3 className="message-card-query">Query: {messageData.user_query}</h3>
      <p className="message-card-content">{messageData.message}</p>
      {/* Any additional properties can be rendered here */}
    </div>
  );
};

export default MessageCard;
