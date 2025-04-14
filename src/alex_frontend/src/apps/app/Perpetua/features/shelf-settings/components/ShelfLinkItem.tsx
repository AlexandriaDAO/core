import React from 'react';
import { Link } from 'react-router-dom';
import { useShelfById } from '../../../state/hooks/usePerpetuaSelectors';
import { buildRoutes } from '../../../routes';
import { NormalizedShelf } from '../../../state/perpetuaSlice';

interface ShelfLinkItemProps {
  shelfId: string;
}

export const ShelfLinkItem: React.FC<ShelfLinkItemProps> = ({ shelfId }) => {
  // Fetch shelf data from Redux store using the selector hook
  const shelfData = useShelfById(shelfId) as NormalizedShelf | null;

  // Construct the link path
  const linkPath = buildRoutes.shelf(shelfId);

  // Determine the display text (title or ID as fallback)
  const displayText = shelfData?.title || shelfId;

  return (
    <li>
      <Link 
        to={linkPath} 
        className="block w-full bg-muted/50 px-2 py-1 rounded text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
        title={`Go to shelf: ${displayText}`}
      >
        {displayText}
      </Link>
    </li>
  );
}; 