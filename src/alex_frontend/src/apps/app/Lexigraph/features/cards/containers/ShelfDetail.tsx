import React from 'react';
import { Button } from "@/lib/components/button";
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { ArrowLeft, Edit, Plus, X } from "lucide-react";
import { renderBreadcrumbs } from "../../../utils";
import { SlotCard } from '../components/SlotCard';
import { ShelfDetailUIProps } from '../types/types';
import { PrincipalDisplay } from '@/apps/Modules/shared/components/PrincipalDisplay';

export const ShelfDetailUI: React.FC<ShelfDetailUIProps> = ({
  shelf,
  orderedSlots,
  isEditMode,
  editedSlots,
  isPublic,
  onBack,
  onAddSlot,
  onViewSlot,
  onEnterEditMode,
  onCancelEditMode,
  onSaveSlotOrder,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  settingsButton
}) => {
  const backButtonLabel = "Back";
  const breadcrumbItems = [
    { label: backButtonLabel, onClick: onBack },
    { label: shelf.title }
  ];

  const slots = isEditMode ? editedSlots : orderedSlots;
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSlotOrder();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="self-start flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        {renderBreadcrumbs(breadcrumbItems)}
      </div>
      
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">{shelf.title}</h2>
            <p className="text-muted-foreground">{shelf.description}</p>
            <div className="mt-2 flex items-center gap-2">
              {isPublic && (
                <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                  Public
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                Owner: <PrincipalDisplay principal={shelf.owner} />
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditMode && !isPublic && settingsButton}
            
            {!isEditMode && !isPublic && (
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={onEnterEditMode}
              >
                <Edit className="w-4 h-4" />
                Reorder
              </Button>
            )}
            
            {isEditMode && (
              <>
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={onCancelEditMode}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                
                <Button
                  variant="primary"
                  className="flex items-center gap-1"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Order'}
                </Button>
              </>
            )}
            
            {!isPublic && onAddSlot && (
              <Button
                variant="primary"
                className="flex items-center gap-1"
                onClick={() => onAddSlot(shelf)}
              >
                <Plus className="w-4 h-4" />
                Add Slot
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          {slots.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              This shelf is empty.
              {!isPublic && onAddSlot && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-1 mx-auto"
                    onClick={() => onAddSlot(shelf)}
                  >
                    <Plus className="w-4 h-4" />
                    Add First Slot
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <ContentGrid>
              {slots.map(([slotKey, slot], index) => (
                <SlotCard
                  key={`slot-${slotKey}`}
                  slot={slot}
                  slotId={slotKey}
                  onClick={() => onViewSlot(slotKey)}
                  isEditMode={isEditMode}
                  dragHandlers={
                    isEditMode
                      ? {
                          onDragStart: () => handleDragStart(index),
                          onDragOver: (e) => handleDragOver(e, index),
                          onDragEnd: handleDragEnd,
                          onDrop: (e) => handleDrop(e, index),
                        }
                      : undefined
                  }
                />
              ))}
            </ContentGrid>
          )}
        </div>
      </div>
    </div>
  );
}; 