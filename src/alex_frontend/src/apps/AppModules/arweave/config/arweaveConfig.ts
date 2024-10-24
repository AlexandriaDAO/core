export const ARWEAVE_CONFIG = {
  GATEWAY_URL: 'https://arweave.net',
  GRAPHQL_ENDPOINT: 'https://arweave-search.goldsky.com/graphql',
};

export const getArweaveUrl = (resourceId: string): string => {
  return `${ARWEAVE_CONFIG.GATEWAY_URL}/${resourceId}`;
};