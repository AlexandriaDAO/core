import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setPredictionResults } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { setMintableStates } from '@/apps/Modules/shared/state/content/contentDisplaySlice';
import { useContentValidation } from '@/apps/Modules/shared/services/contentValidation';
import ContentFetcher from './ContentFetcher';
import { ContentValidatorProps } from '../types';
import { icrc7 } from '../../../../../../../declarations/icrc7';
import { arweaveIdToNat } from "@/utils/id_convert";
import { getAuthClient } from '@/features/auth/utils/authUtils';

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
  const { validateContent } = useContentValidation();

  const handleValidateContent = async (element: HTMLImageElement | HTMLVideoElement) => {
    const tokenIds = [BigInt(arweaveIdToNat(transactionId))];
    
    let owner = null;
    try {
      const ownerPrincipals = await icrc7.icrc7_owner_of(tokenIds);
      owner = ownerPrincipals[0]?.[0]?.owner?.toString() || null;
    } catch (error) {
      console.error("Error fetching owner:", error);
      owner = null;
    }
    
    // If there's an owner, check authentication before setting mintable state
    if (owner) {
      const client = await getAuthClient();
      const isAuthenticated = await client.isAuthenticated();
      
      dispatch(setMintableStates({ 
        [transactionId]: { 
          mintable: isAuthenticated, 
          owner 
        } 
      }));
      return;
    }
    
    // If no owner, we need to validate the content
    // If no NSFW model, mark as not mintable
    if (!nsfwModelLoaded) {
      dispatch(setMintableStates({ [transactionId]: { mintable: false, owner: null } }));
      return;
    }

    // Validate unminted content
    try {
      const client = await getAuthClient();
      const isAuthenticated = await client.isAuthenticated();
      const predictionResults = await validateContent(element, contentType);
      
      if (predictionResults) {
        dispatch(setPredictionResults({ 
          id: transactionId, 
          predictions: predictionResults 
        }));

        dispatch(
          setMintableStates({
            [transactionId]: {
              mintable: !predictionResults.isPorn && isAuthenticated,
              owner: null
            }
          })
        );
      } else {
        dispatch(setMintableStates({ [transactionId]: { mintable: false, owner: null } }));
      }

    } catch (error) {
      console.error('Error validating content:', error);
      dispatch(setMintableStates({ [transactionId]: { mintable: false, owner: null } }));
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