import React, { useMemo } from 'react';
import { Button } from "@/lib/components/button";
import { ArrowLeft, User } from "lucide-react";
import { parsePathInfo } from "../../../routes";
import { buildRoutes } from "../../../routes";
import { useUsername } from '@/hooks/useUsername';
import { Principal } from '@dfinity/principal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { UnifiedCardActions } from '@/apps/Modules/shared/components/UnifiedCardActions/UnifiedCardActions';
import { NftManagerActor } from '@/actors';

interface ShelfViewHeaderProps {
  shelf: any;
  onBack: (() => void) | undefined;
}

export const ShelfViewHeader: React.FC<ShelfViewHeaderProps> = ({
  shelf,
  onBack
}) => {
  const { isUserView, userId, backButtonLabel } = parsePathInfo(window.location.pathname);

  const ownerPrincipalString = useMemo(() => {
    if (shelf?.owner instanceof Principal) {
      return shelf.owner.toText();
    }
    return String(shelf?.owner || '');
  }, [shelf?.owner]);

  const { username: ownerUsername, isLoading: isLoadingOwnerUsername } = useUsername(ownerPrincipalString);

  const { user } = useSelector((state: RootState) => state.auth);
  const currentUserPrincipalString = useMemo(() => {
    return user?.principal ? String(user.principal) : undefined;
  }, [user?.principal]);

  const isOwned = useMemo(() => {
    if (!currentUserPrincipalString || !ownerPrincipalString) return false;
    return currentUserPrincipalString === ownerPrincipalString;
  }, [currentUserPrincipalString, ownerPrincipalString]);

  const shelfOwnerPrincipal = useMemo(() => {
    if (shelf?.owner instanceof Principal) {
      return shelf.owner;
    }
    if (ownerPrincipalString) {
      try {
        return Principal.fromText(ownerPrincipalString);
      } catch (e) {
        console.error("Failed to parse ownerPrincipalString into Principal:", e);
        return undefined;
      }
    }
    return undefined;
  }, [shelf?.owner, ownerPrincipalString]);
  
  const goToOwnerShelves = () => {
    const targetUser = isUserView && userId ? userId : ownerPrincipalString;
    if (targetUser) window.location.href = buildRoutes.user(targetUser);
  };
  
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };
  
  const userBreadcrumbDisplay = isLoadingOwnerUsername 
    ? 'Loading user...' 
    : ownerUsername || (ownerPrincipalString ? `${ownerPrincipalString.slice(0,5)}...${ownerPrincipalString.slice(-3)}` : 'Unknown Owner');

  const ownerLinkTooltip = `View all shelves by ${ownerUsername || ownerPrincipalString || 'this user'}`;

  return (
    <div className="flex flex-col w-full font-serif relative z-20">
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
          
          {ownerPrincipalString && (
            <div className="flex items-center px-3 text-sm">
              <Button
                variant="ghost"
                onClick={goToOwnerShelves}
                className="p-0 h-auto text-sm hover:bg-transparent"
                title={ownerLinkTooltip}
                disabled={isLoadingOwnerUsername}
              >
                <User className="w-3 h-3 mr-1" />
                {userBreadcrumbDisplay}
              </Button>
              
              <span className="mx-1 text-muted-foreground">/</span>
              <span className="font-medium truncate max-w-[200px] sm:max-w-[300px]" title={shelf?.title}>{shelf?.title}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Shelf title and info */}
      <div className="py-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold font-serif">{shelf?.title}</h2>
          {shelf && shelf.shelf_id && (
            <NftManagerActor>
                <UnifiedCardActions
                  contentId={shelf.shelf_id}
                  contentType="Shelf"
                  isOwned={isOwned}
                  ownerPrincipal={shelfOwnerPrincipal}
                  currentShelfId={shelf.shelf_id}
                  containerClassName=""
                />
            </NftManagerActor>
          )}
        </div>
        {shelf?.description && (
          <p className="text-muted-foreground font-serif mt-1">{shelf.description}</p>
        )}
        {ownerPrincipalString && (
            <div className="mt-2 flex items-center text-xs text-muted-foreground font-serif">
            Owner: 
            {isLoadingOwnerUsername 
                ? <span className="ml-1">Loading...</span> 
                : <span className="ml-1 font-medium text-primary cursor-pointer hover:underline" onClick={goToOwnerShelves} title={ownerLinkTooltip}>{ownerUsername || ownerPrincipalString}</span>}
            </div>
        )}
      </div>
    </div>
  );
};

export default ShelfViewHeader; 