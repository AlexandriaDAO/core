export const ARWEAVE_CONFIG = {
  GATEWAY_URL: 'https://arweave.net',
  GOLDSKY_ENDPOINT: 'https://arweave-search.goldsky.com/graphql',
  ARWEAVE_ENDPOINT: 'https://arweave.net/graphql'
};

export const getArweaveUrl = (resourceId: string): string => {
  return `${ARWEAVE_CONFIG.GATEWAY_URL}/${resourceId}`;
};