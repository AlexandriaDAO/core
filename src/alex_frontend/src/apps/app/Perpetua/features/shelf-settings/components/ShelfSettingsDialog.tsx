import React, { useState, useEffect } from "react";
import { Button } from "@/lib/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/lib/components/dialog";
import { Settings } from "lucide-react";
import { toggleShelfPublicAccess, checkShelfPublicAccess } from '@/apps/app/Perpetua/state/thunks/publicAccessThunks';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { selectIsOwner, selectIsShelfPublic, selectPublicAccessLoading } from '@/apps/app/Perpetua/state/perpetuaSlice';
import { toast } from "sonner";
import { ShelfSettingsDialogProps } from "../types";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { PublicAccessSection } from "./PublicAccessSection";

export const ShelfSettingsDialog: React.FC<ShelfSettingsDialogProps> = ({ 
  shelf,
  onUpdateMetadata,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const isOwner = Boolean(useAppSelector(selectIsOwner(shelf.shelf_id)));
  const isPublic = Boolean(useAppSelector(selectIsShelfPublic(shelf.shelf_id)));
  const isPublicLoading = Boolean(useAppSelector(selectPublicAccessLoading(shelf.shelf_id)));
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);

  // Load public status when dialog opens
  useEffect(() => {
    if (isOpen) {
      dispatch(checkShelfPublicAccess(shelf.shelf_id));
    }
  }, [dispatch, shelf.shelf_id, isOpen]);

  // Handle public access toggle
  const handlePublicAccessToggle = async (enabled: boolean) => {
    if (isTogglingPublic) return;
    
    setIsTogglingPublic(true);
    try {
      const resultAction = await dispatch(toggleShelfPublicAccess({
        shelfId: shelf.shelf_id,
        isPublic: enabled
      }));
      
      if (toggleShelfPublicAccess.fulfilled.match(resultAction)) {
        toast.success(enabled 
          ? "This shelf is now publicly editable by anyone" 
          : "This shelf is now private");
      } else if (toggleShelfPublicAccess.rejected.match(resultAction)) {
        toast.error(resultAction.payload as string || "Failed to update public access");
      }
    } catch (error) {
      toast.error("An error occurred while updating public access");
    } finally {
      setIsTogglingPublic(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`flex items-center gap-1 px-3 py-1 text-sm ${className}`}>
          <Settings size={16} />
          <span>Settings</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="mb-4">
          <DialogTitle>Shelf Settings</DialogTitle>
          <DialogDescription>
            Configure general settings and public access for this shelf
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <GeneralSettingsTab
            shelf={shelf}
            isOwner={isOwner}
            onUpdateMetadata={onUpdateMetadata}
          />
          
          <div className="bg-card rounded-lg p-4">
            <PublicAccessSection
              shelfId={shelf.shelf_id}
              isOwner={isOwner}
              isPublic={isPublic}
              isPublicLoading={isPublicLoading}
              isTogglingPublic={isTogglingPublic}
              handlePublicAccessToggle={handlePublicAccessToggle}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 