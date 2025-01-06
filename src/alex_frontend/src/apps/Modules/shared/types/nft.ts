export interface NFTData {
  principal: string;
  collection: 'icrc7' | 'icrc7_scion';
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