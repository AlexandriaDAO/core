import { store } from "@/store";
import { Result } from '../../utils';
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../../../declarations/perpetua/perpetua.did";

/**
 * Add an item to a shelf
 */
export async function addItemToShelf(
  actor: ActorSubclass<_SERVICE>,
  shelfId: string,
  content: string,
  type: "Nft" | "Markdown" | "Shelf",
  referenceItemId: number | null = null,
  before: boolean = true,
  collectionType?: "NFT" | "SBT"
): Promise<Result<boolean, string>> {
  try {
    console.log(`[itemService] addItemToShelf: Called with shelfId: [${shelfId}], type: [${type}], content: [${content}], refId: [${referenceItemId}], before: [${before}]`);

    // For NFT/SBT items, ensure the content is a numeric ID
    if (type === "Nft") {
      console.log(`[itemService] addItemToShelf: Processing NFT item.`);
      // Check if content is already a numeric ID
      if (!/^\d+$/.test(content)) {
        try {
          // Attempt to convert from Arweave ID using Redux store
          const state = store.getState();
          const arweaveToNftId = state.nftData?.arweaveToNftId || {};

          if (arweaveToNftId[content]) {
            // Convert to numeric ID
            const numericId = arweaveToNftId[content];
            console.log(`Converting Arweave ID ${content} to numeric NFT ID: ${numericId}`);
            content = numericId;
          } else {
            console.error(`[itemService] addItemToShelf: Invalid NFT ID format and couldn't find numeric ID for: ${content}`);
            return { Err: "Invalid NFT ID format. The ID must be numeric." };
          }
        } catch (err) {
          console.error("[itemService] addItemToShelf: Error converting Arweave ID to numeric NFT ID:", err);
          return { Err: "Invalid NFT ID format. The ID must be numeric." };
        }
      }

      // Final validation
      if (!/^\d+$/.test(content)) {
        console.error(`[itemService] addItemToShelf: Invalid NFT ID format after attempted conversion: ${content}`);
        return { Err: "Invalid NFT ID format. The ID must be numeric." };
      }

      // Use the ID length to determine token type
      const idLength = content.length;
      const isRegularNft = idLength < 80;
      console.log(`Token ID length: ${idLength} chars, type: ${isRegularNft ? 'NFT' : 'SBT'}`);

      // For regular NFTs, check if user owns it
      if (isRegularNft) {
        try {
          const state = store.getState();
          const nfts = state.nftData?.nfts || {};
          const userPrincipal = state.auth?.user?.principal?.toString();

          // Check ownership in our local state
          const nftData = nfts[content];
          if (nftData) {
            const nftOwner = nftData.principal?.toString();
            console.log(`NFT Owner: ${nftOwner || 'Unknown'}, Current User: ${userPrincipal || 'Unknown'}`);

            // Check if user owns this NFT
            if (nftOwner && userPrincipal && nftOwner !== userPrincipal) {
              console.warn(`Warning: You don't own this NFT. Backend verification will likely fail.`);
              // We don't block here - let the backend make the final decision
            }
          }

          // Normalize regular NFT ID format (not needed for SBTs)
          const normalizedId = BigInt(content).toString();
          if (normalizedId !== content) {
            console.log(`Normalizing NFT ID from ${content} to ${normalizedId}`);
            content = normalizedId;
          }
        } catch (err) {
          console.error("[itemService] addItemToShelf: Error during NFT pre-check:", err);
        }
      }
    }
    console.log(`[itemService] addItemToShelf: NFT pre-check completed or skipped.`);

    // Create item content based on type
    let itemContent;
    if (type === "Nft") {
      itemContent = { Nft: content };
    } else if (type === "Markdown") {
      itemContent = { Markdown: content };
    } else if (type === "Shelf") {
      itemContent = { Shelf: content };
    } else {
      console.error(`[itemService] addItemToShelf: Unsupported item type: ${type}`);
      return { Err: "Unsupported item type" };
    }

    console.log(`[itemService] addItemToShelf: Prepared itemContent for shelf [${shelfId}]:`, JSON.stringify(itemContent));

    // Make the backend call with prepared content
    try {
      console.log(`[itemService] addItemToShelf: Attempting actor.add_item_to_shelf for shelf [${shelfId}]...`);
      const result = await actor.add_item_to_shelf(
        shelfId,
        {
          content: itemContent,
          reference_item_id: referenceItemId === null ? [] : [referenceItemId],
          before
        }
      );
      console.log(`[itemService] addItemToShelf: Backend call for shelf [${shelfId}] completed. Raw result:`, JSON.stringify(result));

      if ("Ok" in result) {
        console.log(`[itemService] addItemToShelf: Successfully added ${type} item to shelf ${shelfId}`);
        return { Ok: true };
      } else if ("Err" in result) {
        const errMessage = result.Err;
        console.error(`[itemService] addItemToShelf: Error from backend adding ${type} item to shelf [${shelfId}]:`, errMessage);
        if (type === "Shelf" && (errMessage.includes("Circular reference") || errMessage.includes("Cannot add a shelf to itself"))) {
          return { Err: "Cannot add this shelf because it already contains the current shelf." };
        }
        return { Err: errMessage };
      }

      console.warn(`[itemService] addItemToShelf: Unknown response structure from canister for shelf [${shelfId}].`);
      return { Err: "Unknown response from canister" };
    } catch (error: any) {
      // Handle IC canister call errors
      console.error(`[itemService] addItemToShelf: IC canister call FAILED for shelf [${shelfId}]:`, error);

      const errorMessage = error?.message || String(error);
      console.error(`[itemService] addItemToShelf: Parsed error message:`, errorMessage);

      // Check for circular reference errors specifically when adding a Shelf
      if (type === "Shelf" && (errorMessage.includes("Circular reference") || errorMessage.includes("Cannot add a shelf to itself"))) {
        return { Err: "Cannot add this shelf because it already contains the current shelf." };
      }

      // If this is a regular NFT and we got an ownership/auth error, provide helpful message
      if (type === "Nft" && content.length < 80 &&
          (errorMessage.includes("Invalid principal") ||
           errorMessage.includes("CheckSequenceNotMatch") ||
           errorMessage.includes("Unauthorized"))) {

        return {
          Err: "You don't have permission to add this NFT. Only the owner of an NFT can add it to shelves. For content you don't own, you can use it as an SBT instead."
        };
      }

      // Generic auth error for other cases
      if (errorMessage.includes('Invalid principal') ||
          errorMessage.includes('CheckSequenceNotMatch')) {
        return { Err: "Authentication error: Please log out and log back in to refresh your session." };
      }

      return { Err: errorMessage };
    }
  } catch (error) {
    console.error(`[itemService] addItemToShelf: UNEXPECTED outer error for shelf [${shelfId}]:`, error);
    return { Err: "An unexpected error occurred" };
  }
}

/**
 * Remove an item from a shelf
 */
export async function removeItemFromShelf(
  actor: ActorSubclass<_SERVICE>,
  shelfId: string,
  itemId: number
): Promise<Result<boolean, string>> {
  try {
    const result = await actor.remove_item_from_shelf(shelfId, itemId);

    if ("Ok" in result) {
      return { Ok: true };
    } else {
      return { Err: result.Err };
    }
  } catch (error) {
    console.error('Error in removeItemFromShelf:', error);
    return { Err: "Failed to remove item from shelf" };
  }
}

/**
 * Set the absolute order of items in a shelf
 */
export async function setItemOrder(
  actor: ActorSubclass<_SERVICE>,
  shelfId: string,
  orderedItemIds: number[]
): Promise<Result<void, string>> {
  try {
    const result = await actor.set_item_order(shelfId, orderedItemIds);

    if ("Ok" in result) {
      // The backend returns Ok(()) which is equivalent to void in TS
      return { Ok: undefined };
    } else {
      return { Err: result.Err };
    }
  } catch (error) {
    console.error('Error in setItemOrder:', error);
    return { Err: "Failed to set item order" };
  }
} 