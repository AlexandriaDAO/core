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
export const convertTimestamp = (timestamp: bigint, format: 'iso' | 'readable' | 'relative' | 'combined' = 'iso'): string => {
    const date = new Date(Number(timestamp) / 1_000_000); // Convert nanoseconds to milliseconds
    
    switch (format) {
        case 'readable':
            // Format: "May 15, 2025 at 2:30 PM"
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        case 'relative':
            // Show relative time (e.g., "2 days ago")
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (days > 365) {
                return `${Math.floor(days / 365)} year${Math.floor(days / 365) !== 1 ? 's' : ''} ago`;
            } else if (days > 30) {
                return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? 's' : ''} ago`;
            } else if (days > 0) {
                return `${days} day${days !== 1 ? 's' : ''} ago`;
            } else if (hours > 0) {
                return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
            } else if (minutes > 0) {
                return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
            } else {
                return 'just now';
            }
        case 'combined':
            // Show date with short relative time: "May 15 (2d ago)" - year removed
            const formattedDate = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
            });
            
            // Get short relative time
            const nowCombined = new Date();
            const diffCombined = nowCombined.getTime() - date.getTime();
            const secondsCombined = Math.floor(diffCombined / 1000);
            const minutesCombined = Math.floor(secondsCombined / 60);
            const hoursCombined = Math.floor(minutesCombined / 60);
            const daysCombined = Math.floor(hoursCombined / 24);
            
            let relativeTime = '';
            if (daysCombined > 365) {
                relativeTime = `${Math.floor(daysCombined / 365)}y ago`;
            } else if (daysCombined > 30) {
                relativeTime = `${Math.floor(daysCombined / 30)}mo ago`;
            } else if (daysCombined > 0) {
                relativeTime = `${daysCombined}d ago`;
            } else if (hoursCombined > 0) {
                relativeTime = `${hoursCombined}h ago`;
            } else if (minutesCombined > 0) {
                relativeTime = `${minutesCombined}m ago`;
            } else {
                relativeTime = 'just now';
            }
            
            return `${formattedDate} (${relativeTime})`;
        case 'iso':
        default:
            return date.toISOString();
    }
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

export const downloadQRCode = (content: string, filename: string = "qrcode") => {
	const svg = document.getElementById("wallet-qr");
	if (!svg) return;

	const svgData = new XMLSerializer().serializeToString(svg);
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	const img = new Image();

	img.onload = () => {
		canvas.width = img.width;
		canvas.height = img.height;
		ctx?.drawImage(img, 0, 0);

		const pngFile = canvas.toDataURL("image/png");
		const downloadLink = document.createElement("a");
		downloadLink.download = `${filename}.png`;
		downloadLink.href = pngFile;
		downloadLink.click();
	};

	img.src = "data:image/svg+xml;base64," + btoa(svgData);
};