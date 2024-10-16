import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMintableState, PredictionResults } from '../redux/arweaveSlice';
import { RootState } from '@/store';
import ContentFetcher from './ContentFetcher';
import type { NSFWJS, PredictionType } from 'nsfwjs';

// Add these type definitions at the top of the file
type Tensor3D = import('@tensorflow/tfjs').Tensor3D;

let nsfwModel: NSFWJS | null = null;

export const loadModel = async () => {
  if (!nsfwModel) {
    // Dynamically import only NSFWJS here
    const nsfwjs = await import('nsfwjs');
    nsfwModel = await nsfwjs.load('/models/mobilenet_v2_mid/model.json', { type: 'graph' });
    return nsfwModel;
  }
};

export const unloadModel = () => {
  if (nsfwModel) {
    nsfwModel = null;
  }
};

export const isModelLoaded = () => {
  return nsfwModel !== null;
};

const MAX_IMAGE_SIZE = 2048; // Maximum size for any dimension

const disposeCanvas = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  canvas.width = 0;
  canvas.height = 0;
};

const resizeImage = (img: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

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
  if (ctx) {
    ctx.drawImage(img, 0, 0, width, height);
  }
  return canvas;
};

interface ContentValidatorProps {
  transactionId: string;
  contentUrl: string;
  contentType: string;
  imageObjectUrl: string | null;
}

const ContentValidator: React.FC<ContentValidatorProps> = ({
  transactionId,
  contentUrl,
  contentType,
  imageObjectUrl,
}) => {
  const dispatch = useDispatch();
  const nsfwModelLoaded = useSelector(
    (state: RootState) => state.arweave.nsfwModelLoaded
  );
  const [isValidated, setIsValidated] = useState(false);

  const validateContent = async (element: HTMLImageElement | HTMLVideoElement) => {
    if (isValidated) return;

    if (!nsfwModelLoaded) {
      dispatch(setMintableState({ id: transactionId, mintable: false }));
      return;
    }

    try {
      // Dynamically import TensorFlow and NSFWJS
      const [tf, nsfwjs] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('nsfwjs')
      ]);

      if (!nsfwModel) {
        nsfwModel = await nsfwjs.load('/models/mobilenet_v2_mid/model.json', { type: 'graph' });
      }

      if (!nsfwModel) {
        console.error('NSFW model not loaded');
        dispatch(setMintableState({ id: transactionId, mintable: false }));
        return;
      }

      let tempCanvas: HTMLCanvasElement | null = null;
      let imgTensor: Tensor3D | null = null;
      let predictions: PredictionType[];

      if (contentType.startsWith('image/')) {
        tempCanvas = resizeImage(element as HTMLImageElement);
      } else if (contentType.startsWith('video/')) {
        tempCanvas = document.createElement('canvas');
        const video = element as HTMLVideoElement;
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        }
      }

      if (tempCanvas) {
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          imgTensor = tf.browser.fromPixels(imgData) as Tensor3D;  // Use type assertion here
        }
      }

      if (imgTensor) {
        predictions = await nsfwModel.classify(imgTensor);
        imgTensor.dispose();
      } else {
        console.error('Failed to create image tensor for classification');
        dispatch(setMintableState({ id: transactionId, mintable: false }));
        return;
      }

      if (tempCanvas) {
        disposeCanvas(tempCanvas);
      }

      const predictionResults: PredictionResults = {
        Drawing: 0,
        Hentai: 0,
        Neutral: 0,
        Porn: 0,
        Sexy: 0,
        isPorn: false,
      };

      predictions.forEach((prediction) => {
        predictionResults[
          prediction.className as keyof Omit<PredictionResults, 'isPorn'>
        ] = prediction.probability;
      });

      // Conditions for determining inappropriate content
      const isPorn =
        predictionResults.Porn > 0.5 ||
        (predictionResults.Sexy > 0.2 && predictionResults.Porn > 0.2) ||
        predictionResults.Hentai > 0.1 ||
        predictionResults.Sexy > 0.6;

      predictionResults.isPorn = isPorn;

      // Update the mintable state with predictions
      dispatch(
        setMintableState({
          id: transactionId,
          mintable: !isPorn,
          predictions: predictionResults,
        })
      );

      setIsValidated(true);
    } catch (error) {
      console.error('Error validating content:', error);
      dispatch(setMintableState({ id: transactionId, mintable: false }));
    }
  };

  const handleError = () => {
    console.error(`Error loading content for transaction ID: ${transactionId}`);
    dispatch(setMintableState({ id: transactionId, mintable: false }));
  };

  return (
    <ContentFetcher
      contentUrl={contentUrl}
      contentType={contentType}
      imageObjectUrl={imageObjectUrl}
      onLoad={validateContent}
      onError={handleError}
    />
  );
};

export default ContentValidator;
