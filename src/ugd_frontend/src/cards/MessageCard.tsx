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