export interface Message {
  user_query: string;
  message: string;
  // ... other properties
}

export interface MessageCardProps {
  messageData: Message;
  currentAuthorId: string | null;
}

export interface CardFrontProps {
  messageData: Message;
  onFlip: () => void;
  currentAuthorId: string;
}

export interface CardBackProps {
  onFlip: () => void;
  currentAuthorId: string;
}

export interface Book {
  author: string;
  title: string;
  imagePath: string;
  description: string;
  categories: string[];
  
}

