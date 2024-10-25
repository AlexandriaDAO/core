import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Transaction } from "../arweave/types/queries";
import { RootState } from "@/store";
import { setMintableStates, setMintableState, MintableStateItem } from "../arweave/redux/arweaveSlice";
import { loadModel, isModelLoaded } from '../arweave/components/nsfwjs/tensorflow';
import { setNsfwModelLoaded } from "../arweave/redux/arweaveSlice";
import { fileTypeCategories } from '../arweave/types/files';
import { contentCache, CachedContent } from './services/contentCacheService';

export function useContent(transactions: Transaction[]) {
  const dispatch = useDispatch();
  const [contentData, setContentData] = useState<Record<string, CachedContent>>({});
  const mintableState = useSelector((state: RootState) => state.arweave.mintableState);

  // Initialize mintable states
  useEffect(() => {
    const initialStates = transactions.reduce((acc, transaction) => {
      const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "image/jpeg";
      const requiresValidation = [...fileTypeCategories.images, ...fileTypeCategories.video].includes(contentType);
      acc[transaction.id] = { mintable: !requiresValidation };
      return acc;
    }, {} as Record<string, MintableStateItem>); // Add type here
    dispatch(setMintableStates(initialStates));
  }, [transactions, dispatch]);

  // Load content using cache service
  const loadContent = useCallback(async (transaction: Transaction) => {
    try {
      const content = await contentCache.loadContent(transaction);
      setContentData(prev => ({ ...prev, [transaction.id]: content }));
      if (content.error) {
        dispatch(setMintableState({ id: transaction.id, mintable: false }));
      }
    } catch (error) {
      console.error(`Error loading content for ${transaction.id}:`, error);
    }
  }, [dispatch]);

  useEffect(() => {
    transactions.forEach(loadContent);
    
    // Cleanup on unmount
    return () => {
      contentCache.clearCache();
    };
  }, [transactions, loadContent]);

  // Load NSFW model
  useEffect(() => {
    if (!isModelLoaded()) {
      loadModel()
        .then(() => dispatch(setNsfwModelLoaded(true)))
        .catch(error => {
          console.error("Failed to load NSFW model:", error);
          dispatch(setNsfwModelLoaded(false));
        });
    }
  }, [dispatch]);

  const handleRenderError = useCallback((transactionId: string) => {
    contentCache.clearTransaction(transactionId);
    dispatch(setMintableState({ id: transactionId, mintable: false }));
  }, [dispatch]);

  return { contentData, mintableState, handleRenderError };
}
