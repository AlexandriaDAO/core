import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CachedContent } from '../types';
import { ContentService } from "./contentService";

import { RootState } from "@/store";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { setMintableStates, setMintableState } from "@/apps/Modules/shared/state/arweave/arweaveSlice";

export function useContent(transactions: Transaction[]) {
  const dispatch = useDispatch();
  const [contentData, setContentData] = useState<Record<string, CachedContent>>({});
  const mintableState = useSelector((state: RootState) => state.arweave.mintableState);
  const [errors, setErrors] = useState<Record<string, Error>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialStates = ContentService.getInitialMintableStates(transactions);
    dispatch(setMintableStates(initialStates));
  }, [transactions, dispatch]);

  const loadContent = useCallback(async (transaction: Transaction) => {
    const txId = transaction.id;
    setLoading(prev => ({ ...prev, [txId]: true }));
    
    try {
      const content = await ContentService.loadContent(transaction);
      setContentData(prev => ({ ...prev, [txId]: content }));
      
      if (content.error) {
        dispatch(setMintableState({ id: txId, mintable: false }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [txId]: error as Error }));
    } finally {
      setLoading(prev => ({ ...prev, [txId]: false }));
    }
  }, [dispatch]);

  useEffect(() => {
    transactions.forEach(loadContent);
    return () => {
      ContentService.clearCache();
    };
  }, [transactions, loadContent]);

  const handleRenderError = useCallback((transactionId: string) => {
    ContentService.clearTransaction(transactionId);
    dispatch(setMintableState({ id: transactionId, mintable: false }));
  }, [dispatch]);

  return { 
    contentData, 
    mintableState, 
    handleRenderError,
    loading,
    errors
  };
}
