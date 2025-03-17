/**
 * Formats an ID by showing only the first 3 and last 2 characters separated by ellipsis.
 * @param id - The ID to format
 * @param defaultValue - Value to return if the ID is empty or null
 * @returns Formatted ID string
 */
import { copyToClipboard } from "./clipboard";

export function formatId(id: string | null | undefined, defaultValue: string = 'N/A'): string {
  if (!id) return defaultValue;
  
  // If the ID is too short to be meaningfully formatted
  if (id.length <= 5) return id;
  
  return `${id.slice(0, 3)}...${id.slice(-2)}`;
}

/**
 * Universal copy handler that manages the copying process and copy state
 * @param e - The mouse event
 * @param textToCopy - The text to copy to clipboard
 * @param setCopiedState - State setter function to update copied state
 * @param callback - Optional callback function to execute after successful copy
 * @returns Promise<boolean> - Whether the copy was successful
 */
export async function handleCopy(
  e: React.MouseEvent,
  textToCopy: string | undefined | null,
  setCopiedState: React.Dispatch<React.SetStateAction<boolean>>,
  callback?: () => void
): Promise<boolean> {
  e.stopPropagation();
  
  if (!textToCopy) return false;
  
  try {
    const success = await copyToClipboard(textToCopy);
    
    if (success) {
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
      
      // Execute callback if provided
      if (callback) {
        callback();
      }
    }
    
    return success;
  } catch (error) {
    console.error("Copy failed:", error);
    return false;
  }
} 