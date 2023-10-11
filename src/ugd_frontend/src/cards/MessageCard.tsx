// // import React from 'react';
// // import '../../styles/MessageCard.css'

// // interface Message {
// //   user_query: string;
// //   message: string;
// //   // ... any other properties you might add in the future.
// // }

// // interface MessageCardProps {
// //   messageData: Message;
// // }

// // const MessageCard: React.FC<MessageCardProps> = ({ messageData }) => {
// //   return (
// //     <div className="message-card">
// //       <h3 className="message-card-query">Query: {messageData.user_query}</h3>
// //       <p className="message-card-content">{messageData.message}</p>
// //       {/* Any additional properties can be rendered here */}
// //     </div>
// //   );
// // };

// // export default MessageCard;















// import React from 'react';
// import '../../styles/MessageCard.css';
// import { useAuthors } from '../contexts/AuthorContext';
// import AuthorCards from './AuthorCards';

// interface Message {
//   user_query: string;
//   message: string;
//   // ... any other properties
// }

// interface MessageCardProps {
//   messageData: Message;
// }

// const MessageCard: React.FC<MessageCardProps> = ({ messageData }) => {
//   const { authors } = useAuthors();

//   // Get a random author
//   const randomIndex = Math.floor(Math.random() * authors.length);
//   const randomAuthor = authors[randomIndex];

//   return (
//     <div className="message-card">
//       <h3 className="message-card-query">Query: {messageData.user_query}</h3>
//       <p className="message-card-content">{messageData.message}</p>
//       <AuthorCards authorId={randomAuthor.id} /> {/* Display the random author card */}
//       {/* Any additional properties can be rendered here */}
//     </div>
//   );
// };

// export default MessageCard;

















// import React from 'react';
// import '../../styles/MessageCard.css'

// interface Message {
//   user_query: string;
//   message: string;
//   // ... any other properties you might add in the future.
// }

// interface MessageCardProps {
//   messageData: Message;
// }

// const MessageCard: React.FC<MessageCardProps> = ({ messageData }) => {
//   return (
//     <div className="message-card">
//       <h3 className="message-card-query">Query: {messageData.user_query}</h3>
//       <p className="message-card-content">{messageData.message}</p>
//       {/* Any additional properties can be rendered here */}
//     </div>
//   );
// };

// export default MessageCard;














// Getting RandomAuthor from SearchBar
import React from 'react';
import '../../styles/MessageCard.css';
import { useAuthors } from '../contexts/AuthorContext';
import AuthorCards from './AuthorCards';

interface Message {
  user_query: string;
  message: string;
  // ... any other properties
}

interface MessageCardProps {
  messageData: Message;
  randomAuthorId: string | null;
}

const MessageCard: React.FC<MessageCardProps> = ({ messageData, randomAuthorId }) => {
  if (!randomAuthorId) return null;

  return (
    <div className="message-card">
      <h3 className="message-card-query">Query: {messageData.user_query}</h3>
      <p className="message-card-content">{messageData.message}</p>
      <AuthorCards authorId={randomAuthorId} />
    </div>
  );
};


export default MessageCard;
