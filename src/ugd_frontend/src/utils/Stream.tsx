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