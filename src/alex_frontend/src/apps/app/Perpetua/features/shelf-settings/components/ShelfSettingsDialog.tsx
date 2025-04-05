import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/lib/components/dialog";
import { Settings, Users, Tag } from "lucide-react";
import { Shelf } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { useShelfMetadata } from "../hooks";
import { ShelfMetricsDisplay } from "./ShelfMetricsDisplay";
import { CollaboratorsList } from "../../shelf-collaboration/components/CollaboratorsList";
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { selectIsOwner } from '@/apps/app/Perpetua/state/perpetuaSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { Badge } from "@/lib/components/badge";

interface ShelfSettingsDialogProps {
  shelf: Shelf;
  onRebalance?: (shelfId: string) => Promise<void>;
  onUpdateMetadata?: (shelfId: string, title: string, description?: string, tags?: string[]) => Promise<boolean>;
  className?: string;
}

export const ShelfSettingsDialog: React.FC<ShelfSettingsDialogProps> = ({ 
  shelf,
  onRebalance,
  onUpdateMetadata,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const isOwner = useAppSelector(selectIsOwner(shelf.shelf_id));
  
  const {
    isEditing,
    setIsEditing,
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    tagInput,
    setTagInput,
    handleAddTag,
    handleRemoveTag,
    handleSaveMetadata
  } = useShelfMetadata(shelf, onUpdateMetadata);

  // Handle key press for tag input
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
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
        <DialogHeader>
          <DialogTitle>Shelf Settings</DialogTitle>
          <DialogDescription>
            Configure settings and manage collaborators for this shelf
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="py-4"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="collaborators" className="flex items-center gap-1">
              <Users size={16} />
              Collaborators
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            {!isEditing ? (
              <div className="flex justify-between">
                <div>
                  <p><strong>Title:</strong> {shelf.title}</p>
                  <p><strong>Description:</strong> {shelf.description?.[0] || "None"}</p>
                  {shelf.tags && shelf.tags.length > 0 && (
                    <div className="mt-2">
                      <p><strong>Tags:</strong></p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {shelf.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {(isOwner || onUpdateMetadata) && (
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
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Add a tag"
                      className="w-full"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddTag}
                      className="flex items-center gap-1"
                      disabled={!tagInput.trim()}
                    >
                      <Tag size={16} />
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button 
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
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
              isExpanded={isOpen && activeTab === "general"}
              onRebalance={onRebalance}
            />
          </TabsContent>
          
          <TabsContent value="collaborators">
            <CollaboratorsList shelfId={shelf.shelf_id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 