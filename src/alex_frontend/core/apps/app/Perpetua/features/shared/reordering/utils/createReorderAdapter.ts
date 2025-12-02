import { ReorderParams } from '../../../../types/reordering.types';

/**
 * Factory function to create reorder adapter functions
 * This eliminates duplicate adapter code between item and shelf reordering
 */
export function createReorderAdapter<T extends Record<string, any>>({
  actionCreator,
  parseId = (id) => id,
  fieldMapping = {}
}: {
  actionCreator: (params: T) => any;
  parseId?: (id: string | number) => string | number;
  fieldMapping?: Record<string, string>;
}) {
  return (params: ReorderParams) => {
    // Initialize payload
    const payload: Record<string, any> = {};

    // Always include shelfId and principal
    payload[fieldMapping?.['shelfId'] || 'shelfId'] = params.shelfId;
    payload[fieldMapping?.['principal'] || 'principal'] = params.principal;

    // Remove handling for legacy itemId field
    // if (params.itemId !== undefined && params.itemId !== null) {
    //   const key = fieldMapping?.['itemId'] || 'itemId';
    //   payload[key] = parseId(params.itemId);
    // }

    // Handle optional legacy fields (referenceItemId, before)
    if (params.referenceItemId !== undefined) {
      const key = fieldMapping?.['referenceItemId'] || 'referenceItemId';
      payload[key] = params.referenceItemId === null ? null : parseId(params.referenceItemId);
    }
    if (params.before !== undefined) {
      const key = fieldMapping?.['before'] || 'before';
      payload[key] = params.before;
    }

    // Handle optional new field (orderedItemIds)
    if (params.orderedItemIds !== undefined) {
      const key = fieldMapping?.['orderedItemIds'] || 'orderedItemIds';
      // Assuming orderedItemIds are already numbers and don't need parseId
      payload[key] = params.orderedItemIds;
    }

    // Handle optional optimistic update field (newItemOrder)
    if (params.newItemOrder !== undefined) {
      const key = fieldMapping?.['newItemOrder'] || 'newItemOrder';
      payload[key] = params.newItemOrder.map(parseId);
    }

    // Log the final payload being sent to the action creator
    // console.log(`[createReorderAdapter] Final payload:`, payload);

    // Call the provided action creator with the constructed payload
    return actionCreator(payload as T);
  };
} 