import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Settings } from "lucide-react";
import { Shelf } from "../../../../../../../../declarations/lexigraph/lexigraph.did";
import { useShelfMetadata } from "../hooks";
import { ShelfMetricsDisplay } from "./ShelfMetricsDisplay";

interface ShelfSettingsDialogProps {
  shelf: Shelf;
  onRebalance?: (shelfId: string) => Promise<void>;
  onUpdateMetadata?: (shelfId: string, title: string, description?: string) => Promise<boolean>;
  className?: string;
}

export const ShelfSettingsDialog: React.FC<ShelfSettingsDialogProps> = ({ 
  shelf,
  onRebalance,
  onUpdateMetadata,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isEditing,
    setIsEditing,
    title,
    setTitle,
    description,
    setDescription,
    handleSaveMetadata
  } = useShelfMetadata(shelf, onUpdateMetadata);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`flex items-center gap-1 px-3 py-1 text-sm ${className}`}>
          <Settings size={16} />
          <span>Settings</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Shelf Settings</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {!isEditing ? (
            <div className="flex justify-between">
              <div>
                <p><strong>Title:</strong> {shelf.title}</p>
                <p><strong>Description:</strong> {shelf.description?.[0] || "None"}</p>
              </div>
              {onUpdateMetadata && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMetadata}>
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* Metrics display component */}
          <ShelfMetricsDisplay 
            shelfId={shelf.shelf_id} 
            isExpanded={isOpen}
            onRebalance={onRebalance}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}; 