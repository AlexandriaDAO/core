import React, { useRef, useState } from 'react';
import * as nsfwjs from 'nsfwjs';
import { useDispatch, useSelector } from 'react-redux';
import { setMintableState, setPredictionResults, PredictionResults } from '../redux/arweaveSlice';
import { RootState } from '@/store';

// Load the model once and export it
let modelPromise: Promise<nsfwjs.NSFWJS> | null = null;

export const loadModel = () => {
  if (!modelPromise) {
    modelPromise = nsfwjs.load("MobileNetV2Mid");
  }
  return modelPromise;
};

export const isModelLoaded = () => {
  return modelPromise !== null;
};

const MAX_IMAGE_SIZE = 2048; // Maximum size for any dimension

const resizeImage = (img: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > MAX_IMAGE_SIZE) {
      height *= MAX_IMAGE_SIZE / width;
      width = MAX_IMAGE_SIZE;
    }
  } else {
    if (height > MAX_IMAGE_SIZE) {
      width *= MAX_IMAGE_SIZE / height;
      height = MAX_IMAGE_SIZE;
    }
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx!.drawImage(img, 0, 0, width, height);
  return canvas;
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
  const [isValidated, setIsValidated] = useState(false);

  // Function to validate the content after it has loaded
  const validateContent = async () => {
    if (!contentRef.current || isValidated) return;

    if (!nsfwModelLoaded) {
      dispatch(setMintableState({ id: transactionId, mintable: true }));
      return;
    }

    try {
      const model = await loadModel();
      let classificationTarget: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement = contentRef.current;

      if (contentType.startsWith('image/')) {
        classificationTarget = resizeImage(contentRef.current as HTMLImageElement);
      } else if (contentType.startsWith('video/')) {
        // For videos, we'll just classify the first frame
        const video = contentRef.current as HTMLVideoElement;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
        classificationTarget = canvas;
      }

      const predictions = await model.classify(classificationTarget);

      const predictionResults: PredictionResults = {
        Drawing: 0,
        Hentai: 0,
        Neutral: 0,
        Porn: 0,
        Sexy: 0,
        isPorn: false
      };
      
      predictions.forEach(prediction => {
        predictionResults[prediction.className as keyof Omit<PredictionResults, 'isPorn'>] = prediction.probability;
      });

      const isPorn = predictionResults.Porn > 0.7 || predictionResults.Hentai > 0.7;
      predictionResults.isPorn = isPorn;

      // Update the mintable state with all predictions for image and video content
      if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
        dispatch(setMintableState({ 
          id: transactionId, 
          mintable: !isPorn, 
          predictions: predictionResults
        }));
      } else {
        dispatch(setMintableState({ 
          id: transactionId, 
          mintable: !isPorn
        }));
      }

      setIsValidated(true);
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
          onLoadedMetadata={handleLoad}
          onError={handleError}
          style={{ display: 'none' }}
        >
          <source src={contentUrl} type={contentType} />
        </video>
      )}
    </>
  );
};

export default ContentValidator;