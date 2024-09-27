import React, { useState, useEffect } from "react";
import { fetchTransactions } from "./query";
import { Transaction } from "./types/queries";

interface SearchProps {
  onTransactionsUpdate: (transactions: Transaction[]) => void;
  onContentTypeChange: (contentType: string) => void;
}

export default function Search({ onTransactionsUpdate, onContentTypeChange }: SearchProps) {
  const [contentType, setContentType] = useState<string>("application/epub+zip");
  const [amount, setAmount] = useState<number>(10);
  const [filterDate, setFilterDate] = useState<string>("");

  useEffect(() => {
    const loadTransactions = async () => {
      let maxTimestamp: number | undefined;

      if (filterDate) {
        maxTimestamp = Math.floor(new Date(filterDate).getTime() / 1000);
        console.log("Selected date:", filterDate);
        console.log("Converted timestamp:", maxTimestamp);
      }

      console.log("Fetching transactions with params:", {
        contentType,
        amount,
        maxTimestamp
      });

      const fetchedTransactions = await fetchTransactions(contentType, amount, undefined, maxTimestamp);
      console.log("Fetched transactions:", fetchedTransactions);
      onTransactionsUpdate(fetchedTransactions);
    };

    loadTransactions();
  }, [contentType, amount, filterDate, onTransactionsUpdate]);

  const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newContentType = e.target.value;
    setContentType(newContentType);
    onContentTypeChange(newContentType);
  };

  return (
    <div>
      <select value={contentType} onChange={handleContentTypeChange}>
        <option value="application/epub+zip">EPUB</option>
        <option value="image/png">PNG</option>
        <option value="image/jpeg">JPEG</option>
        <option value="image/gif">GIF</option>
      </select>
      <input 
        type="number" 
        value={amount} 
        onChange={(e) => setAmount(Math.min(parseInt(e.target.value), 100))}
        min="1"
        max="100"
      />
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />
    </div>
  );
}