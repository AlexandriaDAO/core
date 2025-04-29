import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setPredictionResults, setNsfwModelLoaded } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { useContentValidation } from '@/apps/Modules/shared/services/contentValidation';
import { useNftData } from '@/apps/Modules/shared/hooks/getNftData';
import ContentFetcher from './ContentFetcher';
import { ContentValidatorProps } from './types';
import { NftDataResult } from '@/apps/Modules/shared/hooks/getNftData';
import { contentCache } from '@/apps/Modules/shared/services/contentCacheService';
import { debounce } from 'lodash';
import { nsfwService } from '@/apps/Modules/shared/services/nsfwService';

const ContentValidator: React.FC<ContentValidatorProps> = ({
  transactionId,
  contentUrl,
  contentType,
  imageObjectUrl,
}) => {
  const dispatch = useDispatch();
  const { validateContent } = useContentValidation();
  const { getNftData } = useNftData();
  const [nftData, setNftData] = useState<NftDataResult | null>(null);
  const [isLoadingNftData, setIsLoadingNftData] = useState(true);
  const isModelReady = useSelector((state: RootState) => state.arweave.nsfwModelLoaded);

  useEffect(() => {
    const fetchNftData = async () => {
      setIsLoadingNftData(true);
      try {
        const data = await getNftData(transactionId);
        setNftData(data);
      } catch (error) {
        console.error('Error fetching NFT data:', error);
      } finally {
        setIsLoadingNftData(false);
      }
    };
    fetchNftData();
  }, [transactionId, getNftData]);

  const runValidation = useCallback(
    debounce(async (element: HTMLImageElement | HTMLVideoElement, currentContentType: string) => {
      if (!isModelReady || nftData?.principal) {
        return;
      }

      try {
        const predictionResults = await validateContent(element, currentContentType);
        if (predictionResults) {
          dispatch(setPredictionResults({ 
            id: transactionId, 
            predictions: predictionResults 
          }));
        } else {
          console.warn(`Validation returned null for ${transactionId}`);
        }
      } catch (error) {
        console.error(`Error during validation for ${transactionId}:`, error);
      }
    }, 500),
    [isModelReady, transactionId, validateContent, nftData?.principal, dispatch]
  );

  const handleContentLoad = useCallback((element: HTMLImageElement | HTMLVideoElement, thumbnailUrl?: string) => {
    if (thumbnailUrl && contentType.startsWith('video/')) {
      contentCache.updateThumbnail(transactionId, thumbnailUrl);
    }

    if (isLoadingNftData || nftData?.principal) {
        return;
    }

    runValidation(element, contentType);

  }, [contentType, transactionId, isLoadingNftData, nftData?.principal, runValidation]);

  const handleError = useCallback(() => {
    console.error(`Error loading content for transaction ID: ${transactionId}`);
  }, [transactionId]);

  return (
    <ContentFetcher
      contentUrl={contentUrl}
      contentType={contentType}
      imageObjectUrl={imageObjectUrl}
      onLoad={handleContentLoad}
      onError={handleError}
    />
  );
};

export default ContentValidator;