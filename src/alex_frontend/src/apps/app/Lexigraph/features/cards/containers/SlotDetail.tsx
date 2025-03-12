import React from "react";
import { Button } from "@/lib/components/button";
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { ArrowLeft } from "lucide-react";
import { renderBreadcrumbs, isShelfContent, SlotContentRenderer, isNftContent } from "../../../utils";
import { SlotDetailProps } from '../types/types';
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const SlotDetail: React.FC<SlotDetailProps> = ({
  slot,
  shelf,
  slotKey,
  onBack,
  onBackToShelf
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { nfts } = useSelector((state: RootState) => state.nftData);
  
  // Check if the slot contains an NFT and if it's owned by the current user
  const isOwned = React.useMemo(() => {
    if (isNftContent(slot.content)) {
      const nftId = slot.content.Nft;
      return user && nfts[nftId]?.principal === user.principal ? true : false;
    }
    return false;
  }, [slot, user, nfts]);

  const backButtonLabel = "Back";
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        {renderBreadcrumbs([
          { label: backButtonLabel, onClick: onBack },
          { label: shelf.title, onClick: () => onBackToShelf(shelf.shelf_id) },
          { label: `Slot ${slotKey}` }
        ])}
        
        <div className="mt-2">
          <h2 className="text-2xl font-bold">Slot {slotKey}</h2>
          <div className="text-sm text-muted-foreground">
            From shelf: <span className="font-medium">{shelf.title}</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <ContentCard
            id={slot.id.toString()}
            component="Lexigraph"
            isOwned={isOwned}
            onClick={() => {
              if (isShelfContent(slot.content)) {
                const shelfContent = slot.content;
                onBackToShelf(shelfContent.Shelf);
              }
            }}
          >
            <div className="p-4 w-full h-full overflow-auto">
              <SlotContentRenderer 
                slot={slot} 
                showFull={true}
                onBackToShelf={onBackToShelf}
              />
            </div>
          </ContentCard>
        </div>
      </div>
    </div>
  );
}; 