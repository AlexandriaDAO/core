import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setPredictionResults } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { setMintableStates } from '@/apps/Modules/shared/state/content/contentDisplaySlice';
import { useContentValidation } from '@/apps/Modules/shared/services/contentValidation';
import { useAuth } from '@/apps/Modules/shared/hooks/useAuth';
import { useNftData } from '@/apps/Modules/shared/hooks/getNftData';
import ContentFetcher from './ContentFetcher';
import { ContentValidatorProps } from '../types';
import { NftDataResult } from '@/apps/Modules/shared/hooks/getNftData';

const ContentValidator: React.FC<ContentValidatorProps> = ({
  transactionId,
  contentUrl,
  contentType,
  imageObjectUrl,
}) => {
  const dispatch = useDispatch();
  const collection = useSelector((state: RootState) => state.library.collection);
  const nsfwModelLoaded = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);
  const { validateContent } = useContentValidation();
  const { checkAuthentication } = useAuth();
  const { getNftData } = useNftData();
  const [nftData, setNftData] = useState<NftDataResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNftData = async () => {
      setIsLoading(true);
      try {
        const data = await getNftData(transactionId);
        setNftData(data);
        
        if (data?.principal && (data.collection === 'icrc7_scion' || data.collection === 'icrc7')) {
          const isAuthenticated = await checkAuthentication();
          updateMintableState(isAuthenticated, data.principal);
        }
      } catch (error) {
        console.error('Error fetching NFT data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNftData();
  }, [transactionId]);

  const updateMintableState = (mintable: boolean, owner: string | null) => {
    dispatch(setMintableStates({
      [transactionId]: { mintable, owner }
    }));
  };

  const handleValidateContent = async (element: HTMLImageElement | HTMLVideoElement) => {
    if (isLoading) return;
    
    const isAuthenticated = await checkAuthentication();

    if (nftData?.principal && (nftData.collection === 'icrc7_scion' || nftData.collection === 'icrc7')) {
      updateMintableState(isAuthenticated, nftData.principal);
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