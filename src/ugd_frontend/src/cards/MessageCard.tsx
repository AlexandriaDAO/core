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
      <div className="author-card-container">
        <AuthorCards authorId={randomAuthorId} />
      </div>
      <div className="text-container">
        <h3 className="message-card-query">Input Query:</h3>
        <p className="message-card-query-content">{messageData.user_query}</p>
        <hr className="content-divider" />
        <p className="message-card-content">{messageData.message}</p>
      </div>
    </div>
  );
};

export default MessageCard;