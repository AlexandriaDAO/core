export interface Message {
  user_query: string;
  message: string;
  // ... other properties
}

export interface MessageCardProps {
  messageData: Message;
  randomAuthorId: string | null;
}

export interface CardFrontProps {
  messageData: Message;
  onFlip: () => void;
  randomAuthorId: string;
}

export interface CardBackProps {
  onFlip: () => void;
}
