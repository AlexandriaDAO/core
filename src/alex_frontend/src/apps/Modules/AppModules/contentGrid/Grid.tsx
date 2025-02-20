import React, { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { toast } from "sonner";
import { clearTransactionContent } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import { Dialog, DialogContent, DialogTitle } from '@/lib/components/dialog';
import ContentRenderer from '@/apps/Modules/AppModules/safeRender/ContentRenderer';
import TransactionDetails from '@/apps/Modules/AppModules/contentGrid/components/TransactionDetails';
import { mint_nft } from "@/features/nft/mint";
import { useSortedTransactions } from '@/apps/Modules/shared/state/content/contentSortUtils';
import { Button } from "@/lib/components/button";
import { withdraw_nft } from "@/features/nft/withdraw";
import { TooltipProvider } from "@/lib/components/tooltip";
import { Loader2 } from 'lucide-react';
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";

// Create a typed dispatch hook
const useAppDispatch = () => useDispatch<AppDispatch>();

export interface ContentGridProps {
  children: React.ReactNode;
}

type ContentGridComponent = React.FC<ContentGridProps> & {
  Item: typeof ContentCard;
};

export const ContentGrid: ContentGridComponent = Object.assign(
  ({ children }: ContentGridProps) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1  gap-2 sm:gap-4 lg:pb-16 md:pb-14 sm:pb-10 xs:pb-6">
        {children}
      </div>
    );
  },
  { Item: ContentCard }
);

// Map frontend collection names to backend collection names
const mapCollectionToBackend = (collection: 'NFT' | 'SBT'): 'icrc7' | 'icrc7_scion' => {
  return collection === 'NFT' ? 'icrc7' : 'icrc7_scion';
};

const Grid = () => {
  const dispatch = useAppDispatch();
  const transactions = useSortedTransactions();
  const contentData = useSelector((state: RootState) => state.contentDisplay.contentData);
  const predictions = useSelector((state: RootState) => state.arweave.predictions);
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [showStats, setShowStats] = useState<Record<string, boolean>>({});
  const [selectedContent, setSelectedContent] = useState<{ id: string; type: string,assetUrl:string } | null>(null);
  const [mintingStates, setMintingStates] = useState<Record<string, boolean>>({});
  const [withdrawingStates, setWithdrawingStates] = useState<Record<string, boolean>>({});

  const handleMint = useCallback(async (transactionId: string) => {
    try {
      setMintingStates(prev => ({ ...prev, [transactionId]: true }));
      const message = await mint_nft(transactionId);
      toast.success(message);
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setMintingStates(prev => ({ ...prev, [transactionId]: false }));
    }
  }, []);

  const handleRenderError = useCallback((transactionId: string) => {
    dispatch(clearTransactionContent(transactionId));
  }, [dispatch]);

  const handleWithdraw = useCallback(async (transactionId: string) => {
    try {
      setWithdrawingStates(prev => ({ ...prev, [transactionId]: true }));
      const nftId = arweaveToNftId[transactionId];
      if (!nftId) {
        throw new Error("Could not find NFT ID for this content");
      }

      const nftData = nfts[nftId];
      if (!nftData) {
        throw new Error("Could not find NFT data for this content");
      }

      const [lbryBlock, alexBlock] = await withdraw_nft(nftId, mapCollectionToBackend(nftData.collection));
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
    } finally {
      setWithdrawingStates(prev => ({ ...prev, [transactionId]: false }));
    }
  }, [arweaveToNftId, nfts]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSelectedContent(null);
    }
  }, []);

  // Memoize transactions to prevent unnecessary re-renders
  const memoizedTransactions = useMemo(() => transactions, [transactions]);

  return (
    <TooltipProvider>
      <>
        <ContentGrid>
          {memoizedTransactions.map((transaction) => {
            const content = contentData[transaction.id];
            const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
            
            const nftId = arweaveToNftId[transaction.id];
            const nftData = nftId ? nfts[nftId] : undefined;
            const isOwned = user && nftData?.principal === user.principal;
            
            const hasPredictions = !!predictions[transaction.id];
            const shouldShowBlur = hasPredictions && predictions[transaction.id]?.isPorn == true;

            const hasWithdrawableBalance = isOwned && nftData && (
              parseFloat(nftData.balances?.alex || '0') > 0 || 
              parseFloat(nftData.balances?.lbry || '0') > 0
            );

            return (
              <ContentGrid.Item
                key={transaction.id}
                onClick={() => setSelectedContent({ id: transaction.id, type: contentType ,assetUrl:transaction.assetUrl?transaction.assetUrl:""})}
                id={transaction.id}
                owner={transaction.owner}
                isOwned={isOwned || false}
                onMint={(e) => {
                  e.stopPropagation();
                  handleMint(transaction.id);
                }}
                onWithdraw={hasWithdrawableBalance ? (e) => {
                  e.stopPropagation();
                  handleWithdraw(transaction.id);
                } : undefined}
                predictions={predictions[transaction.id]}
                isMinting={mintingStates[transaction.id]}
              >
                <div className="group relative w-full h-full">
                  <ContentRenderer
                    transaction={transaction}
                    content={content}
                    contentUrls={content?.urls || {
                      thumbnailUrl: null,
                      coverUrl: null,
                      fullUrl: transaction?.assetUrl || `https://arweave.net/${transaction.id}`
                    }}
                    handleRenderError={handleRenderError}
                  />
                  {shouldShowBlur && (
                    <div className="absolute inset-0 backdrop-blur-xl bg-black/30 z-[15]">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-medium">
                        Content Filtered
                      </div>
                    </div>
                  )}
                  <TransactionDetails transaction={transaction} />
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
                      disabled={withdrawingStates[transaction.id]}
                    >
                      {withdrawingStates[transaction.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Withdrawing...
                        </>
                      ) : (
                        "Withdraw"
                      )}
                    </Button>
                  )}
                </div>
              </ContentGrid.Item>
            );
          })}
        </ContentGrid>

        <Dialog open={!!selectedContent} onOpenChange={handleDialogOpenChange}>
          <DialogContent 
            className="w-auto h-auto max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-background"
          >
            <DialogTitle className="sr-only">
              {selectedContent?.type.split('/')[0].toUpperCase()} Content Viewer
            </DialogTitle>
            
            {selectedContent && contentData[selectedContent.id] && (
              <div className="w-full h-full">
                <ContentRenderer
                  key={selectedContent.id}
                  transaction={transactions.find(t => t.id === selectedContent.id)!}
                  content={contentData[selectedContent.id]}
                  contentUrls={contentData[selectedContent.id]?.urls || {
                    thumbnailUrl: null,
                    coverUrl: null,
                    fullUrl: contentData[selectedContent.id]?.url || `https://arweave.net/${selectedContent.id}`
                  }}
                  inModal={true}
                  handleRenderError={handleRenderError}
                />
              </div>
            )}
          </DialogContent>
        </Dialog> 
      </>
    </TooltipProvider>
  );
};

export default React.memo(Grid);