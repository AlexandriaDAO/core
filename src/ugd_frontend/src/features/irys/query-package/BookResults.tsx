import React, { useEffect, useState } from "react";
import { fetchTransactions } from "./query";

interface Transaction {
  id: string;
  amount: number;
  // Add more fields as needed
}

const BookResults: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const results = await fetchTransactions();
      setTransactions(results as unknown as Transaction[]);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Transaction Results</h2>
      {transactions.map((transaction, index) => (
        <div key={index}>
          {/* Display the relevant transaction data */}
          <p>Transaction ID: {transaction.id}</p>
          <p>Amount: {transaction.amount}</p>
          {/* Add more fields as needed */}
        </div>
      ))}
    </div>
  );
};

export default BookResults;