import { useState, useCallback } from 'react';
import { Transaction } from '../types/queries';

interface UseArweaveSearchProps {
  mode: 'user' | 'general';
  userTransactionIds?: string[];
}

export function useArweaveSearch({ mode, userTransactionIds }: UseArweaveSearchProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedContent, setSelectedContent] = useState<{ id: string; type: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastTimestamp, setLastTimestamp] = useState<number>(0);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [amount, setAmount] = useState<number>(12);
  const [ownerFilter, setOwnerFilter] = useState<string>('');
  const [minBlock, setMinBlock] = useState<number | undefined>();
  const [maxBlock, setMaxBlock] = useState<number | undefined>();

  const handleSelectContent = useCallback((id: string, type: string) => {
    setSelectedContent({ id, type });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedContent(null);
  }, []);

  const handleTransactionsUpdate = useCallback((newTransactions: Transaction[], newLastTimestamp: number) => {
    setTransactions(prevTransactions => [...prevTransactions, ...newTransactions]);
    setLastTimestamp(newLastTimestamp);
  }, []);

  const handleInitialSearch = useCallback((
    newTransactions: Transaction[],
    timestamp: number,
    newContentTypes: string[],
    newAmount: number,
    newOwnerFilter: string,
    newMinBlock?: number,
    newMaxBlock?: number
  ) => {
    setTransactions(newTransactions);
    setLastTimestamp(timestamp);
    setContentTypes(newContentTypes);
    setAmount(newAmount);
    setOwnerFilter(newOwnerFilter);
    setMinBlock(newMinBlock);
    setMaxBlock(newMaxBlock);
  }, []);

  return {
    transactions,
    selectedContent,
    isModalOpen,
    isLoading,
    lastTimestamp,
    contentTypes,
    amount,
    ownerFilter,
    minBlock,
    maxBlock,
    handleSelectContent,
    closeModal,
    handleTransactionsUpdate,
    handleInitialSearch,
    setIsLoading,
  };
}