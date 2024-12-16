import { Principal } from "@dfinity/principal";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const shorten = (
	text: string,
	startLength: number = 6,
	endLength: number = 4
): string => {
	if (text.length <= startLength + endLength) {
		return text;
	}
	return `${text.slice(0, startLength)}...${text.slice(-endLength)}`;
};


// Helper function to convert Principal string to Principal object
// Returns null if principal string is empty/invalid
export const getIcPrincipal = (principal: string) => principal ? Principal.fromText(principal) : null;

// Helper function to convert IC timestamp (nanoseconds) to Date
export const convertTimestamp = (timestamp: bigint): string => {
    return new Date(Number(timestamp) / 1_000_000).toISOString(); // Convert nanoseconds to milliseconds
};


// Standard way to check for expired delegation
export const isIdentityExpired = (error: unknown): boolean => {
	console.log(error)
	if (!(error instanceof Error)) return false;

	// Check for delegation expired error
	if (error.message.includes("Specified sender delegation has expired")) {
	  return true;
	}

	// Also check for invalid signature
	if (error.message.includes("Invalid signature")) {
		return true;
	}

	// Also check for invalid delegation
	if (error.message.includes("Invalid delegation")) {
	  return true;
	}

	return false;
}