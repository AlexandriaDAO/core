import React from "react";
import { Input } from "@/lib/components/input";
import { Button } from "@/lib/components/button";
import { Badge } from "@/lib/components/badge";
import { Alert, AlertDescription } from "@/lib/components/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import { PlusCircle, X, AlertCircle, InfoIcon } from "lucide-react";
import { TagsSectionProps } from "../types";
import { MAX_TAGS, MAX_TAG_LENGTH } from "../utils/tagValidation";

export const TagsSection: React.FC<TagsSectionProps> = ({
  isOwner,
  tags,
  setTags,
  tagInput,
  setTagInput,
  tagError,
  tagLimitReached,
  isAddingTag,
  removingTagId,
  handleAddTag,
  handleRemoveTag,
  handleTagKeyPress,
  onUpdateMetadata
}) => {
  return (
    <div className="font-serif">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-muted-foreground font-serif">Tags</h4>
          <Badge variant="outline" className={`text-xs font-normal ${tags.length >= MAX_TAGS ? "bg-orange-100 border-orange-300 text-orange-700" : "bg-primary/5"}`}>
            {tags.length}/{MAX_TAGS}
          </Badge>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <InfoIcon size={14} className="text-muted-foreground hover:text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[260px] font-serif">
                <p>Tags must:</p>
                <ul className="list-disc pl-4 text-xs mt-1">
                  <li>Be {MAX_TAG_LENGTH} characters or less</li>
                  <li>Not contain spaces or special characters</li>
                  <li>Have at least one letter or number</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {(isOwner || onUpdateMetadata) && (
        <>
          {(tagLimitReached || tagError) && (
            <Alert variant={tagLimitReached ? "default" : "destructive"} className="py-2 mb-2 mt-2 font-serif">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {tagLimitReached ? `Maximum ${MAX_TAGS} tags allowed` : tagError}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <div className="relative flex-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder={tags.length >= MAX_TAGS ? "Tag limit reached" : "Add a tag"}
                className={`pr-16 ${tags.length >= MAX_TAGS ? "opacity-50" : ""} font-serif`}
                disabled={tags.length >= MAX_TAGS || isAddingTag || !!removingTagId}
                maxLength={MAX_TAG_LENGTH + 5}
              />
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleAddTag}
                className="absolute right-0 top-0 h-full px-3 flex items-center gap-1 text-xs font-medium hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                disabled={!tagInput.trim() || tags.length >= MAX_TAGS || isAddingTag || !!removingTagId}
              >
                {isAddingTag ? (
                  <>
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" role="status" aria-label="loading"></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusCircle size={14} />
                    Add
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-3 p-2 bg-background min-h-[40px] rounded-md border">
            {tags.length === 0 ? (
              <p className="w-full text-center text-sm text-muted-foreground py-1 font-serif">
                No tags added yet
              </p>
            ) : (
              tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className={`bg-primary/10 text-primary pl-2 pr-1 py-1 flex items-center gap-1 font-serif ${removingTagId === tag ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {tag}
                  {removingTagId === tag ? (
                    <span className="ml-1 animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" role="status" aria-label="removing tag"></span>
                  ) : (
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full hover:bg-primary/20 p-0.5 disabled:opacity-50"
                      aria-label={`Remove tag ${tag}`}
                      disabled={isAddingTag || !!removingTagId}
                    >
                      <X size={14} />
                    </button>
                  )}
                </Badge>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}; 