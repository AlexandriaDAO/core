import React, { useEffect, useState, useCallback } from 'react';
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
import { contentCache } from '@/apps/Modules/shared/services/contentCacheService';
import { debounce } from 'lodash';

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
        
        if (data?.principal) {
          const isAuthenticated = await checkAuthentication();
          updateMintableState(isAuthenticated, data.principal);
          setIsLoading(false);
          return;
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

  const debouncedValidation = useCallback(
    debounce(async (element: HTMLImageElement | HTMLVideoElement, thumbnailUrl?: string) => {
      if (isLoading) return;
      
      try {
        if (nftData?.principal) {
          return;
        }

        const elementToValidate = (!contentType.startsWith('video/') && thumbnailUrl) 
          ? await createImageFromThumbnail(thumbnailUrl) 
          : element;
        
        const predictionResults = await validateContent(elementToValidate, contentType);
        if (predictionResults) {
          dispatch(setPredictionResults({ 
            id: transactionId, 
            predictions: predictionResults 
          }));

          const isAuthenticated = await checkAuthentication();
          updateMintableState(!predictionResults.isPorn && isAuthenticated, null);
        }
      } catch (error) {
        console.error('Error in validation:', error);
        updateMintableState(false, null);
      }
    }, 300),
    [contentType, isLoading, transactionId, validateContent, checkAuthentication, nftData]
  );

  const handleValidateContent = async (element: HTMLImageElement | HTMLVideoElement, thumbnailUrl?: string) => {
    if (thumbnailUrl && contentType.startsWith('video/')) {
      contentCache.updateThumbnail(transactionId, thumbnailUrl);
    }

    if (nftData?.principal) {
      const isAuthenticated = await checkAuthentication();
      updateMintableState(isAuthenticated, nftData.principal);
      return;
    }

    if (!nsfwModelLoaded) {
      updateMintableState(false, null);
      return;
    }

    await debouncedValidation(element, thumbnailUrl);
  };

  const handleError = () => {
    console.error(`Error loading content for transaction ID: ${transactionId}`);
    updateMintableState(false, null);
  };

  const createImageFromThumbnail = (thumbnailUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = thumbnailUrl;
      img.crossOrigin = "anonymous";
    });
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