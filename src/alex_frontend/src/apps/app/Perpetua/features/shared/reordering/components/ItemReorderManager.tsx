import React from 'react';
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";
import { useItemReordering } from '../hooks/useItemReordering';
import { ItemReorderManagerProps } from '../../../../types/reordering.types';

const ItemReorderManager: React.FC<ItemReorderManagerProps> = ({
  shelf,
  orderedItems,
  hasEditAccess,
  children
}) => {
  // All reordering logic is contained in this hook
  const reorderingProps = useItemReordering({
    shelf,
    items: orderedItems,
    hasEditAccess
  });

  return children(reorderingProps);
};

export default ItemReorderManager; 