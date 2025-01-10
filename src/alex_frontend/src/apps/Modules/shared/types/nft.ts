export interface NFTData {
  principal: string;
  collection: 'NFT' | 'SBT';
  arweaveId: string;
  balances?: {
    alex: string;
    lbry: string;
  };
}

export interface NFTBalances {
  tokenId: string;
  alex: string;
  lbry: string;
} 