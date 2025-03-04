import React, { useEffect, useState, useCallback } from 'react';
import { getTensorFlow, isTensorFlowLoaded, hasAttemptedTensorFlowLoad } from '../services/tensorflowLoader';

interface TensorFlowPreloaderProps {
  onLoaded?: () => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number; // Delay between retries in ms
}

/**
 * A component that preloads TensorFlow in the background.
 * This can be used in routes that need TensorFlow to be available.
 */
export const TensorFlowPreloader: React.FC<TensorFlowPreloaderProps> = ({ 
  onLoaded, 
  onError,
  maxRetries = 3, // Default to 3 retries
  retryDelay = 1000 // Default to 1 second delay
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  const preloadTensorFlow = useCallback(async () => {
    // If TensorFlow is already loaded, just call onLoaded
    if (isTensorFlowLoaded()) {
      console.log('TensorFlow already loaded, calling onLoaded');
      if (onLoaded) onLoaded();
      return;
    }
    
    // If we've already tried and failed, and exceeded retries, don't try again
    if (hasError && retryCount >= maxRetries) {
      console.log('Max retries exceeded, not trying again');
      return;
    }
    
    // If we're already loading, don't start another load
    if (isLoading) {
      console.log('Already loading TensorFlow, not starting another load');
      return;
    }
    
    console.log(`Attempting to load TensorFlow (attempt ${retryCount + 1}/${maxRetries + 1})`);
    setIsLoading(true);
    
    try {
      await getTensorFlow();
      console.log('TensorFlow loaded successfully');
      setIsLoading(false);
      setHasError(false);
      if (onLoaded) onLoaded();
    } catch (error) {
      console.error(`Failed to load TensorFlow (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
      setIsLoading(false);
      setHasError(true);
      
      // If we haven't exceeded max retries, schedule another attempt
      if (retryCount < maxRetries) {
        console.log(`Scheduling retry ${retryCount + 2} in ${retryDelay}ms`);
        setRetryCount(prev => prev + 1);
        // We'll retry after a delay
        setTimeout(() => {
          console.log(`Executing scheduled retry ${retryCount + 2}`);
          preloadTensorFlow();
        }, retryDelay);
      } else if (onError) {
        // Only call onError after all retries have failed
        console.log('All retries failed, calling onError');
        onError(error as Error);
      }
    }
  }, [isLoading, onLoaded, onError, retryCount, maxRetries, hasError, retryDelay]);

  useEffect(() => {
    // Only start loading if we haven't already tried or if this is a retry
    if (!hasAttemptedTensorFlowLoad() || (hasError && retryCount > 0)) {
      preloadTensorFlow();
    } else if (isTensorFlowLoaded() && onLoaded) {
      // If TensorFlow is already loaded, just call onLoaded
      onLoaded();
    }
    
    // No cleanup needed
  }, [preloadTensorFlow, onLoaded, hasError, retryCount]);

  // This component doesn't render anything
  return null;
};

export default TensorFlowPreloader; 