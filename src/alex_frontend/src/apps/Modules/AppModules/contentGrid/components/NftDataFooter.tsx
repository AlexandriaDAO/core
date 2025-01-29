import React, { useState, useEffect } from "react";
import { Copy, Check, Link } from "lucide-react";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNftData } from '@/apps/Modules/shared/hooks/getNftData';
import { NftDataResult } from '@/apps/Modules/shared/hooks/getNftData';
import { Badge } from "@/lib/components/badge";
import { Skeleton } from "@/lib/components/skeleton";
import { copyToClipboard } from "../utils/clipboard";

interface NftDataFooterProps {
  id: string;
}

export function NftDataFooter({ id }: NftDataFooterProps) {
  const { getNftData } = useNftData();
  const nfts = useSelector((state: RootState) => state.nftData.nfts);
  const arweaveToNftId = useSelector((state: RootState) => state.nftData.arweaveToNftId);
  const [nftData, setNftData] = useState<NftDataResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchNftData = async () => {
      if (id) {
        const data = await getNftData(id);
        setNftData(data);
        setIsLoading(false);
      }
    };
    fetchNftData();
  }, [id]);


  const formatPrincipal = (principal: string | null) => {
    if (!principal) return 'Not owned';
    return `${principal.slice(0, 4)}...${principal.slice(-4)}`;
  };

  const handleCopyPrincipal = async (e: React.MouseEvent, principal: string) => {
    e.stopPropagation();
    const copied = await copyToClipboard(principal);
    if (copied) {
      setCopiedPrincipal(true);
      setTimeout(() => setCopiedPrincipal(false), 2000);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const tokenId = arweaveToNftId[id];
    if (!tokenId) return;
    
    const lbryUrl = process.env.NODE_ENV === 'development' ? `http://localhost:8080/nft/${tokenId}` : `https://lbry.app/nft/${tokenId}`;
    const copied = await copyToClipboard(lbryUrl);
    if (copied) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return '0';
    return balance;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[160px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge 
        variant="default" 
        className="text-xs cursor-pointer hover:bg-primary/80 transition-colors flex items-center gap-1"
        onClick={handleCopyLink}
      >
        {copiedLink ? (
          <Check className="h-3 w-3" />
        ) : (
          <Link className="h-3 w-3" />
        )}
      </Badge>
      {nftData?.principal && (
        <Badge 
          variant="default" 
          className="text-xs cursor-pointer hover:bg-primary/80 transition-colors flex items-center gap-1"
          onClick={(e) => handleCopyPrincipal(e, nftData.principal!)}
        >
          {formatPrincipal(nftData.principal)}
          {copiedPrincipal ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Badge>
      )}
      {nftData?.collection && nftData.collection !== 'No Collection' && (
        <Badge variant="default" className={`text-xs ${
          nftData.collection === 'NFT' 
            ? 'bg-[#FFD700] text-black hover:bg-[#FFD700]/90' 
            : 'bg-[#E6E6FA] text-black hover:bg-[#E6E6FA]/90'
        }`}>
          {nftData.collection}
        </Badge>
      )}
      {nftData?.balances && (
        <>
          <Badge variant="outline" className="text-xs bg-white">
            ALEX: {formatBalance(nftData.balances.alex.toString())}
          </Badge>
          <Badge variant="outline" className="text-xs bg-white">
            LBRY: {formatBalance(nftData.balances.lbry.toString())}
          </Badge>
        </>
      )}
    </div>
  );
} 