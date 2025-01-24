import React, { useState, useEffect } from 'react';
import { Badge } from "@/lib/components/badge";
import { Skeleton } from "@/lib/components/skeleton";
import { useNftData, NftDataResult } from '@/apps/Modules/shared/hooks/getNftData';
import { CopyableText } from './CopyableText';

const formatBalance = (balance?: string) => balance || '0';
const formatPrincipal = (principal: string | null) => principal ? `${principal.slice(0, 4)}...${principal.slice(-4)}` : 'Not owned';

interface NftDataFooterProps {
  id: string;
}

export function NftDataFooter({ id }: NftDataFooterProps) {
  const { getNftData } = useNftData();
  const [nftData, setNftData] = useState<NftDataResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      {nftData?.principal && (
        <CopyableText text={nftData.principal}>
          <Badge variant="default" className="text-xs cursor-pointer hover:bg-primary/80 transition-colors flex items-center gap-1">
            {formatPrincipal(nftData.principal)}
          </Badge>
        </CopyableText>
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