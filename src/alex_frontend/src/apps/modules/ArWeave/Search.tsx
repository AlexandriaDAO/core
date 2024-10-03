import React, { useState, useEffect, useCallback } from "react";
import { fetchRecentTransactions, fetchTransactionsByIds } from './ArweaveQueries';
import { Transaction } from "./types/queries";
import { supportedFileTypes } from "./types/files";

interface SearchProps {
  onTransactionsUpdate: (transactions: Transaction[]) => void;
  onContentTypeChange: (contentType: string) => void;
  onLoadingChange: (isLoading: boolean) => void; // New prop
  mode: 'user' | 'general';
  userTransactionIds?: string[];
  initialSearch?: boolean;
}

export default function Search({ 
  onTransactionsUpdate, 
  onContentTypeChange, 
  onLoadingChange, // New prop
  mode, 
  userTransactionIds = [],
  initialSearch = false
}: SearchProps) {
  const [contentType, setContentType] = useState<string>(supportedFileTypes[0].mimeType);
  const [amount, setAmount] = useState<number>(10);
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterTime, setFilterTime] = useState<string>("00:00");
  const [ownerFilter, setOwnerFilter] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasInitialSearched, setHasInitialSearched] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    onLoadingChange(true);
    onTransactionsUpdate([]); // Clear previous results

    let fetchedTransactions: Transaction[] = [];

    try {
      if (mode === 'user' && userTransactionIds.length > 0) {
        fetchedTransactions = await fetchTransactionsByIds(userTransactionIds);
      } else {
        let maxTimestamp: number | undefined;
        if (filterDate) {
          const dateTime = new Date(`${filterDate}T${filterTime}:00Z`);
          maxTimestamp = Math.floor(dateTime.getTime() / 1000);
        }
        fetchedTransactions = await fetchRecentTransactions(contentType, amount, maxTimestamp, ownerFilter || undefined);
      }

      onTransactionsUpdate(fetchedTransactions);
      onContentTypeChange(contentType);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      // Optionally, you can add error handling here
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  }, [contentType, amount, filterDate, filterTime, ownerFilter, mode, userTransactionIds, onTransactionsUpdate, onContentTypeChange, onLoadingChange]);

  useEffect(() => {
    if (initialSearch && !hasInitialSearched) {
      fetchTransactions();
      setHasInitialSearched(true);
    }
  }, [initialSearch, hasInitialSearched, fetchTransactions]);

  const handleSearch = () => {
    fetchTransactions();
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
      padding: '15px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      maxWidth: '300px',
    },
    label: {
      fontWeight: 'bold',
      marginBottom: '5px',
    },
    select: {
      padding: '5px',
      borderRadius: '3px',
      border: '1px solid #ccc',
    },
    input: {
      padding: '5px',
      borderRadius: '3px',
      border: '1px solid #ccc',
    },
    button: {
      padding: '8px 15px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
    },
  };

  const buttonStyle = {
    ...styles.button,
    backgroundColor: isLoading ? '#cccccc' : '#007bff',
    cursor: isLoading ? 'not-allowed' : 'pointer',
  };

  return (
    <div style={styles.container}>
      {mode === 'general' && (
        <>
          <div>
            <label style={styles.label}>Content Type:</label>
            <select 
              value={contentType} 
              onChange={(e) => setContentType(e.target.value)}
              style={styles.select}
            >
              {supportedFileTypes.map(type => (
                <option key={type.mimeType} value={type.mimeType}>{type.displayName}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>Amount:</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Math.min(parseInt(e.target.value), 100))}
              min="1"
              max="100"
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Time:</label>
            <input
              type="time"
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Owner Address:</label>
            <input
              type="text"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              placeholder="Enter owner address"
              style={styles.input}
            />
          </div>
        </>
      )}
      <button 
        onClick={handleSearch} 
        style={buttonStyle}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : (mode === 'user' ? 'Refresh' : 'Search')}
      </button>
    </div>
  );
}