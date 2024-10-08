import React, { useState, useCallback } from 'react';
import Search from './Search';
import RandomContent from './RandomContent';
import { Transaction, MainSearchProps } from '../types/queries';

const MainSearch: React.FC<MainSearchProps> = ({
  onTransactionsUpdate,
  onLoadingChange,
  mode,
  userTransactionIds,
}) => {
  const [isRandomMode, setIsRandomMode] = useState(true);

  const toggleMode = useCallback(() => {
    setIsRandomMode(!isRandomMode);
  }, [isRandomMode]);

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <button
          onClick={toggleMode}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isRandomMode ? 'Switch to Advanced Search' : 'Switch to Random Content'}
        </button>
      </div>
      {isRandomMode ? (
        <RandomContent
          onTransactionsUpdate={onTransactionsUpdate}
          onLoadingChange={onLoadingChange}
          mode={mode}
          userTransactionIds={userTransactionIds}
        />
      ) : (
        <Search
          onTransactionsUpdate={onTransactionsUpdate}
          onLoadingChange={onLoadingChange}
          mode={mode}
          userTransactionIds={userTransactionIds}
        />
      )}
    </div>
  );
};

export default MainSearch;