import React from 'react';
import { Button } from "@/lib/components/button";
import { ContentCard } from "@/apps/Modules/AppModules/contentGrid/Card";
import { ArrowLeft } from "lucide-react";
import { renderBreadcrumbs, isShelfContent, SlotContentRenderer } from "../utils";
import { SlotDetailProps } from './types';

export const SlotDetail: React.FC<SlotDetailProps> = ({
  slot,
  shelf,
  slotKey,
  onBack,
  onBackToShelf
}) => {
  const backButtonLabel = "Back";
  
  const breadcrumbItems = [
    { label: backButtonLabel, onClick: onBack },
    { label: shelf.title, onClick: () => onBackToShelf(shelf.shelf_id) },
    { label: `Slot ${slotKey}` }
  ];
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-6">
        <Button variant="outline" onClick={() => onBackToShelf(shelf.shelf_id)} className="self-start flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Shelf
        </Button>
        {renderBreadcrumbs(breadcrumbItems)}
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Slot {slotKey}</h2>
          <div className="text-sm text-muted-foreground">
            From shelf: <span className="font-medium">{shelf.title}</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <ContentCard
            id={slot.id.toString()}
            component="Lexigraph"
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