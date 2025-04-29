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
        className={`group flex flex-col relative bg-white dark:bg-gray-900 h-full ${component === "Emporium" ? "mb-20 rounded-2xl" : "overflow-hidden"}`}
        // Entire card is clickable
        onClick={onClick}
      >
        {/* Main content area */}
        <CardContent className="flex flex-col items-start p-0 flex-grow">
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
                onToggleDetails={() => {}}
                showDetails={false}
                className="absolute top-1.5 right-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              />
            )}
          </AspectRatio>
        </CardContent>

        {/* Footer area removed unless custom footer is provided */}
        {footer && (
           <div className="p-1.5 pt-1 w-full">
             {/* Render only custom footer content if provided */} 
             {footer}
           </div>
        )}
      </Card>
    </>
  );
} 