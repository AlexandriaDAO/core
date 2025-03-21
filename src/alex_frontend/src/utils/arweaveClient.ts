import Arweave from 'arweave';

/**
 * Centralized Arweave client configuration.
 * Uses arweave.net as a reliable public gateway with HTTPS.
 * Increased timeout to handle potential slow responses.
 */
export const arweaveClient = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000
});

/**
 * Checks if a response from Arweave looks like HTML instead of expected data.
 * Returns true if the response contains HTML markers.
 */
export const isHtmlResponse = (response: any): boolean => {
    return typeof response === 'string' && 
        (response.includes('<!DOCTYPE') || 
         response.includes('<html'));
};

export default arweaveClient; 