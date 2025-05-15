import React from 'react';
// Corrected import path for ShelfLinkItem
import { ShelfLinkItem } from '../../../../app/Perpetua/features/shelf-settings/components/ShelfLinkItem'; 

interface NftAppearsInListProps {
  appearsIn?: string[]; // Array of shelf IDs
  loading?: boolean;
  error?: string | null;
}

const NftAppearsInList: React.FC<NftAppearsInListProps> = ({ appearsIn, loading, error }) => {
  if (loading) {
    return <p>Loading shelves...</p>;
  }

  if (error) {
    return <p>Error loading shelves: {error}</p>;
  }

  if (!appearsIn || appearsIn.length === 0) {
    return <p>Not found in any shelves.</p>; // This message can be styled or improved if needed
  }

  return (
    <div>
      <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Appears In:</h4>
      {/* Applying similar layout as ShelfInformationDialog for included shelves */}
      <ul className="list-none p-0 flex flex-wrap gap-2">
        {appearsIn.map((shelfId) => (
          <li key={shelfId} className="">
            <ShelfLinkItem shelfId={shelfId} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NftAppearsInList;
