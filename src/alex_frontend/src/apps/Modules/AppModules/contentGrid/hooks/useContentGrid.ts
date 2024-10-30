import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { RootState } from "@/store";
import { setMintableStates, setMintableState } from "@/apps/Modules/shared/state/arweave/arweaveSlice";
import type { CachedContent, ContentUrlInfo } from '@/apps/Modules/LibModules/contentDisplay/types';

export function useContentGrid(transactions: Transaction[]) {
  const dispatch = useDispatch();
  const [contentData, setContentData] = useState<Record<string, CachedContent>>({});
  const [contentUrls, setContentUrls] = useState<Record<string, ContentUrlInfo>>({});
  const mintableState = useSelector((state: RootState) => state.arweave.mintableState);

  useEffect(() => {
    // Import ContentService directly from LibModules
    import('@/apps/Modules/LibModules/contentDisplay/services/contentService').then(
      ({ ContentService }) => {
        const initialStates = ContentService.getInitialMintableStates(transactions);
        dispatch(setMintableStates(initialStates));

        transactions.forEach(async (transaction) => {
          try {
            const content = await ContentService.loadContent(transaction);
            setContentData(prev => ({ ...prev, [transaction.id]: content }));
            
            const urls = await ContentService.getContentUrls(transaction, content);
            setContentUrls(prev => ({ ...prev, [transaction.id]: urls }));

            if (content.error) {
              dispatch(setMintableState({ id: transaction.id, mintable: false }));
            }
          } catch (error) {
            console.error('Error loading content:', error);
          }
        });

        return () => {
          ContentService.clearCache();
        };
      }
    );
  }, [transactions, dispatch]);

  const handleRenderError = (transactionId: string) => {
    import('@/apps/Modules/LibModules/contentDisplay/services/contentService').then(
      ({ ContentService }) => {
        ContentService.clearTransaction(transactionId);
        dispatch(setMintableState({ id: transactionId, mintable: false }));
      }
    );
  };

  return {
    contentData,
    contentUrls,
    mintableState,
    handleRenderError
  };
} 