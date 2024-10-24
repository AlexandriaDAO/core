import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Transaction } from "../arweave/types/queries";
import { RootState } from "@/store";
import { setMintableStates, setMintableState, MintableStateItem } from "../arweave/redux/arweaveSlice";
import { getArweaveUrl } from '../arweave/config/arweaveConfig';
import { loadModel, isModelLoaded } from '@/apps/AppModules/arweave/components/nsfwjs/tensorflow';
import { setNsfwModelLoaded } from "../arweave/redux/arweaveSlice";
import { fileTypeCategories } from '../arweave/types/files';

type ContentDataItem = {
  url: string | null;
  textContent: string | null;
  imageObjectUrl: string | null;
  error: string | null;
};

export function useContent(transactions: Transaction[]) {
  const dispatch = useDispatch();
  const [contentData, setContentData] = useState<Record<string, ContentDataItem>>({});
  const mintableState = useSelector((state: RootState) => state.arweave.mintableState);

  const initialMintableStates = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "image/jpeg";
      const requiresValidation = [...fileTypeCategories.images, ...fileTypeCategories.video].includes(contentType);
      acc[transaction.id] = { mintable: !requiresValidation };
      return acc;
    }, {} as Record<string, MintableStateItem>);
  }, [transactions]);

  useEffect(() => {
    dispatch(setMintableStates(initialMintableStates));
  }, [dispatch, initialMintableStates]);

  const loadContent = useCallback(async (transaction: Transaction) => {
    const txId = transaction.id;
    const existingContent = contentData[txId];

    // Check if content is already loaded
    if (existingContent && (existingContent.url || existingContent.imageObjectUrl || existingContent.textContent)) {
      return;
    }

    try {
      const contentType = transaction.tags.find((tag) => tag.name === 'Content-Type')?.value || 'image/jpeg';
      const url = getArweaveUrl(txId);

      let newContentData: ContentDataItem;

      if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        newContentData = {
          url,
          textContent: null,
          imageObjectUrl: objectUrl,
          error: null,
        };
      } else if (['text/plain', 'text/markdown', 'application/json', 'text/html'].includes(contentType)) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const textContent = await response.text();
        newContentData = {
          url,
          textContent,
          imageObjectUrl: null,
          error: null,
        };
      } else {
        newContentData = {
          url,
          textContent: null,
          imageObjectUrl: null,
          error: null,
        };
      }

      setContentData(prev => ({ ...prev, [txId]: newContentData }));
    } catch (error) {
      console.warn(`Error loading content for ${transaction.id}:`, error);
      setContentData(prev => ({
        ...prev,
        [txId]: {
          url: null,
          textContent: null,
          imageObjectUrl: null,
          error: 'Failed to load content. Please try again later.',
        }
      }));
      dispatch(setMintableState({ id: transaction.id, mintable: false }));
    }
  }, [dispatch, contentData]);

  useEffect(() => {
    transactions.forEach(loadContent);
    
    return () => {
      // Clean up object URLs
      Object.values(contentData).forEach(data => {
        if (data.imageObjectUrl) {
          URL.revokeObjectURL(data.imageObjectUrl);
        }
      });
    };
  }, [transactions, loadContent]);

  useEffect(() => {
    if (!isModelLoaded()) {
      loadModel().then(() => {
        dispatch(setNsfwModelLoaded(true));
      }).catch(error => {
        console.error("Failed to load NSFW model:", error);
        dispatch(setNsfwModelLoaded(false));
      });
    }
  }, [dispatch]);

  const handleRenderError = useCallback((transactionId: string) => {
    setContentData(prev => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        error: "Failed to render content."
      }
    }));
    dispatch(setMintableState({ id: transactionId, mintable: false }));
  }, [dispatch]);

  return { contentData, mintableState, handleRenderError };
}
