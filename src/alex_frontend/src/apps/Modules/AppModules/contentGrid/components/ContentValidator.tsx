import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setPredictionResults } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { setMintableStates } from '@/apps/Modules/shared/state/content/contentDisplaySlice';
import { useContentValidation } from '@/apps/Modules/shared/services/contentValidation';
import { useAuth } from '@/apps/Modules/shared/hooks/useAuth';
import { getNftOwner } from '@/apps/Modules/shared/hooks/getNftOwner';
import ContentFetcher from './ContentFetcher';
import { ContentValidatorProps } from '../types';

const ContentValidator: React.FC<ContentValidatorProps> = ({
  transactionId,
  contentUrl,
  contentType,
  imageObjectUrl,
}) => {
  const dispatch = useDispatch();
  const collection = 'icrc7';
  const nsfwModelLoaded = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);
  const { validateContent } = useContentValidation();
  const { checkAuthentication } = useAuth();
  const { checkOwnership } = getNftOwner();

  const updateMintableState = (mintable: boolean, owner: string | null) => {
    dispatch(setMintableStates({ 
      [transactionId]: { mintable, owner } 
    }));
  };

  const handleValidateContent = async (element: HTMLImageElement | HTMLVideoElement) => {
    const owner = await checkOwnership(transactionId, collection);
    const isAuthenticated = await checkAuthentication();

    if (owner) {
      updateMintableState(isAuthenticated, owner);
      return;
    }

    if (!nsfwModelLoaded) {
      console.log('nsfwModelLoaded', nsfwModelLoaded);
      updateMintableState(false, null);
      return;
    }

    try {
      const predictionResults = await validateContent(element, contentType);
      if (predictionResults) {
        dispatch(setPredictionResults({ 
          id: transactionId, 
          predictions: predictionResults 
        }));

        updateMintableState(!predictionResults.isPorn && isAuthenticated, null);
      } else {
        updateMintableState(false, null);
      }
    } catch (error) {
      console.error('Error validating content:', error);
      updateMintableState(false, null);
    }
  };

  const handleError = () => {
    console.error(`Error loading content for transaction ID: ${transactionId}`);
    updateMintableState(false, null);
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