import React, { useEffect, useState } from "react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/lib/components/collapsible";
import { Settings } from "lucide-react";
import { Shelf } from "../../../../../declarations/lexigraph/lexigraph.did";
import { getActorLexigraph } from "@/features/auth/utils/authUtils";

interface ShelfSettingsProps {
  shelf: Shelf;
  onRebalance?: (shelfId: string) => Promise<void>;
  onUpdateMetadata?: (shelfId: string, title: string, description?: string) => Promise<boolean>;
}

export const ShelfSettings: React.FC<ShelfSettingsProps> = ({ 
  shelf,
  onRebalance,
  onUpdateMetadata
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(shelf.title);
  const [description, setDescription] = useState(shelf.description?.[0] || "");
  const [isExpanded, setIsExpanded] = useState(false);

  // Load metrics when component mounts
  useEffect(() => {
    const loadMetrics = async () => {
      if (!isExpanded) return; // Only load metrics when expanded
      
      try {
        setLoading(true);
        const lexigraphActor = await getActorLexigraph();
        const result = await lexigraphActor.get_shelf_position_metrics(shelf.shelf_id);
        if ("Ok" in result) {
          setMetrics(result.Ok);
        }
      } catch (error) {
        console.error("Failed to load metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMetrics();
  }, [shelf.shelf_id, isExpanded]);
  
  const handleSaveMetadata = async () => {
    if (onUpdateMetadata) {
      const success = await onUpdateMetadata(
        shelf.shelf_id, 
        title, 
        description || undefined
      );
      if (success) {
        setIsEditing(false);
      }
    }
  };

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

          {/* Metrics/rebalance section */}
          <div className="mt-6">
            <h4 className="text-lg font-medium mb-2">Slot Position Metrics</h4>
            {loading ? (
              <div>Loading metrics...</div>
            ) : metrics ? (
              <div className="mb-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span>Slots:</span>
                  <span>{metrics.slot_count.toString()}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Min gap:</span>
                  <span>{metrics.min_gap}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Max gap:</span>
                  <span>{metrics.max_gap}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Avg gap:</span>
                  <span>{metrics.avg_gap.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Rebalance count:</span>
                  <span>{metrics.rebalance_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Needs rebalance:</span>
                  <span>{metrics.needs_rebalance ? "Yes" : "No"}</span>
                </div>
              </div>
            ) : (
              <div className="mb-3">No metrics available</div>
            )}
            
            {onRebalance && (
              <button 
                onClick={() => onRebalance(shelf.shelf_id)}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200"
                disabled={metrics ? !metrics.needs_rebalance : false}
              >
                Rebalance Slots
              </button>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Rebalancing optimizes the internal position values for better performance with many reorderings.
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}; 