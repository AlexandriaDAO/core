import React from 'react';

// OG DEMO MESSAGE CARD
interface MessageCard {
  user_query: string;
  message: string;
}

interface MessageCardContext {
  message: MessageCard | null;
  currentAuthorId: string | null;
  updateMessage: (user_query: string) => void;
  isLoading: boolean;
  error: string | null;
  setRandomAuthorId: React.Dispatch<React.SetStateAction<string | null>>;
}

const MessageContext = React.createContext<MessageCardContext | undefined>(undefined);


// New Logic for Source Cards
interface SourceCard {
  post_id: bigint;
  user_query: string;
  author: string;
  title: string;
  heading: string;
  content: string;
  summary: string;
  bookmarked: boolean;
};

export default MessageContext;