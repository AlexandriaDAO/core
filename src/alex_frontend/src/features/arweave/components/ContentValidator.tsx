import React, { useEffect, useRef, useState } from 'react';
import * as nsfwjs from 'nsfwjs';
import { useDispatch, useSelector } from 'react-redux';
import { setMintableState } from '../redux/arweaveSlice';
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
  const [isValidating, setIsValidating] = useState(true);
  const contentRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const nsfwModelLoaded = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);

  useEffect(() => {
    let isMounted = true;

    const validateContent = async () => {
      if (!contentRef.current) return;

      if (!nsfwModelLoaded) {
        if (isMounted) {
          dispatch(setMintableState({ id: transactionId, mintable: true }));
          setIsValidating(false);
        }
        return;
      }

      try {
        const model = await loadModel(); // Use the cached model
        const predictions = await model.classify(contentRef.current);
        const pornPrediction = predictions.find(p => p.className === 'Porn');
        const isPorn = pornPrediction && pornPrediction.probability > 0.7;
        console.log("isPorn", isPorn);
        console.log("pornPrediction", pornPrediction);
        console.log("transactionId", transactionId);


        if (isMounted) {
          dispatch(setMintableState({ id: transactionId, mintable: !isPorn }));
          setIsValidating(false);
        }
      } catch (error) {
        console.error('Error validating content:', error);
        if (isMounted) {
          dispatch(setMintableState({ id: transactionId, mintable: true }));
          setIsValidating(false);
        }
      }
    };

    validateContent();

    return () => {
      isMounted = false;
    };
  }, [transactionId, contentUrl, contentType, dispatch, nsfwModelLoaded]);

  const handleLoad = () => {
    if (contentRef.current) {
      contentRef.current.style.opacity = '0';
      dispatch(setMintableState({ id: transactionId, mintable: true }));
    }
  };

  const handleError = () => {
    dispatch(setMintableState({ id: transactionId, mintable: false }));
    setIsValidating(false);
  };

  if (contentType.startsWith('image/')) {
    return (
      <img
        ref={contentRef as React.RefObject<HTMLImageElement>}
        src={contentUrl}
        alt="Content for validation"
        onLoad={handleLoad}
        onError={handleError}
        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0 }}
      />
    );
  } else if (contentType.startsWith('video/')) {
    return (
      <video
        ref={contentRef as React.RefObject<HTMLVideoElement>}
        src={contentUrl}
        onLoadedData={handleLoad}
        onError={handleError}
        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0 }}
      />
    );
  }

  return null;
};

export default ContentValidator;