import React, { useState } from 'react';
import { Badge } from "@/lib/components/badge";
import { Check, Link, Copy, User, Heart, Database } from "lucide-react";
import { copyToClipboard } from '@/apps/Modules/AppModules/contentGrid/utils/clipboard';
import { formatPrincipal, formatBalance } from '@/apps/Modules/shared/utils/tokenUtils';
import { NftFooterProps } from './types';

/**
 * NftFooter Component
 * 
 * This component is responsible for displaying consistent metadata
 * for NFTs across the application. It shows information like:
 * - Link copy badge
 * - Owner principal
 * - Collection type (NFT/SBT)
 * - Token balances
 * - Token ID with copy functionality
 */
const NftFooter: React.FC<NftFooterProps> = ({
  tokenId,
  nftData,
  ownerInfo,
  transaction,
  showCopyControls = true,
  showBalances = true,
  compact = false
}) => {
  // Copy state tracking
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState(false);

  // Copy handlers
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
    const lbryUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:8080/nft/${tokenId}` 
      : `https://lbry.app/nft/${tokenId}`;
    const copied = await copyToClipboard(lbryUrl);
    if (copied) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyTokenId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const copied = await copyToClipboard(tokenId);
    if (copied) {
      setCopiedTokenId(true);
      setTimeout(() => setCopiedTokenId(false), 2000);
    }
  };

  return (
    <div className={`flex flex-wrap items-center ${compact ? 'gap-1 mt-1' : 'gap-1.5 sm:gap-2 w-full mt-2'}`}>
      {/* Link Copy Badge */}
      {showCopyControls && (
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
      
      {/* Owner Information */}
      {nftData?.principal && showCopyControls && (
        <Badge 
          variant="secondary" 
          className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
          onClick={(e) => handleCopyPrincipal(e, nftData.principal)}
        >
          <User className="h-2.5 w-2.5" />
          {formatPrincipal(nftData.principal)}
          {copiedPrincipal ? (
            <Check className="h-2.5 w-2.5 ml-0.5" />
          ) : null}
        </Badge>
      )}
      
      {/* Username (if available) */}
      {ownerInfo?.username && !compact && (
        <Badge variant="outline" className="text-[10px] py-0.5 px-1">
          <User className="h-2.5 w-2.5 mr-0.5" />
          {ownerInfo.username}
        </Badge>
      )}
      
      {/* Collection Type */}
      {nftData?.collection && (
        <Badge 
          variant={nftData.collection === 'SBT' ? 'secondary' : 'default'} 
          className="text-[10px] py-0.5 px-1"
        >
          <Database className="h-2.5 w-2.5 mr-0.5" />
          {nftData.collection}
        </Badge>
      )}
      
      {/* Token Balances */}
      {showBalances && nftData?.balances && (
        <>
          {nftData.balances.alex > 0 && (
            <Badge variant="outline" className="text-[10px] py-0.5 px-1">
              <span className="font-mono">
                {formatBalance(nftData.balances.alex)} ALEX
              </span>
            </Badge>
          )}
          {nftData.balances.lbry > 0 && (
            <Badge variant="outline" className="text-[10px] py-0.5 px-1">
              <span className="font-mono">
                {formatBalance(nftData.balances.lbry)} LBRY
              </span>
            </Badge>
          )}
        </>
      )}
      
      {/* Token ID with copy functionality */}
      {showCopyControls && (
        <Badge 
          variant="outline" 
          className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
          onClick={handleCopyTokenId}
        >
          <Copy className="h-2.5 w-2.5" />
          {tokenId.substring(0, 6)}...{tokenId.substring(tokenId.length - 4)}
          {copiedTokenId ? (
            <Check className="h-2.5 w-2.5 ml-0.5" />
          ) : null}
        </Badge>
      )}
    </div>
  );
};

export default NftFooter; 