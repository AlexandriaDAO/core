import React, { useState, useEffect } from "react";
import { Copy, Check, Link, Database } from "lucide-react";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNftData } from '@/apps/Modules/shared/hooks/getNftData';
import { NftDataResult } from '@/apps/Modules/shared/hooks/getNftData';
import { Badge } from "@/lib/components/badge";
import { Skeleton } from "@/lib/components/skeleton";
import { copyToClipboard } from "../utils/clipboard";
import { determineTokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';

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
  const [copiedTokenId, setCopiedTokenId] = useState(false);

  useEffect(() => {
    const fetchNftData = async () => {
      if (id) {
        const data = await getNftData(id);
        setNftData(data);
        setIsLoading(false);
      }
    };
    fetchNftData();
  }, [id, getNftData]);


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

  const handleCopyTokenId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const tokenId = arweaveToNftId[id];
    if (!tokenId) return;
    
    const copied = await copyToClipboard(tokenId);
    if (copied) {
      setCopiedTokenId(true);
      setTimeout(() => setCopiedTokenId(false), 2000);
    }
  };

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return '0';
    return balance;
  };

  // Format the token ID for display (shorten it)
  const formatTokenId = (tokenId: string | undefined) => {
    if (!tokenId) return '';
    if (tokenId.length <= 4) return tokenId;
    return `${tokenId.slice(0, 2)}...${tokenId.slice(-2)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[160px]" />
      </div>
    );
  }

  const tokenId = arweaveToNftId[id];

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* Link badge */}
      {arweaveToNftId[id] && (
        <Badge 
          variant="secondary" 
          className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
          onClick={handleCopyLink}
        >
          {copiedLink ? (
            <Check className="h-2.5 w-2.5" />
          ) : (
            <Link className="h-2.5 w-2.5" />
          )}
        </Badge>
      )}
      {/* Collection badge */}
      {nftData?.collection && nftData.collection !== 'No Collection' && (
        <Badge variant={nftData.collection === 'NFT' ? 'warning' : 'info'} className="text-[10px] py-0.5 px-1">
          {nftData.collection}
        </Badge>
      )}
      {/* Principal badge - now with blue styling */}
      {nftData?.principal && (
        <Badge 
          variant="secondary" 
          className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
          onClick={(e) => handleCopyPrincipal(e, nftData.principal!)}
        >
          {formatPrincipal(nftData.principal)}
          {copiedPrincipal ? (
            <Check className="h-2.5 w-2.5 text-green-500" />
          ) : (
            <Copy className="h-2.5 w-2.5" />
          )}
        </Badge>
      )}
      {/* Balance badges */}
      {nftData?.balances && (
        <div className="flex gap-0.5">
          <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">
            ALEX: {formatBalance(nftData.balances.alex.toString())}
          </Badge>
          <Badge variant="outline" className="text-[10px] py-0.5 px-1 bg-white/50 dark:bg-gray-800/50">
            LBRY: {formatBalance(nftData.balances.lbry.toString())}
          </Badge>
        </div>
      )}
      {/* Token ID badge - now with regular styling and placed last */}
      {tokenId && (
        <Badge 
          variant="secondary" 
          className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
          onClick={handleCopyTokenId}
          title={`Token ID: ${tokenId}`}
        >
          <Database className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">{formatTokenId(tokenId)}</span>
          {copiedTokenId ? (
            <Check className="h-2.5 w-2.5 text-green-500" />
          ) : (
            <Copy className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
          )}
        </Badge>
      )}
      {/* Order Index - very subtle */}
      {nftData?.orderIndex !== undefined && (
        <span className="text-[8px] text-muted-foreground/40 ml-auto" title="Order Index">
          #{nftData.orderIndex}
        </span>
      )}
    </div>
  );
} 