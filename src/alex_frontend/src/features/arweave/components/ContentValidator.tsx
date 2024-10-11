import React, { useRef, useState, useEffect } from 'react';
import * as nsfwjs from 'nsfwjs';
import { useDispatch, useSelector } from 'react-redux';
import { setMintableState, PredictionResults } from '../redux/arweaveSlice';
import { RootState } from '@/store';
import * as tf from '@tensorflow/tfjs';

// Load the model once and export it
let modelPromise: Promise<nsfwjs.NSFWJS> | null = null;

export const loadModel = () => {
  if (!modelPromise) {
    modelPromise = nsfwjs.load("MobileNetV2Mid");
  }
  return modelPromise;
};

export const unloadModel = () => {
  if (modelPromise) {
    modelPromise.then(model => {
      // Clear the model reference
      modelPromise = null;
      // Note: NSFWJS doesn't have a built-in dispose method, so we're just clearing the reference
    });
  }
};

export const isModelLoaded = () => {
  return modelPromise !== null;
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
}

const ContentValidator: React.FC<ContentValidatorProps> = ({
  transactionId,
  contentUrl,
  contentType,
}) => {
  const dispatch = useDispatch();
  const contentRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const nsfwModelLoaded = useSelector(
    (state: RootState) => state.arweave.nsfwModelLoaded
  );
  const [isValidated, setIsValidated] = useState(false);

  const validateContent = async () => {
    if (!contentRef.current || isValidated) return;

    if (!nsfwModelLoaded) {
      dispatch(setMintableState({ id: transactionId, mintable: true }));
      return;
    }

    try {
      const model = await loadModel();
      if (!model) {
        console.error('NSFW model not loaded');
        dispatch(setMintableState({ id: transactionId, mintable: true }));
        return;
      }

      let tempCanvas: HTMLCanvasElement | null = null;
      let imgTensor: tf.Tensor3D | null = null;
      let predictions: nsfwjs.predictionType[];

      if (contentType.startsWith('image/')) {
        tempCanvas = resizeImage(contentRef.current as HTMLImageElement);
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          imgTensor = tf.browser.fromPixels(imgData);
        }
      } else if (contentType.startsWith('video/')) {
        // For videos, we'll classify the first frame
        tempCanvas = document.createElement('canvas');
        const video = contentRef.current as HTMLVideoElement;
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
          const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          imgTensor = tf.browser.fromPixels(imgData);
        }
      }

      if (imgTensor) {
        predictions = await model.classify(imgTensor);
        imgTensor.dispose(); // Dispose of the tensor after classification
      } else {
        console.error('Failed to create image tensor for classification');
        dispatch(setMintableState({ id: transactionId, mintable: true }));
        return;
      }

      // Dispose of the temporary canvas after use
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
        predictionResults.Hentai > 0.25;

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
      dispatch(setMintableState({ id: transactionId, mintable: true }));
    }
  };

  useEffect(() => {
    if (contentRef.current && !isValidated) {
      // Wait for the content to load before validating
      const handleLoad = () => {
        validateContent();
      };

      const currentContent = contentRef.current;

      currentContent.addEventListener('load', handleLoad);
      currentContent.addEventListener('loadedmetadata', handleLoad); // For videos

      return () => {
        currentContent.removeEventListener('load', handleLoad);
        currentContent.removeEventListener('loadedmetadata', handleLoad);
      };
    }
  }, [contentRef.current, isValidated]);

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
          crossOrigin="anonymous"
          onError={handleError}
          style={{ display: 'none' }}
        />
      )}
      {contentType.startsWith('video/') && (
        <video
          ref={contentRef as React.RefObject<HTMLVideoElement>}
          src={contentUrl}
          crossOrigin="anonymous"
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