export const ARWEAVE_CONFIG = {
  GATEWAY_URL: 'https://arweave.net',
  GRAPHQL_ENDPOINT: 'https://arweave-search.goldsky.com/graphql',
};

export const getArweaveUrl = (resourceId: string): string => {
  return `${ARWEAVE_CONFIG.GATEWAY_URL}/${resourceId}`;
};

export function loadArweaveAsset(url: string): Promise<string> {
  return fetch(url, { cache: 'no-store' })
    .then(response => response.blob())
    .then(blob => URL.createObjectURL(blob));
}
