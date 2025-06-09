import React from 'react';
import { Link } from '@tanstack/react-router';
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
    <li className="inline-block mr-2 mb-2">
      <Link 
        to={linkPath} 
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium px-3 py-1.5 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap"
        title={`Go to shelf: ${displayText}`}
      >
        {displayText}
      </Link>
    </li>
  );
}; 