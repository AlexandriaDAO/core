import React from "react";
import { CollaboratorsList } from "../../shelf-collaboration/components/CollaboratorsList";
import { CollaboratorsTabProps } from "../types";

export const CollaboratorsTab: React.FC<CollaboratorsTabProps> = ({ shelfId }) => {
  return (
    <div className="bg-card rounded-lg p-4">
      <CollaboratorsList shelfId={shelfId} />
    </div>
  );
}; 