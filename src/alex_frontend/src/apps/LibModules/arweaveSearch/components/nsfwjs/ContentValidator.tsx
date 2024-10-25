import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMintableState } from '../../redux/arweaveSlice';
import { RootState } from '@/store';
import ContentFetcher from '../../../../AppModules/search/ContentFetcher';
import { loadModel, unloadModel, isModelLoaded, validateContent, PredictionResults } from './tensorflow';

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

  const handleValidateContent = async (element: HTMLImageElement | HTMLVideoElement) => {
    if (isValidated) return;

    if (!nsfwModelLoaded) {
      dispatch(setMintableState({ id: transactionId, mintable: false }));
      return;
    }

    try {
      if (!isModelLoaded()) {
        await loadModel();
      }

      const predictionResults = await validateContent(element, contentType);

      if (predictionResults) {
        dispatch(
          setMintableState({
            id: transactionId,
            mintable: !predictionResults.isPorn,
            predictions: predictionResults,
          })
        );
      } else {
        dispatch(setMintableState({ id: transactionId, mintable: false }));
      }

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
      onLoad={handleValidateContent}
      onError={handleError}
    />
  );
};

export default ContentValidator;
