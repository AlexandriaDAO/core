import React, { useEffect, useState } from "react";
import { fetchTransactions } from "./query";

interface Tag {
  name: string;
  value: string;
}

interface Transaction {
  id: string;
  tags: Tag[];
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
          <p>Transaction ID: {transaction.id}</p>
          <iframe
            src={`https://node1.irys.xyz/${transaction.id}`}
            title={`Transaction ${transaction.id}`}
            width="100%"
            height="400px"
            frameBorder="0"
          ></iframe>
          <div>
            <h3>Tags:</h3>
            <ul>
              {transaction.tags.map((tag, tagIndex) => (
                <li key={tagIndex}>
                  {tag.name}: {tag.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookResults;