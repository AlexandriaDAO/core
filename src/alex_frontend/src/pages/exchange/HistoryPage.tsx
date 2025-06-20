import React, { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import TransactionHistory from '@/features/history/components/TransactionHistory';
import TransactionPreview from '@/features/history/components/TransactionPreview';
import { Alert } from '@/components/Alert';
import { useAlex, useLbry } from '@/hooks/actors';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { fetchTransactions } from '@/features/history';

const HistoryPage: React.FC = () => {
  const {actor: lbryActor} = useLbry();
  const {actor: alexActor} = useAlex();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const { transactions, loading, error } = useAppSelector((state) => state.history);


  useEffect(() => {
    if(!user || !lbryActor || !alexActor) return;
    
    console.log('Fetching transactions for user:', user.principal);
    dispatch(fetchTransactions({lbryActor, alexActor, account: user.principal}));
  }, [user, lbryActor, alexActor, dispatch]);

console.log('History state:', history);



  if (loading) {
    return (
      <div className='p-6 flex-grow flex items-center justify-center bg-card rounded-bordertb shadow'>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Loading transaction history...</span>
        </div>
      </div>
    );
  }

  if(error) return (
    <div className='p-6 flex-grow flex items-center justify-center bg-card rounded-bordertb shadow'>
      <div className="max-w-2xl flex-grow container flex justify-center items-start">
          <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
      </div>
    </div>
  )

  if(transactions.length <= 0) return (
    <div className='p-6 flex-grow flex items-center justify-center bg-card rounded-bordertb shadow'>
      <div className="max-w-2xl flex-grow container flex justify-center items-start">
          <Alert variant="default" title="Empty" className="w-full">No transactions to show..</Alert>
      </div>
    </div>
  )

  return (
    <div className='p-6 bg-card rounded-bordertb shadow'>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2">
          <TransactionHistory />
        </div>
        <div className="lg:col-span-1">
          <TransactionPreview />
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;