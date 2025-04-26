import React, { useState, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/lib/components/card";
import { Loader2, Flag, Plus, Heart, Bookmark, Info, ChevronDown } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Progress } from "@/lib/components/progress";
import { AspectRatio } from "@/lib/components/aspect-ratio";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/lib/components/collapsible";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { NftDataFooter } from "./components/NftDataFooter";
import { fileTypeCategories } from "@/apps/Modules/shared/types/files";
import { useAddToShelf } from "@/apps/app/Perpetua/features/shelf-management/hooks/useAddToShelf";
import { mint_nft } from "@/features/nft/mint";
import { toast } from "sonner";
import { UnifiedCardActions } from "@/apps/Modules/shared/components/UnifiedCardActions/UnifiedCardActions";
import { useContentCardState } from "./hooks/useContentCardState";

interface ContentCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  id?: string; // Arweave ID
  owner?: string; // Keep original owner string for NftDataFooter
  showStats?: boolean;
  onToggleStats?: (open: boolean) => void;
  predictions?: any;
  footer?: React.ReactNode;
  component?: string;
  isFromAssetCanister?: boolean;
  parentShelfId?: string;
  itemId?: number;
  currentShelfId?: string;
  initialContentType?: 'Arweave' | 'Nft'; // New prop to specify context
}

export function ContentCard({
  children,
  onClick,
  id, // Arweave ID
  owner, // Keep owner
  showStats,
  onToggleStats,
  predictions,
  footer,
  component,
  isFromAssetCanister,
  parentShelfId,
  itemId,
  currentShelfId,
  initialContentType = 'Arweave' // Default to Arweave context
}: ContentCardProps) {
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState(false);

  // --- Use the Custom Hook ---
  const {
    finalContentId,
    finalContentType,
    isItemLikable,
    isOwnedByUser,
    ownerPrincipal
  } = useContentCardState({ id, initialContentType, predictions });

  // --- Callbacks ---

  // handleLike needs access to arweaveToNftId from redux store, so keep it here
  const arweaveToNftId = useSelector((state: RootState) => state.nftData.arweaveToNftId);
  const handleLike = useCallback(async (): Promise<string | null> => {
    if (!id) return null; // Need Arweave ID to mint

    setIsLiking(true);
    try {
      const newlyMintedId = await mint_nft(id);
      if (newlyMintedId) {
        toast.success("Item Liked!");
        return newlyMintedId;
      } else {
        const existingNftId = arweaveToNftId[id];
        if (existingNftId) {
             toast.info("This item is already an NFT/SBT.");
        } else {
            toast.error("Failed to like item.");
        }
        return null;
      }
    } catch (error) {
      console.error("Error liking item (minting NFT):", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred during like");
      return null;
    } finally {
      setIsLiking(false);
    }
  }, [id, arweaveToNftId]); // Added arweaveToNftId dependency

  // --- Rendering ---

  return (
    <>
      <Card
        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col relative bg-white dark:bg-gray-900 h-full ${component === "Emporium" ? "mb-20 rounded-2xl" : "overflow-hidden"}`}
        onClick={onClick}
      >
        <CardContent className="flex flex-col items-start p-0">
          <AspectRatio ratio={1} className="w-full relative">
            <div className={`flex items-center justify-center bg-gray-50 dark:bg-gray-800  ${component === "Emporium" ? " border-gray-900 dark:border-gray-900 rounded-[30px]" : "overflow-hidden h-full "}`}  >
              {children}
            </div>
            {finalContentId && (
              <UnifiedCardActions
                contentId={finalContentId}
                contentType={finalContentType}
                ownerPrincipal={ownerPrincipal}
                isOwned={isOwnedByUser}
                isLikable={isItemLikable}
                onLike={isItemLikable ? handleLike : undefined}
                parentShelfId={parentShelfId}
                itemId={itemId}
                currentShelfId={currentShelfId}
                onToggleDetails={() => setShowDetails(prev => !prev)}
                showDetails={showDetails}
              />
            )}
          </AspectRatio>
        </CardContent>

        {showDetails && (
          <CardFooter className="flex flex-col w-full bg-[--card] dark:border-gray-700 p-1.5">
            <div className="flex flex-wrap items-center gap-1">
              {id && !footer && <NftDataFooter id={id} contentOwner={owner} isFromAssetCanister={isFromAssetCanister} />}
              {footer}
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
        )}
      </Card>
    </>
  );
} 