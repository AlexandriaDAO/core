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
  // Get path information
  const { isUserView, userId, backButtonLabel } = parsePathInfo(window.location.pathname);
  
  // Navigate to shelf owner's page
  const goToOwnerShelves = () => {
    const targetUser = isUserView && userId ? userId : shelf.owner.toString();
    window.location.href = buildRoutes.user(targetUser);
  };
  
  // Format user information for breadcrumb display
  const getUserBreadcrumb = () => {
    const id = isUserView && userId ? userId : shelf.owner.toString();
    return {
      id,
      label: isUserView && userId 
        ? `User ${userId.slice(0, 8)}...` 
        : `${shelf.owner.toString().slice(0, 8)}...`
    };
  };
  
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };
  
  const userBreadcrumb = getUserBreadcrumb();
  
  return (
    <div className="flex flex-col w-full font-serif">
      {/* Breadcrumb navigation bar */}
      <div className="flex items-center gap-2 py-2">
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
              className="p-0 h-auto text-sm hover:bg-transparent"
              title={`View all shelves by ${userBreadcrumb.id}`}
            >
              <User className="w-3 h-3 mr-1" />
              {userBreadcrumb.label}
            </Button>
            
            <span className="mx-1 text-muted-foreground">/</span>
            <span className="font-medium">{shelf.title}</span>
          </div>
        </div>
      </div>
      
      {/* Shelf title and info */}
      <div className="py-2">
        <h2 className="text-2xl font-bold mb-1 font-serif">{shelf.title}</h2>
        {shelf.description && (
          <p className="text-muted-foreground font-serif">{shelf.description}</p>
        )}
        <div className="mt-2 flex items-center text-xs text-muted-foreground font-serif">
          Owner: <PrincipalDisplay principal={shelf.owner} />
        </div>
      </div>
    </div>
  );
};

export default ShelfViewHeader; 