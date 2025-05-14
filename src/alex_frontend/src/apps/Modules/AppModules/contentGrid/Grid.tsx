import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { toast } from "sonner";
import { clearTransactionContent } from "@/apps/Modules/shared/state/transactions/transactionSlice";
import ContentRenderer from '@/apps/Modules/AppModules/safeRender/ContentRenderer';
import { useSortedTransactions } from '@/apps/Modules/shared/state/content/contentSortUtils';
import { Button } from "@/lib/components/button";
import { withdraw_nft } from "@/features/nft/withdraw";
import { TooltipProvider } from "@/lib/components/tooltip";
import { Loader2 } from 'lucide-react';
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { hasWithdrawableBalance } from '@/apps/Modules/shared/utils/tokenUtils';
import type { Transaction } from '../../shared/types/queries';
import { TokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
import { ShelvesPreloader } from "../shared/components/ShelvesPreloader";
import { MainContentDisplayModal } from '@/apps/Modules/shared/components/MainContentDisplayModal/MainContentDisplayModal';
import { AttachedDetailsPanel } from '@/apps/Modules/shared/components/AttachedDetailsPanel/AttachedDetailsPanel';

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 gap-2 sm:gap-4 lg:pb-16 md:pb-14 sm:pb-10 xs:pb-6">
        <ShelvesPreloader />
        {children}
      </div>
    );
  },
  { Item: ContentCard }
);

const mapCollectionToBackend = (collection: TokenType): 'icrc7' | 'icrc7_scion' => {
  return collection === 'NFT' ? 'icrc7' : 'icrc7_scion';
};

export type GridDataSource = 'transactions';

interface GridProps {
  dataSource?: GridDataSource;
}

// Define a type for the selected content state (Transaction should be enough)
interface SelectedContentState {
  transaction: Transaction;
  // Removed contentType, as it's derived from transaction
}

const Grid = ({ dataSource }: GridProps = {}) => {
  const dispatch = useAppDispatch();

  const contentData = useSelector((state: RootState) => state.transactions.contentData);
  const transactions = useSelector((state: RootState) => state.transactions.transactions); // Ensure this is used or remove
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const { user } = useSelector((state: RootState) => state.auth);
  const { predictions } = useSelector((state: RootState) => state.arweave);
  
  const sortedTransactions = useSortedTransactions();

  const [selectedContent, setSelectedContent] = useState<SelectedContentState | null>(null);
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [withdrawingStates, setWithdrawingStates] = useState<Record<string, boolean>>({});

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

      const collection = nftData.collection as TokenType | undefined;
      if (!collection || (collection !== 'NFT' && collection !== 'SBT')) {
        throw new Error(`Invalid or missing collection type on NFT data: ${collection}`);
      }
      const backendCollection = mapCollectionToBackend(collection);

      const [lbryBlock, alexBlock] = await withdraw_nft(nftId, backendCollection);
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
  }, [arweaveToNftId, nfts, dispatch]); // Removed 'user' as it's not directly used in this callback

  const handleOpenMainModal = useCallback((transaction: Transaction) => {
    setSelectedContent({ transaction });
    setIsMainModalOpen(true);
    setIsDetailsPanelOpen(false); // Ensure details panel is closed when a new item is opened
  }, []);

  const handleCloseMainModal = useCallback(() => {
    setIsMainModalOpen(false);
    setIsDetailsPanelOpen(false); // Also close details panel when main modal is closed
    setSelectedContent(null);
  }, []);

  const handleToggleDetailsPanel = useCallback(() => {
    setIsDetailsPanelOpen(prev => !prev);
  }, []);
  
  const handleCloseDetailsPanel = useCallback(() => {
    setIsDetailsPanelOpen(false);
  }, []);

  return (
    <TooltipProvider>
      <>
        <ContentGrid>
          {sortedTransactions.map((transaction: Transaction) => {
            const cardContent = contentData[transaction.id];
            // Removed contentType as it's derived within MainContentDisplayModal if needed or not used.
            
            const currentPredictions = predictions[transaction.id];
            const nftId = arweaveToNftId[transaction.id];
            const nftData = nftId ? nfts[nftId] : undefined;
            const isOwned = !!(user && nftData?.principal === user.principal);
            const canWithdraw = isOwned && nftData && hasWithdrawableBalance(
              nftData.balances?.alex,
              nftData.balances?.lbry
            );
            const detectedContentType = nftData ? 'Nft' : 'Arweave';

            return (
              <ContentGrid.Item
                key={transaction.id}
                onClick={() => handleOpenMainModal(transaction)} // Updated onClick
                id={transaction.id}
                owner={transaction.owner}
                predictions={currentPredictions}
                isFromAssetCanister={(transaction.assetUrl && transaction?.assetUrl !== "") ? true : false}
                initialContentType={detectedContentType}
              >
                <div className="group relative w-full h-full">
                  <ContentRenderer
                    transaction={transaction}
                    content={cardContent}
                    contentUrls={cardContent?.urls || {
                      thumbnailUrl: null,
                      coverUrl: null,
                      fullUrl: transaction?.assetUrl || `https://arweave.net/${transaction.id}`
                    }}
                    handleRenderError={handleRenderError}
                  />
                  {predictions[transaction.id]?.isPorn && (
                    <div className="absolute inset-0 backdrop-blur-xl bg-black/30 z-[15]">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-medium">
                        Content Filtered
                      </div>
                    </div>
                  )}

                  {isOwned && canWithdraw && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWithdraw(transaction.id);
                      }}
                      className="absolute bottom-2 right-2 z-20 bg-background/80 backdrop-blur-sm hover:bg-background/90 text-xs h-7 px-2"
                      variant="secondary"
                      disabled={withdrawingStates[transaction.id]}
                      aria-label="Withdraw funds"
                    >
                      {withdrawingStates[transaction.id] ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
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

        {selectedContent && selectedContent.transaction && (
          <>
            <MainContentDisplayModal 
              isOpen={isMainModalOpen}
              onClose={handleCloseMainModal}
              onToggleDetails={handleToggleDetailsPanel}
              transaction={selectedContent.transaction}
              content={contentData[selectedContent.transaction.id]}
              contentUrls={contentData[selectedContent.transaction.id]?.urls || {
                thumbnailUrl: null,
                coverUrl: null,
                fullUrl: selectedContent.transaction?.assetUrl || `https://arweave.net/${selectedContent.transaction.id}`
              }}
              handleRenderError={handleRenderError}
            />
            <AttachedDetailsPanel
              isOpen={isDetailsPanelOpen}
              onClose={handleCloseDetailsPanel}
              transaction={selectedContent.transaction}
              predictions={predictions[selectedContent.transaction.id]}
            />
          </>
        )}
      </>
    </TooltipProvider>
  );
};

export default Grid;