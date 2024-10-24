import React from 'react';
import { Transaction } from '../../arweave/types/queries';

interface ContentDetailsProps {
  transaction: Transaction;
}

const ContentDetails: React.FC<ContentDetailsProps> = ({ transaction }) => (
  <div className="absolute inset-0 bg-black bg-opacity-80 p-2 overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-300 z-10">
    <p><span className="font-semibold">ID:</span> {transaction.id}</p>
    <p><span className="font-semibold">Owner:</span> {transaction.owner}</p>
    {transaction.data && <p><span className="font-semibold">Size:</span> {transaction.data.size} bytes</p>}
    {transaction.block && <p><span className="font-semibold">Date (UTC):</span> {new Date(transaction.block.timestamp * 1000).toUTCString()}</p>}
    <p className="font-semibold mt-2">Tags:</p>
    {transaction.tags.map((tag, index) => (
      <p key={index} className="ml-2"><span className="font-semibold">{tag.name}:</span> {tag.value}</p>
    ))}
  </div>
);

export default ContentDetails;
