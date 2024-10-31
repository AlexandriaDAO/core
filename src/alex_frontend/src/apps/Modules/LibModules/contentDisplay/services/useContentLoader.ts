import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/store";
import { 
  setMintableStates, 
  setMintableState,
  setContentData,
  clearTransactionContent 
} from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import { ContentService } from './contentService';

export function useContentLoader() {
  const dispatch = useDispatch();
  const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
  const contentData = useSelector((state: RootState) => state.contentDisplay.contentData);
  const mintableState = useSelector((state: RootState) => state.contentDisplay.mintableState);

  useEffect(() => {
    const initialStates = ContentService.getInitialMintableStates(transactions);
    dispatch(setMintableStates(initialStates));

    transactions.forEach(async (transaction) => {
      try {
        const content = await ContentService.loadContent(transaction);
        dispatch(setContentData({ id: transaction.id, content }));
        
        const urls = await ContentService.getContentUrls(transaction, content);
        dispatch(setContentData({ id: transaction.id, content: { ...content, urls } }));

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
  }, [transactions, dispatch]);

  const handleRenderError = (transactionId: string) => {
    ContentService.clearTransaction(transactionId);
    dispatch(clearTransactionContent(transactionId));
    dispatch(setMintableState({ id: transactionId, mintable: false }));
  };

  return {
    contentData,
    mintableState,
    handleRenderError
  };
} 