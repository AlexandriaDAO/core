// OG

import React, { useState } from 'react';
import { ugd_backend } from '../declarations/ugd_backend';
import MessageContext from '../contexts/MessageContext';

interface MessageProviderProps {
  children: React.ReactNode;
}

interface MessageCard {
  user_query: string;
  message: string;
}

interface SourceCard {
  post_id: bigint;
  user_query: string;
  author: string;
  title: string;
  heading: string;
  content: string;
  bookmarked: boolean;
};

const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<MessageCard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAuthorId, setRandomAuthorId] = useState<string | null>(null);

  
  const updateMessage = async (user_query: string) => {
    setIsLoading(true);
    try {
        const response: MessageCard[] = await ugd_backend.mc_front(user_query);
        
        if (response && response.length > 0) {
          const firstResponse = response[0];
          setMessage({
              user_query: firstResponse?.user_query ?? "",
              message: firstResponse?.message ?? "",
          });
          setError(null);
          console.log("Response recieved: ", message)
      } else {
          setError("No response received from the backend");
      }

    } catch (error) {
        setError(`Failed to fetch the message`);
    } finally {
        setIsLoading(false);
    }
  };

  // Example of new functions with hard-coded inputs
  const testSourceCards = async () => {

    const postId: bigint = BigInt(16);  // Post_id is a u64 +1 counter that starts at 1 (but resets to 1 on upgrades for now)
    console.log("Current Post ID", postId)
    try {
      // const weaviateQueryResponse = await ugd_backend.get_weaviate_query("Sample Query", 1, "The_Bible"); // "The_Bible" here is the 'cluster' element of the 'author_data.ts' object.
      // console.log("Weaviate Query Response: ", weaviateQueryResponse);

      // await ugd_backend.save_sc("Example Query", "Example Author", "Example Title", "Example Heading", "Example Content");
      // console.log("SourceCard saved successfully");

      const sourceCardResponse = await ugd_backend.get_sc(postId);
      console.log("SourceCard Response: ", sourceCardResponse);

      // await ugd_backend.delete_sc(postId);
      // console.log("SourceCard deleted successfully");

      // await ugd_backend.bookmark_sc(1);
      // console.log("SourceCard bookmarked successfully");

    } catch (error) {
      console.error("Error performing actions with hardcoded inputs: ", error);
    }
  };

  // Calls every time for demo.
  testSourceCards();


  return (
    <MessageContext.Provider value={{ message, updateMessage, isLoading, error, currentAuthorId, setRandomAuthorId }}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageProvider;