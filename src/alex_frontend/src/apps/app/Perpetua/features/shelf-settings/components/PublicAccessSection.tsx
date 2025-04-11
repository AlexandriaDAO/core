import React from "react";
import { Switch } from "@/lib/components/switch";
import { Alert, AlertDescription } from "@/lib/components/alert";
import { Globe, Lock, AlertCircle } from "lucide-react";
import { PublicAccessSectionProps } from "../types";

export const PublicAccessSection: React.FC<PublicAccessSectionProps> = ({
  isOwner,
  isPublic,
  isPublicLoading,
  isTogglingPublic,
  shelfId,
  handlePublicAccessToggle
}) => {
  if (!isOwner) return null;

  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium">Public Access</h3>
          <p className="text-xs text-muted-foreground">
            Allow anyone to edit this shelf without requiring explicit permission
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isPublicLoading || isTogglingPublic ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></span>
              <span className="text-xs">{isTogglingPublic ? 'Saving...' : 'Loading...'}</span>
            </div>
          ) : (
            <>
              <span className="text-xs font-medium flex items-center gap-1">
                {isPublic ? (
                  <>
                    <Globe size={14} className="text-green-500" />
                    <span className="text-green-600">Public</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} className="text-amber-500" />
                    <span className="text-amber-600">Private</span>
                  </>
                )}
              </span>
              <Switch
                checked={isPublic}
                onCheckedChange={handlePublicAccessToggle}
                aria-label="Toggle public access"
                disabled={isPublicLoading || isTogglingPublic}
              />
            </>
          )}
        </div>
      </div>
      
      {isPublic && (
        <Alert variant="default" className="mt-3 bg-blue-50 border-blue-200 text-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs">
            Anyone with the link can now edit this shelf without logging in. 
            This can be useful for community shelves and public collections.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 