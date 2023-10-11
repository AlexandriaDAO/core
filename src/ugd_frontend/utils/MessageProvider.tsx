import React, { useState } from 'react';
import { ugd_backend } from "../../declarations/ugd_backend";
import MessageContext from '../src/contexts/MessageContext';

interface MessageProviderProps {
  children: React.ReactNode;
}

interface MessageCard {
  user_query: string;
  message: string;
}

const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<MessageCard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const updateMessage = async (query: string) => {
    setIsLoading(true);
    try {
        const response: MessageCard[] = await ugd_backend.mc_front(query);
        
        if (response && response.length > 0) {
          const firstResponse = response[0];
          setMessage({
              user_query: firstResponse?.user_query ?? "",
              message: firstResponse?.message ?? "",
          });
          setError(null);
      } else {
          setError("No response received from the backend");
      }

    } catch (error) {
        setError(`Failed to fetch the message`);
    } finally {
        setIsLoading(false);
    }
  };
  

  return (
    <MessageContext.Provider value={{ message, updateMessage, isLoading, error }}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageProvider;

