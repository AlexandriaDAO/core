// // OG
// import React, { useEffect, useState } from 'react';
// import { ugd_backend } from "../../declarations/ugd_backend";

// const MessageReceiver: React.FC = () => {
//   const [message, setMessage] = useState<string>("");

//   const handleFormSubmit = async (e: Event) => {
//     e.preventDefault();
    
//     const form = e.target as HTMLFormElement;
//     const button: HTMLButtonElement | null = form.querySelector("button");
//     const queryInput: HTMLInputElement | null = document.getElementById("query") as HTMLInputElement | null;
    
//     if (!button || !queryInput) {
//       console.error("Elements not found");
//       return;
//     }

//     const query = queryInput.value;
//     button.setAttribute("disabled", "true");

//     const responseMessage = await ugd_backend.mc_front(query);
//     setMessage(responseMessage);
//     button.removeAttribute("disabled");
//   };

//   useEffect(() => {
//     const form = document.querySelector("form");
//     if (form) {
//       form.addEventListener("submit", handleFormSubmit);
//     }

//     return () => {
//       if (form) {
//         form.removeEventListener("submit", handleFormSubmit);
//       }
//     };
//   }, []);

//   return <div id="message">{message}</div>;
// };

// export default MessageReceiver;












// // Broken First version using context.
// import React, { useState } from 'react';
// import { ugd_backend } from "../../declarations/ugd_backend";
// import MessageContext from '../src/contexts/MessageContext';


// interface MessageProviderProps {
//   children: React.ReactNode;
// }

// const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
//   const [message, setMessage] = useState<string>("");

//   const updateMessage = async (query: string) => {
//     const responseMessage = await ugd_backend.mc_front(query);
//     setMessage(responseMessage);
//   };

//   return (
//     <MessageContext.Provider value={{ message, updateMessage }}>
//       {children}
//       <div id="message">{message}</div>
//     </MessageContext.Provider>
//   );
// };

// export default MessageProvider;






// Revising Broken First version using context.
import React, { useState } from 'react';
import { ugd_backend } from "../../declarations/ugd_backend";
import MessageContext from '../src/contexts/MessageContext';


interface MessageProviderProps {
  children: React.ReactNode;
}

const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const updateMessage = async (query: string) => {
    setIsLoading(true);
    try {
        const responseMessage = await ugd_backend.mc_front(query);
        setMessage(responseMessage);
        setError(null);
    } catch (error) {
        setError(`Failed to fetch the message`);
    } finally {
        setIsLoading(false);
    }
};


  return (
    <MessageContext.Provider value={{ message, updateMessage, isLoading, error }}>
      {children}
      <div id="message">{message}</div>
    </MessageContext.Provider>
  );
};

export default MessageProvider;

























// // New version that respects the new rust file that returns Option<MessageCard>
// import React, { useEffect, useState } from 'react';
// import { ugd_backend } from "../../declarations/ugd_backend";

// type MCResponse = {
//   query: string;
//   ai_message: string;
// };

// const MessageReceiver: React.FC = () => {
//   const [response, setResponse] = useState<MCResponse | null>(null);

//   const handleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const form = e.target as HTMLFormElement;
//     const button: HTMLButtonElement | null = form.querySelector("button");
//     const nameInput: HTMLInputElement | null = document.getElementById("name") as HTMLInputElement | null;

//     if (!button || !nameInput) {
//       console.error("Elements not found");
//       return;
//     }

//     const input_query = nameInput.value;
//     button.setAttribute("disabled", "true");

//     try {
//       const result = await ugd_backend.mc_front(input_query);
//       if (result) {
//         const { input, output } = result;
//         setResponse({ query: input, ai_message: output });
//       } else {
//         console.error("Received no result from mc_front");
//       }
//     } catch (error) {
//       console.error("Error fetching the response:", error);
//     }
 
//   };

//   useEffect(() => {
//     const form = document.querySelector("form");
//     if (form) {
//       form.addEventListener("submit", handleFormSubmit as any);
//     }

//     return () => {
//       if (form) {
//         form.removeEventListener("submit", handleFormSubmit as any);
//       }
//     };
//   }, []);

//   return (
//     <div id="mcResponseOutput">
//       <p>Query: {response?.query}</p>
//       <p>AI Message: {response?.ai_message}</p>
//     </div>
//   );
// };

// export default MessageReceiver;
