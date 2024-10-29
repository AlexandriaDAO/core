import React, { useState, useEffect, useRef, useCallback } from "react";
import { Transaction, ContentListProps } from "@/apps/Modules/shared/types/queries";
import ContentGrid from "./ContentGrid";
import { mint_nft } from "@/features/nft/mint";
import { FaInfoCircle } from 'react-icons/fa';
import Modal from './components/Modal';
import ContentRenderer from './components/ContentRenderer';
import { useAppContent } from './hooks/useAppContent';

const ContentList = ({ transactions }: ContentListProps) => {
  const { contentData, contentUrls, mintableState, handleRenderError } = useAppContent(transactions);
  const [showStats, setShowStats] = useState<Record<string, boolean>>({});
  const [selectedContent, setSelectedContent] = useState<{ id: string; type: string } | null>(null);

  const handleMint = async (transactionId: string) => {
    try {
      await mint_nft(transactionId);
      alert("NFT minted successfully!");
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Failed to mint NFT. Please try again.");
    }
  };

  const renderDetails = useCallback((transaction: Transaction) => (
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
  ), []);

  return (
    <>
      <ContentGrid>
        {transactions.map((transaction) => {
          const content = contentData[transaction.id];
          const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
          const mintableStateItem = mintableState[transaction.id];
          const isMintable = mintableStateItem?.mintable;

          return (
            <ContentGrid.Item
              key={transaction.id}
              onClick={() => setSelectedContent({ id: transaction.id, type: contentType })}
            >
              <div className="group relative w-full h-full">
                <ContentRenderer
                  transaction={transaction}
                  content={content}
                  contentUrls={contentUrls[transaction.id] || {
                    thumbnailUrl: null,
                    coverUrl: null,
                    fullUrl: content?.url || `https://arweave.net/${transaction.id}`
                  }}
                  showStats={showStats[transaction.id]}
                  mintableState={mintableState}
                  handleRenderError={handleRenderError}
                />
                {renderDetails(transaction)}
              
                {isMintable && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStats(prev => ({ ...prev, [transaction.id]: !prev[transaction.id] }));
                      }}
                      className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-30"
                    >
                      <FaInfoCircle />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMint(transaction.id);
                      }}
                      className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-30"
                    >
                      +
                    </button>
                  </>
                )}
              </div>
            </ContentGrid.Item>
          );
        })}
      </ContentGrid>

      <Modal
        isOpen={!!selectedContent}
        onClose={() => setSelectedContent(null)}
      >
        {selectedContent && (
          <div className="w-full h-full">
            <ContentRenderer
              transaction={transactions.find(t => t.id === selectedContent.id)!}
              content={contentData[selectedContent.id]}
              contentUrls={contentUrls[selectedContent.id] || {
                thumbnailUrl: null,
                coverUrl: null,
                fullUrl: contentData[selectedContent.id]?.url || `https://arweave.net/${selectedContent.id}`
              }}
              inModal={true}
              showStats={showStats[selectedContent.id]}
              mintableState={mintableState}
              handleRenderError={handleRenderError}
            />
          </div>
        )}
      </Modal> 
    </>
  );
};

export default React.memo(ContentList);
