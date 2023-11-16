export interface Message {
  user_query: string;
  message: string;
  // ... other properties
}

export interface MainMessageCardProps {
  isShared?: boolean;
  AuthorId: string;
}

export interface MessageCardProps {
  messageData: Message;
  currentAuthorId: string | null;
}

// NEW PROPS -------------------------------
export interface DetailsHeaderInterface {
  onFlip: () => void;
  onMessageTypeUpdate: (messageType: string) => void;
  messageType: string;
}

export interface CardDetailsFrontProps {
  messageData: Message;
  messageType: string;
}

export interface CardDetailsBackProps {
  currentAuthorId: string;
}

export interface UserProfileInterface {
  currentAuthorId: string;
  InputMessage: string;
}
// NEW PROPS -------------------------------

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
