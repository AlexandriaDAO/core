import React, { useRef } from 'react';
import * as nsfwjs from 'nsfwjs';
import { useDispatch, useSelector } from 'react-redux';
import { setMintableState, setPredictionResults } from '../redux/arweaveSlice';
import { RootState } from '@/store';

// Load the model once and export it
let modelPromise: Promise<nsfwjs.NSFWJS> | null = null;

export const loadModel = () => {
  if (!modelPromise) {
    modelPromise = nsfwjs.load();
  }
  return modelPromise;
};

export const isModelLoaded = () => {
  return modelPromise !== null;
};

interface ContentValidatorProps {
  transactionId: string;
  contentUrl: string;
  contentType: string;
}

const ContentValidator: React.FC<ContentValidatorProps> = ({ transactionId, contentUrl, contentType }) => {
  const dispatch = useDispatch();
  const contentRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const nsfwModelLoaded = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);

  // Function to validate the content after it has loaded
  const validateContent = async () => {
    if (!contentRef.current) return;

    if (!nsfwModelLoaded) {
      dispatch(setMintableState({ id: transactionId, mintable: true }));
      return;
    }

    try {
      const model = await loadModel();
      const predictions = await model.classify(contentRef.current!);

      const predictionResults = predictions.reduce((acc, prediction) => {
        acc[prediction.className] = prediction.probability;
        return acc;
      }, {} as Record<string, number>);

      const isPorn = predictionResults['Porn'] > 0.7 || predictionResults['Hentai'] > 0.7;

      dispatch(setMintableState({ 
        id: transactionId, 
        mintable: !isPorn, 
        predictions: predictionResults 
      }));

      console.log(`Content Classification Results for Transaction ID: ${transactionId}`);
      console.log('----------------------------------------');
      console.log(`Drawing: ${(predictionResults['Drawing'] * 100).toFixed(2)}%`);
      console.log(`Hentai: ${(predictionResults['Hentai'] * 100).toFixed(2)}%`);
      console.log(`Neutral: ${(predictionResults['Neutral'] * 100).toFixed(2)}%`);
      console.log(`Porn: ${(predictionResults['Porn'] * 100).toFixed(2)}%`);
      console.log(`Sexy: ${(predictionResults['Sexy'] * 100).toFixed(2)}%`);
      console.log('----------------------------------------');
      console.log(`Content is ${isPorn ? 'NOT ' : ''}mintable`);
      console.log('----------------------------------------');

      dispatch(setMintableState({ id: transactionId, mintable: !isPorn }));
    } catch (error) {
      console.error('Error validating content:', error);
      dispatch(setMintableState({ id: transactionId, mintable: true }));
    }
  };

  const handleLoad = () => {
    console.log(`Content loaded for Transaction ID: ${transactionId}, URL: ${contentUrl}`);
    validateContent();
  };

  const handleError = () => {
    console.error(`Error loading content for transaction ID: ${transactionId}`);
    dispatch(setMintableState({ id: transactionId, mintable: false }));
  };

  return (
    <>
      {contentType.startsWith('image/') && (
        <img
          ref={contentRef as React.RefObject<HTMLImageElement>}
          src={contentUrl}
          alt="Content for validation"
          crossOrigin="anonymous"  // <-- Added crossOrigin attribute
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: 'none' }}
        />
      )}
      {contentType.startsWith('video/') && (
        <video
          ref={contentRef as React.RefObject<HTMLVideoElement>}
          src={contentUrl}
          crossOrigin="anonymous"  // <-- Added crossOrigin attribute
          onLoadedData={handleLoad}
          onError={handleError}
          style={{ display: 'none' }}
        />
      )}
    </>
  );
};

export default ContentValidator;