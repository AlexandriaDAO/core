// // OG From old project.

// import React, { useState, createContext, useContext, ReactNode } from 'react';

// interface CardState {
//   isFlipped?: boolean;
//   startStreaming?: boolean;
//   chatMode?: boolean;
// }

// interface CardStateContextProps {
//   cardState: Record<string, CardState>;
//   setCardState: React.Dispatch<React.SetStateAction<Record<string, CardState>>>;
//   activeChat: string | null;
//   setActiveChat: React.Dispatch<React.SetStateAction<string | null>>;
//   resetCards: () => void;
// }

// const CardStateContext = createContext<CardStateContextProps>({
//   cardState: {},
//   setCardState: () => {},
//   activeChat: null,
//   setActiveChat: () => {},
//   resetCards: () => {},
// });

// interface AuthorCardProviderProps {
//   children: ReactNode;
// }

// const AuthorCardProvider: React.FC<AuthorCardProviderProps> = ({ children }) => {
//   const [cardState, setCardState] = useState<Record<string, CardState>>({});
//   const [activeChat, setActiveChat] = useState<string | null>(null);

//   const resetCards = () => {
//     const resetState = Object.fromEntries(
//       Object.entries(cardState).map(([key, value]) => {
//         return [key, { ...value, isFlipped: false }];
//       })
//     );
//     setCardState(resetState);
//   };

//   return (
//     <CardStateContext.Provider value={{ cardState, setCardState, activeChat, setActiveChat, resetCards }}>
//       {children}
//     </CardStateContext.Provider>
//   );
// };

// const useResetCards = () => {
//   const { cardState, setCardState } = useContext(CardStateContext);

//   const resetCards = () => {
//     const resetState = Object.fromEntries(
//       Object.entries(cardState).map(([key, value]) => {
//         return [key, { ...value, isFlipped: false }];
//       })
//     );
//     setCardState(resetState);
//   };

//   return resetCards;
// };

// const useCardState = (id: string) => {
//   const { cardState, setCardState, activeChat, setActiveChat } = useContext(CardStateContext);
//   const defaultState = cardState[id] || { isFlipped: false, startStreaming: false, chatMode: false };
//   const state = { ...defaultState, ...cardState[id] };

//   const flipCard = () => {
//     setCardState((prevState) => {
//       const wasFlippedBefore = prevState[id]?.isFlipped;
//       const shouldStartStreaming = prevState[id]?.isFlipped == null;
  
//       return {
//         ...prevState,
//         [id]: {
//           ...prevState[id],
//           isFlipped: !prevState[id]?.isFlipped,
//           startStreaming: shouldStartStreaming ? true : prevState[id]?.startStreaming,
//         },
//       };
//     });
//   };
  

//   const startChat = () => {
//     console.log(id);
//     setActiveChat(id);
//     setCardState((prevState) => ({
//       ...prevState,
//       [id]: { ...prevState[id], chatMode: true },
//     }));
//   };

//   const stopChat = () => {
//     setActiveChat(null);
//     setCardState((prevState) => ({
//       ...prevState,
//       [id]: { ...prevState[id], chatMode: false },
//     }));
//   };

//   return {
//     cardState: state,
//     flipCard,
//     startChat,
//     stopChat,
//     activeChat,
//     setActiveChat,
//   };
// };

// export { AuthorCardProvider, useCardState, useResetCards };