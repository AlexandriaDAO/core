// import React from 'react';

// interface IMessageContext {
//   message: string;
//   updateMessage: (query: string) => void;
//   isLoading: boolean;
//   error: string | null;
// }

// const MessageContext = React.createContext<IMessageContext | undefined>(undefined);

// export default MessageContext;







import React from 'react';

interface MessageCard {
  user_query: string;
  message: string;
}

interface MessageCardContext {
  message: MessageCard | null;
  updateMessage: (query: string) => void;
  isLoading: boolean;
  error: string | null;
}

const MessageContext = React.createContext<MessageCardContext | undefined>(undefined);

export default MessageContext;
