export interface NFTData {
  principal: string;
  collection: 'NFT' | 'SBT';
  arweaveId: string;
  balances?: {
    alex: string;
    lbry: string;
  };
  orderIndex?: number;
  appears_in?: string[];
  rarityPercentage?: number;
}

export interface NFTBalances {
  tokenId: string;
  alex: string;
  lbry: string;
  collection?: 'NFT' | 'SBT';
} 