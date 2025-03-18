import React, { useState, useEffect } from "react";
import { Copy, Check, Link, Database, User, Search } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useNftData } from '@/apps/Modules/shared/hooks/getNftData';
import { NftDataResult } from '@/apps/Modules/shared/hooks/getNftData';
import { Badge } from "@/lib/components/badge";
import { Skeleton } from "@/lib/components/skeleton";
import { formatId, handleCopy } from "../utils/formatters";
import { determineTokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
import { setSearchState } from "@/apps/Modules/shared/state/arweave/arweaveSlice";

interface NftDataFooterProps {
  id: string;
  contentOwner?: string; // Add contentOwner prop to differentiate from NFT owner (principal)
}

export function NftDataFooter({ id, contentOwner }: NftDataFooterProps) {
  const { getNftData } = useNftData();
  const dispatch = useDispatch();
  const nfts = useSelector((state: RootState) => state.nftData.nfts);
  const arweaveToNftId = useSelector((state: RootState) => state.nftData.arweaveToNftId);
  const [nftData, setNftData] = useState<NftDataResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);

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
    return formatId(principal, 'Not owned');
  };

  const handleCopyPrincipal = (e: React.MouseEvent) => {
    if (!nftData?.principal) return;
    handleCopy(e, nftData.principal, setCopiedPrincipal);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    const tokenId = arweaveToNftId[id];
    if (!tokenId) return;
    
    const lbryUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:8080/nft/${tokenId}` 
      : `https://lbry.app/nft/${tokenId}`;
    
    handleCopy(e, lbryUrl, setCopiedLink);
  };

  const handleCopyTokenId = (e: React.MouseEvent) => {
    const tokenId = arweaveToNftId[id];
    handleCopy(e, tokenId, setCopiedTokenId);
  };

  const handleCopyOwner = (e: React.MouseEvent) => {
    if (!contentOwner) return;
    
    handleCopy(e, contentOwner, setCopiedOwner, () => {
      // Filter results by owner
      dispatch(setSearchState({ ownerFilter: contentOwner }));
      setSearchTriggered(true);
      setTimeout(() => setSearchTriggered(false), 2000);
    });
  };

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return '0';
    return balance;
  };

  // Format the token ID for display (shorten it)
  const formatTokenId = (tokenId: string | undefined) => {
    if (!tokenId) return '';
    return formatId(tokenId, '');
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
          onClick={handleCopyPrincipal}
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
      {/* Content Owner badge (moved from Card.tsx) */}
      {contentOwner && (
        <Badge 
          variant="secondary" 
          className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
          onClick={handleCopyOwner}
        >
          <User className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {formatId(contentOwner)}
          </span>
          {copiedOwner ? (
            <Check className="h-2.5 w-2.5 text-green-500" />
          ) : (
            <Search className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
          )}
        </Badge>
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