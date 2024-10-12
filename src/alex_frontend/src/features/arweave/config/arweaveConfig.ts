export const ARWEAVE_CONFIG = {
  GATEWAY_URL: 'https://g8way.io',
  GRAPHQL_ENDPOINT: 'https://arweave-search.goldsky.com/graphql',
};

// Update the getProxiedArweaveUrl function to include a version parameter
export const getProxiedArweaveUrl = (resourceId: string): string => {
  const timestamp = Date.now(); // Generates a new timestamp each time
  return `${ARWEAVE_CONFIG.GATEWAY_URL}/${resourceId}?v=${timestamp}`;
};