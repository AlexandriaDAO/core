import React from "react";
import { Card, CardContent } from "@/lib/components/card";
import { AspectRatio } from "@/lib/components/aspect-ratio";
import { UnifiedCardActions } from "@/apps/Modules/shared/components/UnifiedCardActions/UnifiedCardActions";
import { useContentCardState } from "./hooks/useContentCardState";

interface ContentCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  id?: string; // Arweave ID or NFT Nat ID string
  owner?: string; // Arweave owner string (kept for potential future use, but not displayed here)
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
  owner, // Keep owner prop, but don't use it directly here
  predictions,
  footer, // Keep footer prop
  component,
  isFromAssetCanister,
  parentShelfId,
  itemId,
  currentShelfId,
  initialContentType = 'Arweave' // Default to Arweave context
}: ContentCardProps) {

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
        className={`group flex flex-col relative bg-white dark:bg-gray-900 h-full ${component === "Emporium" ? "mb-20 rounded-2xl" : ""}`}
        // onClick is now applied to the content area if needed, or removed if whole card isn't clickable anymore
        // Note: If the entire card should still be clickable *except* the action button,
        // you might need to move onClick to the CardContent/AspectRatio and ensure stopPropagation in UnifiedCardActions works.
      >
        {/* Action Button - Using updated bookmark design */}
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
            // We don't need to specify className now as the component has its own positioning
          />
        )}

        {/* Main content area - Apply onClick here if needed */}
        <CardContent
            className="flex flex-col items-start p-0 flex-grow"
            onClick={onClick} // Apply onClick here if the main area should be clickable
        >
          <AspectRatio ratio={1} className="w-full relative">
            <div className={`relative flex items-center justify-center bg-gray-50 dark:bg-gray-800 ${component === "Emporium" ? " border-gray-900 dark:border-gray-900 rounded-[30px] overflow-hidden" : "overflow-hidden h-full "}`} >
              {/* Children now include the hover overlay (TransactionDetails) internally */}
              {children}
            </div>
            {/* UnifiedCardActions moved outside */}
          </AspectRatio>
        </CardContent>

        {/* Footer area (unchanged) */}
        {footer && (
           <div className="p-1.5 pt-1 w-full">
             {footer}
           </div>
        )}
      </Card>
    </>
  );
} 