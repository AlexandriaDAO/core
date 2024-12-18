import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Transaction, ContentListProps } from "@/apps/Modules/shared/types/queries";
import { RootState, AppDispatch } from "@/store";
import { toast } from "sonner";
import { Info } from 'lucide-react';
import { setMintableStates, clearTransactionContent } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import ContentGrid from "./ContentGrid";
import Modal from './components/Modal';
import ContentRenderer from './components/ContentRenderer';
import { mint_nft } from "@/features/nft/mint";
import { useSortedTransactions } from '@/apps/Modules/shared/state/content/contentSortUtils';
import { Button } from "@/lib/components/button";
import { Card } from "@/lib/components/card";
import { withdraw_nft } from "@/features/nft/withdraw";
import type { NftData } from "@/apps/Modules/shared/state/nftData/nftDataSlice";

// Create a typed dispatch hook
const useAppDispatch = () => useDispatch<AppDispatch>();

const ContentList = () => {
  const dispatch = useAppDispatch();
  const transactions = useSortedTransactions();
  const contentData = useSelector((state: RootState) => state.contentDisplay.contentData);
  const mintableState = useSelector((state: RootState) => state.contentDisplay.mintableState);
  const predictions = useSelector((state: RootState) => state.arweave.predictions);
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [showStats, setShowStats] = useState<Record<string, boolean>>({});
  const [selectedContent, setSelectedContent] = useState<{ id: string; type: string } | null>(null);

  const handleMint = async (transactionId: string) => {
    try {
      const message = await mint_nft(transactionId);
      toast.success(message);
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const handleRenderError = useCallback((transactionId: string) => {
    dispatch(clearTransactionContent(transactionId));
    dispatch(setMintableStates({ [transactionId]: { mintable: false } }));
  }, [dispatch]);

  const handleWithdraw = async (transactionId: string) => {
    try {
      const nftId = arweaveToNftId[transactionId];
      if (!nftId) {
        throw new Error("Could not find NFT ID for this content");
      }

      const nftData = nfts[nftId];
      if (!nftData) {
        throw new Error("Could not find NFT data for this content");
      }

      const [lbryBlock, alexBlock] = await withdraw_nft(nftId, nftData.collection);
      if (lbryBlock === null && alexBlock === null) {
        toast.info("No funds were available to withdraw");
      } else {
        let message = "Successfully withdrew";
        if (lbryBlock !== null) message += " LBRY";
        if (alexBlock !== null) message += (lbryBlock !== null ? " and" : "") + " ALEX";
        toast.success(message);
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const renderDetails = useCallback((transaction: Transaction) => (
    <div className="absolute inset-0 bg-black bg-opacity-80 p-2 overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-300 z-[20]">
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
          
          const nftId = arweaveToNftId[transaction.id];
          const nftData = nftId ? nfts[nftId] : undefined;
          const isOwned = nftData?.principal === user?.principal;
          
          const hasPredictions = !!predictions[transaction.id];
          const shouldShowBlur = hasPredictions && predictions[transaction.id]?.isPorn == true;

          const hasWithdrawableBalance = nftData && (
            parseFloat(nftData.alex || '0') > 0 || 
            parseFloat(nftData.lbry || '0') > 0
          );

          return (
            <ContentGrid.Item
              key={transaction.id}
              onClick={() => setSelectedContent({ id: transaction.id, type: contentType })}
              id={transaction.id}
              showStats={showStats[transaction.id]}
              onToggleStats={(e) => {
                e.stopPropagation();
                setShowStats(prev => ({ ...prev, [transaction.id]: !prev[transaction.id] }));
              }}
              isMintable={isMintable}
              isOwned={isOwned}
              onMint={(e) => {
                e.stopPropagation();
                handleMint(transaction.id);
              }}
              onWithdraw={hasWithdrawableBalance ? (e) => {
                e.stopPropagation();
                handleWithdraw(transaction.id);
              } : undefined}
              predictions={predictions[transaction.id]}
            >
              <div className="group relative w-full h-full">
                <ContentRenderer
                  transaction={transaction}
                  content={content}
                  contentUrls={contentData[transaction.id]?.urls || {
                    thumbnailUrl: null,
                    coverUrl: null,
                    fullUrl: content?.url || `https://arweave.net/${transaction.id}`
                  }}
                  showStats={showStats[transaction.id]}
                  mintableState={mintableState}
                  handleRenderError={handleRenderError}
                />
                {shouldShowBlur && (
                  <div className="absolute inset-0 backdrop-blur-xl bg-black/30 z-[15]">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-medium">
                      Content Filtered
                    </div>
                  </div>
                )}
                {renderDetails(transaction)}
                {isOwned && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs z-30">
                    Owned
                  </div>
                )}
                {isOwned && hasWithdrawableBalance && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWithdraw(transaction.id);
                    }}
                    className="absolute bottom-2 right-2 z-30"
                  >
                    Withdraw
                  </Button>
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
              contentUrls={contentData[selectedContent.id]?.urls || {
                thumbnailUrl: null,
                coverUrl: null,
                fullUrl: contentData[selectedContent.id]?.url || `https://arweave.net/${selectedContent.id}`
              }}
              inModal={true}
              showStats={showStats[selectedContent.id]}
              mintableState={mintableState}
              handleRenderError={handleRenderError}
            />
            {selectedContent && predictions[selectedContent.id]?.isPorn && (
              <div className="absolute inset-0 backdrop-blur-xl bg-black/30 z-[55]">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-medium">
                  Content Filtered
                </div>
              </div>
            )}
          </div>
        )}
      </Modal> 
    </>
  );
};

export default React.memo(ContentList);