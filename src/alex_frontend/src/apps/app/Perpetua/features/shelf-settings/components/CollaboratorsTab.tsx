import React from "react";
import { CollaboratorsList } from "../../shelf-collaboration/components/CollaboratorsList";
import { PublicAccessSection } from "./PublicAccessSection";

interface CollaboratorsTabProps {
  shelfId: string;
  isOwner: boolean;
  isPublic: boolean;
  isPublicLoading: boolean;
  isTogglingPublic: boolean;
  handlePublicAccessToggle: (enabled: boolean) => Promise<void>;
}

export const CollaboratorsTab: React.FC<CollaboratorsTabProps> = ({ 
  shelfId, 
  isOwner,
  isPublic,
  isPublicLoading,
  isTogglingPublic,
  handlePublicAccessToggle
}) => {
  return (
    <div className="space-y-4 focus-visible:outline-none">
      <div className="bg-card rounded-lg p-4">
        <PublicAccessSection
          isOwner={isOwner}
          isPublic={isPublic}
          isPublicLoading={isPublicLoading}
          isTogglingPublic={isTogglingPublic}
          shelfId={shelfId}
          handlePublicAccessToggle={handlePublicAccessToggle}
        />
      </div>

      <div className="bg-card rounded-lg p-4">
        <CollaboratorsList shelfId={shelfId} />
      </div>
    </div>
  );
}; 