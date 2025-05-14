import { ShelfPublic, Item } from "@/../../declarations/perpetua/perpetua.did";

/**
 * Retrieves items from a shelf, sorted according to their positions.
 *
 * @param shelf - The ShelfPublic object.
 * @returns An array of Item objects, sorted by their defined positions.
 *          Returns an empty array if items or positions are missing or malformed.
 */
export const getOrderedItems = (shelf: ShelfPublic): Item[] => {
  if (!shelf || !shelf.items || !shelf.item_positions) {
    return [];
  }

  // Create a map of item ID to Item object for quick lookup.
  // shelf.items is vec record { nat32; Item }, so itemRecord[0] is the ID (nat32)
  // and itemRecord[1] is the Item object.
  const itemsMap = new Map<number, Item>();
  for (const itemRecord of shelf.items) {
    const itemId = Number(itemRecord[0]); // Convert nat32 to number
    const itemData = itemRecord[1];
    if (itemId !== undefined && itemData) {
      itemsMap.set(itemId, itemData);
    }
  }

  // Sort item_positions. Each element is [nat32, float64].
  // We sort by the float64 value.
  const sortedPositions = [...shelf.item_positions].sort((a, b) => {
    // a[0] is id (nat32), a[1] is position (float64)
    const posA = a[1];
    const posB = b[1];
    return posA - posB;
  });

  // Map sorted positions back to Item objects.
  const orderedItems: Item[] = [];
  for (const positionRecord of sortedPositions) {
    const itemId = Number(positionRecord[0]); // Convert nat32 to number
    const item = itemsMap.get(itemId);
    if (item) {
      orderedItems.push(item);
    }
  }

  return orderedItems;
}; 