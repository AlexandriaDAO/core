import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setPredictionResults } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { useContentValidation } from '@/apps/Modules/shared/services/contentValidation';
import { useAuth } from '@/apps/Modules/shared/hooks/useAuth';
import { useNftData } from '@/apps/Modules/shared/hooks/getNftData';
import ContentFetcher from './ContentFetcher';
import { ContentValidatorProps } from './types';
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
  const nsfwModelLoaded = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);
  const { validateContent } = useContentValidation();
  const { getNftData } = useNftData();
  const [nftData, setNftData] = useState<NftDataResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle NFT data fetching
  useEffect(() => {
    const fetchNftData = async () => {
      setIsLoading(true);
      try {
        const data = await getNftData(transactionId);
        setNftData(data);
      } catch (error) {
        console.error('Error fetching NFT data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNftData();
  }, [transactionId, getNftData]);

  const validateNewContent = useCallback(
    debounce(async (element: HTMLImageElement | HTMLVideoElement, thumbnailUrl?: string) => {
      if (isLoading || nftData?.principal || !nsfwModelLoaded) {
        return;
      }

      try {
        const elementToValidate = (!contentType.startsWith('video/') && thumbnailUrl) 
          ? await createImageFromThumbnail(thumbnailUrl) 
          : element;
        
        const predictionResults = await validateContent(elementToValidate, contentType);
        if (predictionResults) {
          dispatch(setPredictionResults({ 
            id: transactionId, 
            predictions: predictionResults 
          }));
        }
      } catch (error) {
        console.error('Error in validation:', error);
      }
    }, 300),
    [contentType, isLoading, nsfwModelLoaded, transactionId, validateContent, nftData, dispatch]
  );

  const handleValidateContent = async (element: HTMLImageElement | HTMLVideoElement, thumbnailUrl?: string) => {
    if (thumbnailUrl && contentType.startsWith('video/')) {
      contentCache.updateThumbnail(transactionId, thumbnailUrl);
    }

    // Skip validation for NFTs
    if (nftData?.principal) {
      return;
    }

    // For new content, proceed with NSFW validation
    await validateNewContent(element, thumbnailUrl);
  };

  const handleError = () => {
    console.error(`Error loading content for transaction ID: ${transactionId}`);
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