import React, { useState, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/lib/components/card";
import { Flag, Info, ChevronDown } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Progress } from "@/lib/components/progress";
import { AspectRatio } from "@/lib/components/aspect-ratio";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/lib/components/collapsible";
import { NftDataFooter } from "./components/NftDataFooter";
import { UnifiedCardActions } from "@/apps/Modules/shared/components/UnifiedCardActions/UnifiedCardActions";
import { useContentCardState } from "./hooks/useContentCardState";

interface ContentCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  id?: string; // Arweave ID or NFT Nat ID string
  owner?: string; // Keep original owner string for NftDataFooter (might be useful for display)
  showStats?: boolean;
  onToggleStats?: (open: boolean) => void;
  predictions?: any;
  footer?: React.ReactNode;
  component?: string;
  isFromAssetCanister?: boolean;
  parentShelfId?: string;
  itemId?: number;
  currentShelfId?: string;
  initialContentType?: 'Arweave' | 'Nft'; // Specifies the *context* this card is rendered in
}

export function ContentCard({
  children,
  onClick,
  id, // Arweave ID or NFT Nat ID string
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
  const [showDetails, setShowDetails] = useState(false);

  // --- Use the Custom Hook ---
  const {
    finalContentId,
    finalContentType,
    isOwnedByUser,
    ownerPrincipal,
    isSafeForMinting
  } = useContentCardState({ id, initialContentType, predictions });

  // --- Rendering ---

  return (
    <>
      <Card
        className={`group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col relative bg-white dark:bg-gray-900 h-full ${component === "Emporium" ? "mb-20 rounded-2xl" : "overflow-hidden"}`}
        onClick={onClick}
      >
        <CardContent className="flex flex-col items-start p-0">
          <AspectRatio ratio={1} className="w-full relative">
            <div className={`flex items-center justify-center bg-gray-50 dark:bg-gray-800 ${component === "Emporium" ? " border-gray-900 dark:border-gray-900 rounded-[30px]" : "overflow-hidden h-full "}`} >
              {children}
            </div>
            {finalContentId && (
              <UnifiedCardActions
                contentId={finalContentId}
                contentType={finalContentType}
                ownerPrincipal={ownerPrincipal}
                isOwned={isOwnedByUser}
                isSafeForMinting={isSafeForMinting}
                parentShelfId={parentShelfId}
                itemId={itemId}
                currentShelfId={currentShelfId}
                onToggleDetails={() => setShowDetails(prev => !prev)}
                showDetails={showDetails}
                className="absolute top-1.5 right-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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