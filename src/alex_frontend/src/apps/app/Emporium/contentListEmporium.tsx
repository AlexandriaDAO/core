import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { RootState, AppDispatch } from "@/store";
import { Copy, Info, LoaderPinwheel, X } from 'lucide-react';
import { clearTransactionContent } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { Dialog, DialogContent } from '@/lib/components/dialog';
import ContentRenderer from "@/apps/Modules/AppModules/safeRender/ContentRenderer";
import { useSortedTransactions } from '@/apps/Modules/shared/state/content/contentSortUtils';
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Overlay from "./overlay";
import CombinedModal from "./combineModal";
import { ScrollArea } from "@/lib/components/scroll-area";
import { Badge } from "@/lib/components/badge";
import { Separator } from "@/lib/components/separator";
import { toast } from "sonner";
import { TooltipProvider } from "@/lib/components/tooltip";
import { Button } from "@/lib/components/button";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/components/card";
import { Card } from "@/lib/components/card";

const truncateMiddle = (str: string, startChars: number = 4, endChars: number = 4) => {
  if (str.length <= startChars + endChars + 3) return str;
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
};
// Create a typed dispatch hook
const useAppDispatch = () => useDispatch<AppDispatch>();
interface ContentListEmporiumProps {
  type: string;
}
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

const ContentListEmporium: React.FC<ContentListEmporiumProps> = ({ type }) => {
  const dispatch = useAppDispatch();
  const transactions = useSortedTransactions();
  const contentData = useSelector((state: RootState) => state.contentDisplay.contentData);
  const predictions = useSelector((state: RootState) => state.arweave.predictions);
  const emporium = useAppSelector((state) => state.emporium);

  const [selectedContent, setSelectedContent] = useState<{ id: string; type: string } | null>(null);
  const [buttonType, setButtonType] = useState("Buy");
  const [modalType, setModalType] = useState<"sell" | "edit" | "remove" | "buy" | null>(null);
  const [modalData, setModalData] = useState({
    arwaveId: "",
    price: "",
    transaction: defaultTransaction,
    show: false,
  });

  const handleOpenModal = (type: "sell" | "edit" | "remove" | "buy", data: any) => {
    setModalType(type);
    setModalData({ ...data, show: true });
  };

  const handleCloseModal = () => {
    setModalData({ arwaveId: "", price: "", show: false, transaction: defaultTransaction });
    setModalType(null);
  };

  const handleRenderError = useCallback((transactionId: string) => {
    dispatch(clearTransactionContent(transactionId));
  }, [dispatch]);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label} to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  }, []);
  const renderDetails = useCallback((transaction: Transaction) => (
    <div className="absolute inset-0 bg-black/90 opacity-0 hidden md:block group-hover:opacity-100 transition-opacity duration-200 z-[20] pt-12">
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

  useEffect(() => {
    if (type === "userNfts") {
      setButtonType("Sell");
    }
    else if (type === "marketPlace") {
      setButtonType("Buy");
    }
  }, [type])

  return (
    <TooltipProvider>
      <>
        {emporium.loading == true ? (<div className="w-full h-full fixed bg-[#6f6f6fc9] flex flex-col items-center justify-center gap-2">
          <LoaderPinwheel className="animate-spin text-4xl text-white w-14 h-14" />
        </div>) : (<ContentGrid>
          {transactions.map((transaction) => {
            const content = contentData[transaction.id];
            const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
            const hasPredictions = !!predictions[transaction.id];
            const shouldShowBlur = hasPredictions && predictions[transaction.id]?.isPorn == true;

            return (
              <ContentGrid.Item
                key={transaction.id}
                onClick={
                  () => setSelectedContent({ id: transaction.id, type: contentType })
                }
                id={transaction.id}
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
                  <Overlay transaction={transaction} type={type} buttonType={buttonType} setModal={handleOpenModal} />
                </div>
              </ContentGrid.Item>
            );
          })}
        </ContentGrid>)}

        <Dialog open={!!selectedContent} onOpenChange={(open) => !open && setSelectedContent(null)}>
          <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col" closeIcon={
            <Button
              variant="outline"
              className="absolute right-4 top-4 z-[60] rounded-full p-3 
                bg-primary text-primary-foreground hover:bg-primary/90
                transition-colors"
            >
              <X className="h-6 w-6" />
            </Button>
          }>
            {selectedContent && (
              <div className="w-full h-full overflow-y-auto">
                <div className="p-6">
                  <ContentRenderer
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
              </div>
            )}
          </DialogContent>
        </Dialog>

        <CombinedModal
          type={modalType!}
          modalData={modalData}
          onClose={handleCloseModal}
          handleRenderError={handleRenderError}
        />
      </>
    </TooltipProvider>
  );
};

export default React.memo(ContentListEmporium);

