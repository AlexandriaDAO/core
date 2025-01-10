import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { RootState, AppDispatch } from "@/store";
import { toast } from "sonner";
import { Copy } from 'lucide-react';
import { setMintableStates, clearTransactionContent } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import ContentGrid from "./ContentGrid";
import Modal from './components/Modal';
import ContentRenderer from './components/ContentRenderer';
import { mint_nft } from "@/features/nft/mint";
import { useSortedTransactions } from '@/apps/Modules/shared/state/content/contentSortUtils';
import { Button } from "@/lib/components/button";
import { Card } from "@/lib/components/card";
import { withdraw_nft } from "@/features/nft/withdraw";
import { TooltipProvider } from "@/lib/components/tooltip";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/components/card";
import { ScrollArea } from "@/lib/components/scroll-area";
import { Badge } from "@/lib/components/badge";
import { Separator } from "@/lib/components/separator";
import { NFTData } from '@/apps/Modules/shared/types/nft';
import Overlay from "@/apps/app/Emporium/overlay";

// Create a typed dispatch hook
const useAppDispatch = () => useDispatch<AppDispatch>();

const truncateMiddle = (str: string, startChars: number = 4, endChars: number = 4) => {
  if (str.length <= startChars + endChars + 3) return str;
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
};
const defaultTransaction: Transaction = {
  id: "", // Example properties; replace these with actual fields in Transaction
  owner: "",
  tags: [],
  data: {
    size: 0,
    type: ""
  },
  block: null,
};
interface ContentListProps {
  isEmporium: boolean;
}
const ContentList: React.FC<ContentListProps> = ({ isEmporium }) => {
  const dispatch = useAppDispatch();
  const transactions = useSortedTransactions();
  const contentData = useSelector((state: RootState) => state.contentDisplay.contentData);
  const mintableState = useSelector((state: RootState) => state.contentDisplay.mintableState);
  const predictions = useSelector((state: RootState) => state.arweave.predictions);
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const { user } = useSelector((state: RootState) => state.auth);
  const emporium = useSelector((state: RootState) => state.emporium);

  const [showStats, setShowStats] = useState<Record<string, boolean>>({});
  const [selectedContent, setSelectedContent] = useState<{ id: string; type: string } | null>(null);
  const [mintingStates, setMintingStates] = useState<Record<string, boolean>>({});

  const [buttonType, setButtonType] = useState("Buy");
  const [modalType, setModalType] = useState<"sell" | "edit" | "remove" | "buy" | null>(null);
  const [modalData, setModalData] = useState({
    arwaveId: "",
    price: "",
    transaction: defaultTransaction,
    show: false,
  });

  useEffect(() => {
    setButtonType(emporium.type === "userNfts" ? "Sell" : "Buy");
  }, [emporium.type]);

  const handleOpenModal = (type: "sell" | "edit" | "remove" | "buy", data: any) => {
    setModalType(type);
    setModalData({ ...data, show: true });
  };

  const handleCloseModal = () => {
    setModalData({ arwaveId: "", price: "", show: false, transaction: defaultTransaction });
    setModalType(null);
  };

  const handleMint = async (transactionId: string) => {
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

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label} to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const renderDetails = useCallback((transaction: Transaction) => (
    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[20]">
      <ScrollArea className="h-full">
        <Card className="bg-transparent border-none text-gray-100 shadow-none">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-medium">Content Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3 pt-0 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-center group/item cursor-pointer hover:bg-gray-800/50 p-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(transaction.id, 'ID');
                }}>
                <span className="text-gray-400">ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono truncate ml-2 max-w-[180px]">{transaction.id}</span>
                  <Copy className="w-3 h-3 opacity-0 group-hover/item:opacity-100" />
                </div>
              </div>
              <div className="flex justify-between items-center group/item cursor-pointer hover:bg-gray-800/50 p-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(transaction.owner, 'Owner address');
                }}>
                <span className="text-gray-400">Owner</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono truncate ml-2 max-w-[180px]">{transaction.owner}</span>
                  <Copy className="w-3 h-3 opacity-0 group-hover/item:opacity-100" />
                </div>
              </div>
              {transaction.data && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Size</span>
                  <span>{(transaction.data.size / 1024).toFixed(2)} KB</span>
                </div>
              )}
              {transaction.block && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span>
                    {new Date(transaction.block.timestamp * 1000).toLocaleString('en-US', {
                      timeZone: 'UTC'
                    })} UTC
                  </span>
                </div>
              )}
            </div>

            <Separator className="bg-gray-700" />

            <div className="space-y-2">
              <span className="text-gray-400">Tags</span>
              <div className="flex flex-wrap gap-2">
                {transaction.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    title={`${tag.name}: ${tag.value}`}
                    className="bg-gray-800 text-gray-200 cursor-pointer hover:bg-gray-700 group/badge flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(`${tag.name}: ${tag.value}`, 'Tag');
                    }}
                  >
                    {truncateMiddle(tag.name)}: {truncateMiddle(tag.value)}
                    <Copy className="w-3 h-3 opacity-0 group-hover/badge:opacity-100" />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  ), [copyToClipboard]);

  return (
    <TooltipProvider>
      <>
        <ContentGrid>
          {transactions.map((transaction) => {
            const content = contentData[transaction.id];
            const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
            const mintableStateItem = mintableState[transaction.id];
            const isMintable = mintableStateItem?.mintable;

            const nftId = arweaveToNftId[transaction.id];
            const nftData = nftId ? nfts[nftId] : undefined;
            const isOwned = user && nftData?.principal === user.principal;
            console.log("isOwned is ",  nftData?.principal)
            const hasPredictions = !!predictions[transaction.id];
            const shouldShowBlur = hasPredictions && predictions[transaction.id]?.isPorn == true;

            const hasWithdrawableBalance = isOwned && nftData && (
              parseFloat(nftData.balances?.alex || '0') > 0 ||
              parseFloat(nftData.balances?.lbry || '0') > 0
            );

            return (
              <ContentGrid.Item
                key={transaction.id}
                onClick={() => setSelectedContent({ id: transaction.id, type: contentType })}
                id={transaction.id}
                owner={transaction.owner}
                showStats={showStats[transaction.id]}
                onToggleStats={(open) => {
                  setShowStats(prev => ({ ...prev, [transaction.id]: open }));
                }}
                isMintable={isMintable}
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
                    contentUrls={contentData[transaction.id]?.urls || {
                      thumbnailUrl: null,
                      coverUrl: null,
                      fullUrl: content?.url || `https://arweave.net/${transaction.id}`
                    }}
                    showStats={showStats[transaction.id]}
                    mintableState={mintableState}
                    handleRenderError={handleRenderError}
                  />
                  {isEmporium && <Overlay
                    transaction={transaction}
                    type={emporium.type}
                    buttonType={buttonType}
                    setModal={handleOpenModal}
                  />}
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
    </TooltipProvider>
  );
};

export default React.memo(ContentList);