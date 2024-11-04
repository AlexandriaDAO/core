import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setPredictionResults } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { setMintableStates } from '@/apps/Modules/shared/state/content/contentDisplaySlice';
import { useContentValidation } from '@/apps/Modules/shared/services/contentValidation';
import ContentFetcher from './ContentFetcher';
import { ContentValidatorProps } from '../types';


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
  const { validateContent } = useContentValidation();

  const handleValidateContent = async (element: HTMLImageElement | HTMLVideoElement) => {
    if (isValidated) return;

    if (!nsfwModelLoaded) {
      dispatch(setMintableStates({ [transactionId]: { mintable: false } }));
      return;
    }

    try {
      const predictionResults = await validateContent(element, contentType);
      
      if (predictionResults) {
        dispatch(setPredictionResults({ 
          id: transactionId, 
          predictions: predictionResults 
        }));

        dispatch(
          setMintableStates({
            [transactionId]: {
              mintable: !predictionResults.isPorn,
            }
          })
        );
      } else {
        dispatch(setMintableStates({ [transactionId]: { mintable: false } }));
      }

      setIsValidated(true);
    } catch (error) {
      console.error('Error validating content:', error);
      dispatch(setMintableStates({ [transactionId]: { mintable: false } }));
    }
  };

  const handleError = () => {
    console.error(`Error loading content for transaction ID: ${transactionId}`);
    dispatch(setMintableStates({ [transactionId]: { mintable: false } }));
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
