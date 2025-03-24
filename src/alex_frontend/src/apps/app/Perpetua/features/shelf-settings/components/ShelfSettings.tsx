import React, { useState } from 'react';
import { Button } from '@/lib/components/button';
import { Input } from '@/lib/components/input';
import { Label } from '@/lib/components/label';
import { Textarea } from '@/lib/components/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/lib/components/collapsible';
import { Settings } from 'lucide-react';
import { Shelf } from '../../../../../../../../declarations/perpetua/perpetua.did';
import { useShelfMetadata } from '../hooks/useShelfMetadata';
import { ShelfMetricsDisplay } from './ShelfMetricsDisplay';

interface ShelfSettingsProps {
  shelf: Shelf;
  onRebalance?: (shelfId: string) => Promise<void>;
  onUpdateMetadata?: (shelfId: string, title: string, description?: string) => Promise<boolean>;
  renderTriggerOnly?: boolean;
  className?: string;
}

export const ShelfSettings: React.FC<ShelfSettingsProps> = ({ 
  shelf,
  onRebalance,
  onUpdateMetadata,
  renderTriggerOnly = false,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    isEditing,
    setIsEditing,
    title,
    setTitle,
    description,
    setDescription,
    handleSaveMetadata
  } = useShelfMetadata(shelf, onUpdateMetadata);

  // If we only want to render the trigger button
  if (renderTriggerOnly) {
    return (
      <Button variant="outline" className={`flex items-center gap-1 px-3 py-1 text-sm ${className}`}>
        <Settings size={16} />
        <span>Settings</span>
      </Button>
    );
  }

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="mt-4"
    >
      <div className="flex justify-end mb-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
            <Settings size={16} />
            <span>Settings</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <div className="p-4 rounded-md bg-card border border-border">
          <h3 className="text-xl font-semibold mb-4">Shelf Settings</h3>
          
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
            isExpanded={isExpanded}
            onRebalance={onRebalance}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}; 