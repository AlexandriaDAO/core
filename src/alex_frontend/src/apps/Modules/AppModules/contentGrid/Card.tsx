import React, { useState, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/lib/components/card";
import { Loader2, Flag, Plus, Heart } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Progress } from "@/lib/components/progress";
import { AspectRatio } from "@/lib/components/aspect-ratio";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/lib/components/collapsible";
import { useDispatch, useSelector } from "react-redux";
import { NftDataFooter } from "./components/NftDataFooter";
import { RootState } from "@/store";
import { fileTypeCategories } from "@/apps/Modules/shared/types/files";
import { Dialog, DialogContent, DialogTitle } from "@/lib/components/dialog";
import { ShelfSelectionDialog } from "@/apps/app/Perpetua/features/shelf-management/components";
import { mint_nft } from "@/features/nft/mint";
import { toast } from "sonner";
import { Badge } from "@/lib/components/badge";

interface Transaction {
  id: string;
  tags: Array<{ name: string; value: string; }>;
}

interface ContentCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  id?: string;
  owner?: string;
  showStats?: boolean;
  onToggleStats?: (open: boolean) => void;
  isOwned?: boolean;
  onMint?: (e: React.MouseEvent) => void;
  onWithdraw?: (e: React.MouseEvent) => void;
  predictions?: any;
  isMinting?: boolean;
  footer?: React.ReactNode;
  component?: string;
  isFromAssetCanister?: boolean;
}


export function ContentCard({ children, onClick, id, owner, showStats, onToggleStats, isOwned, onMint, predictions, isMinting: externalIsMinting, footer, component, isFromAssetCanister }: ContentCardProps) {
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);
  const [isShelfSelectorOpen, setIsShelfSelectorOpen] = useState(false);
  const [internalMintingState, setInternalMintingState] = useState<boolean>(false);
  const arweaveToNftId = useSelector((state: RootState) => state.nftData.arweaveToNftId);
  const transactions = useSelector((state: RootState) => state.transactions.transactions as Transaction[]);

  // Use either the external minting state (if provided) or the internal one
  const isMinting = externalIsMinting !== undefined ? externalIsMinting : internalMintingState;

  const handleOwnedBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsShelfSelectorOpen(true);
  };

  const handleCloseShelfSelector = () => {
    setIsShelfSelectorOpen(false);
  };

  const isMediaContent = (contentType: string | undefined) => {
    if (!contentType) return false;
    return [...fileTypeCategories.images, ...fileTypeCategories.video].includes(contentType);
  };

  const shouldShowMintButton = () => {
    if (!id) return false;

    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return false;

    const contentType = transaction.tags?.find(tag => tag.name === "Content-Type")?.value;

    // For non-media content (epub, pdf, txt, etc.), always allow minting
    if (!isMediaContent(contentType)) {
      return true;
    }

    // For media content, require safety check
    return predictions && predictions.isPorn === false;
  };

  // Internal handleMint function
  const handleMintInternal = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // If external onMint is provided, use that instead
    if (onMint) {
      onMint(e);
      return;
    }

    // Otherwise use our internal implementation
    if (!id) return;

    try {
      setInternalMintingState(true);
      const message = await mint_nft(id);
      toast.success(message);
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setInternalMintingState(false);
    }
  }, [id, onMint]);

  return (
    <>
      <Card
        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col relative  bg-white dark:bg-gray-900 h-full ${component === "Emporium" ? "mb-20 rounded-2xl " : "overflow-hidden "}`}
        onClick={onClick}
      >
        <CardContent className="flex flex-col items-start p-0">
          <AspectRatio ratio={1} className="w-full relative">
            <div className={`flex items-center justify-center bg-gray-50 dark:bg-gray-800  ${component === "Emporium" ? " border-gray-900 dark:border-gray-900 rounded-[30px]" : "overflow-hidden h-full "}`}  >
              {children}
            </div>
            {/* Action button - either Like or Mint */}
            <div
              className="absolute bottom-2 left-2 z-[30]"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {id && arweaveToNftId[id] ? (
                <Button
                  variant="secondary"
                  className="bg-white/90 hover:bg-white dark:bg-black/90 dark:hover:bg-black text-red-600 hover:text-red-500 border border-red-600/20 hover:border-red-600/40 p-1.5 rounded-md flex items-center justify-center shadow-lg backdrop-blur-sm group"
                  onClick={handleMintInternal}
                  disabled={isMinting}
                >
                  {isMinting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4 transition-all duration-200 group-hover:scale-110" />
                  )}
                </Button>
              ) : shouldShowMintButton() && (
                <Button
                  variant="secondary"
                  className="bg-black/90 hover:bg-black text-brightyellow border border-brightyellow/20 hover:border-brightyellow/40 p-1.5 rounded-md flex items-center justify-center shadow-lg backdrop-blur-sm group"
                  onClick={handleMintInternal}
                  disabled={isMinting}
                >
                  {isMinting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 transition-all duration-200 group-hover:scale-110" />
                  )}
                </Button>
              )}
            </div>

            {/* Owned badge */}
            {isOwned && (
              <div className="absolute top-2 right-2 z-30">
                <Badge 
                  variant="success" 
                  className="cursor-pointer text-xs"
                  onClick={handleOwnedBadgeClick}
                >
                  Owned
                </Badge>
              </div>
            )}

            {/* Storage badge (ICP/AR) */}
            <div className="absolute top-2 left-2 z-30">
              <Badge variant="secondary" className="text-xs">
                {isFromAssetCanister ? "ICP" : "AR"}
              </Badge>
            </div>

          </AspectRatio>
        </CardContent>

        <CardFooter className="flex flex-col w-full bg-[--card] dark:border-gray-700 p-1.5">
          <div className="flex flex-wrap items-center gap-1">
            {/* NFT data or custom footer - now first */}
            {id && !footer && <NftDataFooter id={id} contentOwner={owner} />}
            {footer}
        
            {/* Stats button */}
            {predictions && Object.keys(predictions).length > 0 ? (
              <Collapsible open={showStats} onOpenChange={onToggleStats}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="secondary"
                    className="h-5 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800 rounded-md flex items-center gap-0.5 transition-colors shrink-0 group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Flag className="h-2.5 w-2.5" />
                    <span className="text-[10px] font-medium">Stats</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent onClick={(e) => e.stopPropagation()}>
                  <div className="mt-1.5 space-y-1 w-full">
                    {Object.entries(predictions).map(([key, value]) => (
                      <div key={key} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] dark:text-gray-300">
                          <span>{key}</span>
                          <span>{(Number(value) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={Number(value) * 100} className="h-1" />
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </div>
        </CardFooter>
      </Card>

      {/* Shelf Selector Dialog */}
      {isShelfSelectorOpen && id && (
        <ShelfSelectionDialog
          contentId={id}
          contentType="Nft"
          open={isShelfSelectorOpen}
          onClose={handleCloseShelfSelector}
        />
      )}
    </>
  );
} 