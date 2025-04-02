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
    // Extract and transform IDs if needed
    const itemId = parseId(params.itemId);
    const referenceItemId = params.referenceItemId === null ? null : parseId(params.referenceItemId);
    
    // Transform the complete item order array if provided
    const newItemOrder = params.newItemOrder ? params.newItemOrder.map(parseId) : undefined;
    
    // Map fields according to the provided mapping
    const mappedParams: Record<string, any> = {
      ...params,
      itemId,
      referenceItemId,
    };
    
    // Create the final payload with mapped field names
    const payload: Record<string, any> = {};
    
    // Apply field mapping
    Object.entries(mappedParams).forEach(([key, value]) => {
      const mappedKey = fieldMapping[key] || key;
      payload[mappedKey] = value;
    });
    
    // Special handling for array fields that need mapping
    if (params.newItemOrder) {
      const orderFieldName = fieldMapping['newItemOrder'] || 'newItemOrder';
      payload[orderFieldName] = newItemOrder;
    }
    
    // Call the provided action creator with transformed parameters
    return actionCreator(payload as T);
  };
} 