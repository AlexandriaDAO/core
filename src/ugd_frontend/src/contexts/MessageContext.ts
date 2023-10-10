// // First problem version
// import React from 'react';

// interface IMessageContext {
//   message: string;
//   updateMessage: (query: string) => void;
// }

// const MessageContext = React.createContext<IMessageContext | undefined>(undefined);

// export default MessageContext;






// // Second version
import React from 'react';

interface IMessageContext {
  message: string;
  updateMessage: (query: string) => void;
  isLoading: boolean;
  error: string | null;
}

const MessageContext = React.createContext<IMessageContext | undefined>(undefined);

export default MessageContext;
