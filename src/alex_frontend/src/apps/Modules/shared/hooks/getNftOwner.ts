import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const getNftOwner = () => {
  const nfts = useSelector((state: RootState) => state.nftData.nfts);

  const checkOwnership = (transactionId: string, collection: string) => {
    try {
      // Find the NFT entry where arweaveId matches the transactionId
      const nftEntry = Object.entries(nfts).find(([_, nft]) => 
        nft.arweaveId === transactionId && nft.collection === collection
      );

      if (nftEntry) {
        // Return the principal (owner) from the matched NFT
        return nftEntry[1].principal;
      }

      return null;
    } catch (error) {
      console.error("Error finding owner in state:", error);
      return null;
    }
  };

  return { checkOwnership };
}; 