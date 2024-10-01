import React, { useState } from "react";
import { fetchTransactions } from "./query";
import { Transaction } from "../helpers/ArWeave/types/queries";
import { supportedFileTypes } from "../helpers/ArWeave/types/files";

interface SearchProps {
  onTransactionsUpdate: (transactions: Transaction[]) => void;
  onContentTypeChange: (contentType: string) => void;
}

export default function Search({ onTransactionsUpdate, onContentTypeChange }: SearchProps) {
  const [contentType, setContentType] = useState<string>(supportedFileTypes[0].mimeType);
  const [amount, setAmount] = useState<number>(10);
  const [filterDate, setFilterDate] = useState<string>("");

  const handleSearch = async () => {
    let maxTimestamp: number | undefined;

    if (filterDate) {
      maxTimestamp = Math.floor(new Date(filterDate).getTime() / 1000);
    }

    const fetchedTransactions = await fetchTransactions(contentType, amount, undefined, maxTimestamp);
    onTransactionsUpdate(fetchedTransactions);
    onContentTypeChange(contentType);
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

  return (
    <div style={styles.container}>
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
        <label style={styles.label}>Filter Date:</label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={styles.input}
        />
      </div>
      <button onClick={handleSearch} style={styles.button}>
        Search
      </button>
    </div>
  );
}