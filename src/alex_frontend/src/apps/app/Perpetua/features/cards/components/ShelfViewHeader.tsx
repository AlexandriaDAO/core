import React from 'react';
import { Button } from "@/lib/components/button";
import { ArrowLeft, User } from "lucide-react";
import { PrincipalDisplay } from '@/apps/Modules/shared/components/PrincipalDisplay';
import { parsePathInfo } from "../../../routes";
import { buildRoutes } from "../../../routes";

interface ShelfViewHeaderProps {
  shelf: any;
  onBack: (() => void) | undefined;
}

export const ShelfViewHeader: React.FC<ShelfViewHeaderProps> = ({
  shelf,
  onBack
}) => {
  // Check if we're in a user-specific view
  const pathInfo = parsePathInfo(window.location.pathname);
  const isUserView = pathInfo.isUserView;
  const userId = pathInfo.userId;
  const backButtonLabel = pathInfo.backButtonLabel;

  // Navigate to owner's shelves
  const goToOwnerShelves = () => {
    // If we're already in a user view, use that user ID
    const targetUser = isUserView && userId ? userId : shelf.owner.toString();
    window.location.href = buildRoutes.user(targetUser);
  };
  
  // Get the user ID to display in the breadcrumb
  const breadcrumbUserId = isUserView && userId ? userId : shelf.owner.toString();
  const breadcrumbUserLabel = isUserView && userId 
    ? `User ${userId.slice(0, 8)}...` 
    : `${shelf.owner.toString().slice(0, 8)}...`;
  
  // Handle back button click safely
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      console.warn("Back button clicked, but no onBack callback provided");
      // Default fallback - go to previous page in history
      window.history.back();
    }
  };
  
  return (
    <>
      <div className="px-4 py-3 flex justify-between items-center w-full bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center">
          <div className="flex items-center h-8 rounded-md border border-input bg-background overflow-hidden">
            <Button 
              variant="ghost" 
              onClick={handleBackClick} 
              className="flex items-center gap-1 h-8 rounded-r-none border-r px-3 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {backButtonLabel}
            </Button>
            <div className="flex items-center px-3 text-sm">
              <Button
                variant="ghost"
                onClick={goToOwnerShelves}
                className="ml-1 p-0 h-auto text-sm hover:bg-transparent"
                title={`View all shelves by ${breadcrumbUserId}`}
              >
                <User className="w-3 h-3 mr-1" />
                {breadcrumbUserLabel}
              </Button>
              
              <span className="mx-1">/</span>
              <span className="font-medium">{shelf.title}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-2">
        <div className="mb-3">
          <h2 className="text-2xl font-bold">{shelf.title}</h2>
          <p className="text-muted-foreground">{shelf.description}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Owner: <PrincipalDisplay principal={shelf.owner} />
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShelfViewHeader; 