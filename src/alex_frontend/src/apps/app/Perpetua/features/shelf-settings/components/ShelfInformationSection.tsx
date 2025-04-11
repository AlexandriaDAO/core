import React from "react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Textarea } from "@/lib/components/textarea";
import { Edit2, Check, Save } from "lucide-react";
import { ShelfInformationSectionProps } from "../types";

export const ShelfInformationSection: React.FC<ShelfInformationSectionProps> = ({
  shelf,
  title,
  setTitle,
  description,
  setDescription,
  isOwner,
  editingField,
  toggleFieldEdit,
  isDirty,
  isSavingMetadata,
  handleSaveChanges,
  handleCancelChanges,
  onUpdateMetadata
}) => {
  return (
    <div className="bg-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Shelf Information</h3>
        
        {(isOwner || onUpdateMetadata) && (
          <div className="space-x-2">
            {isDirty && (
              <>
                <Button 
                  variant="outline" 
                  scale="sm"
                  onClick={handleCancelChanges}
                  disabled={isSavingMetadata}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  scale="sm"
                  onClick={handleSaveChanges}
                  disabled={isSavingMetadata || !isDirty}
                  className="flex items-center gap-1"
                >
                  <Save size={14} />
                  {isSavingMetadata ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Title Field */}
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
            {(isOwner || onUpdateMetadata) && (
              <Button 
                variant="ghost" 
                scale="sm" 
                className="h-6 px-2"
                onClick={() => toggleFieldEdit(editingField === "title" ? null : "title")}
              >
                {editingField === "title" ? <Check size={14} /> : <Edit2 size={14} />}
              </Button>
            )}
          </div>
          
          {editingField === "title" ? (
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full mt-1"
              autoFocus
            />
          ) : (
            <p className="text-base mt-1">{title}</p>
          )}
        </div>
        
        {/* Description Field */}
        <div> 
          <div className="flex items-center justify-between"> 
            <h4 className="text-sm font-medium text-muted-foreground">Description</h4> 
            {(isOwner || onUpdateMetadata) && ( 
              <Button  
                variant="ghost"  
                scale="sm"  
                className="h-6 px-2" 
                onClick={() => toggleFieldEdit(editingField === "description" ? null : "description")} 
              > 
                {editingField === "description" ? <Check size={14} /> : <Edit2 size={14} />} 
              </Button> 
            )} 
          </div> 
            
          {editingField === "description" ? ( 
            <Textarea  
              value={description}  
              onChange={(e) => setDescription(e.target.value)}  
              className="w-full mt-1 resize-none" 
              rows={3} 
              autoFocus 
            /> 
          ) : ( 
            <p className="text-base mt-1">{description || "None"}</p> 
          )} 
        </div>
      </div>
    </div>
  );
}; 