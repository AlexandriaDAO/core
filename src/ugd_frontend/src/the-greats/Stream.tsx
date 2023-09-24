import React, { useEffect, useState, useRef } from "react";

const useStreamingText = (text: string, speed: number, startStreaming: boolean) => {
  const [streamedText, setStreamedText] = useState("");
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear all previous timeouts when text changes or component unmounts
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    setStreamedText("");

    if (startStreaming) {
      text.split('').forEach((char, index) => {
        const timeoutId = setTimeout(() => {
          setStreamedText((prev) => prev + char);
        }, speed * index);

        timeoutRefs.current.push(timeoutId);
      });
    }
    
    // Cleanup function
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, [text, speed, startStreaming]);

  return streamedText;
};

export default useStreamingText;




// // Version that's different and untested, but suppossed to stop the streaming: 

// import React, { useEffect, useState, useRef } from "react";

// const useStreamingText = (
//   text: string, 
//   speed: number, 
//   startStreaming: boolean,
//   setDoneStreaming: () => void
// ) => {
//   const [streamedText, setStreamedText] = useState("");
//   const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

//   useEffect(() => {
//     timeoutRefs.current.forEach(clearTimeout);
//     timeoutRefs.current = [];

//     setStreamedText("");

//     if (startStreaming) {
//       text.split('').forEach((char, index) => {
//         const timeoutId = setTimeout(() => {
//           setStreamedText((prev) => prev + char);

//           if (index === text.length - 1) {
//             setDoneStreaming();
//           }
//         }, speed * index);

//         timeoutRefs.current.push(timeoutId);
//       });
//     }

//     return () => {
//       timeoutRefs.current.forEach(clearTimeout);
//     };
//   }, [text, speed, startStreaming, setDoneStreaming]);

//   return streamedText;
// };

// export default useStreamingText;
