import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/lib/components/card";
import { Copy, Check, Info, Loader2 } from "lucide-react";
import { useNftData } from '@/apps/Modules/shared/hooks/getNftData';
import { NftDataResult } from '@/apps/Modules/shared/hooks/getNftData';
import { Button } from "@/lib/components/button";
import { Badge } from "@/lib/components/badge";

interface ContentGridProps {
  children: React.ReactNode;
}

interface ContentGridItemProps {
  children: React.ReactNode;
  onClick: () => void;
  id?: string;
  showStats?: boolean;
  onToggleStats?: (e: React.MouseEvent) => void;
  isMintable?: boolean;
  isOwned?: boolean;
  onMint?: (e: React.MouseEvent) => void;
  onWithdraw?: (e: React.MouseEvent) => void;
  predictions?: any;
}

interface NftDataFooterProps {
  id: string;
}

function NftDataFooter({ id }: NftDataFooterProps) {
  const { getNftData } = useNftData();
  const [nftData, setNftData] = useState<NftDataResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedPrincipal, setCopiedPrincipal] = useState(false);

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
    try {
      await navigator.clipboard.writeText(principal);
      setCopiedPrincipal(true);
      setTimeout(() => setCopiedPrincipal(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return '0';
    return balance;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[100px]">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-wrap gap-2">
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
          <Badge variant="default" className="text-xs">
            {nftData.collection}
          </Badge>
        )}
      </div>
      {nftData?.balances && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs bg-white">
            ALEX: {formatBalance(nftData.balances.alex.toString())}
          </Badge>
          <Badge variant="outline" className="text-xs bg-white">
            LBRY: {formatBalance(nftData.balances.lbry.toString())}
          </Badge>
        </div>
      )}
    </div>
  );
}

function ContentGrid({ children }: ContentGridProps) {
  return (
    <div className="grid sm:grid-cols-2 sx:grid-col-1 md:grid-cols-3 lg:grid-cols-4 gap-4  p-4 pb-16 bg-white">
      {children}
    </div>
  );
}

function ContentGridItem({ children, onClick, id, showStats, onToggleStats, isMintable, isOwned, onMint, onWithdraw, predictions }: ContentGridItemProps) {
  const [copied, setCopied] = useState(false);

  const formatId = (id: string) => {
    if (!id) return 'N/A';
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  };

  const handleCopy = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:bg-gray-50 flex flex-col relative overflow-hidden bg-white h-full"
      onClick={onClick}
    >
      <CardHeader className="flex flex-col items-start px-4 py-2 gap-2">
        <div className="flex items-center gap-2 w-full">
          <span className="text-sm">ID: {id ? formatId(id) : 'N/A'}</span>
          {id && (
            copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy 
                className="h-4 w-4 cursor-pointer hover:text-gray-600" 
                onClick={(e) => handleCopy(e, id)}
              />
            )
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-start gap-4 p-0">
        <div className="aspect-square w-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
          {children}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start w-full rounded-lg border border-[--border] bg-[--card] mt-2 flex-grow min-h-[100px] p-4">
        <div className="flex justify-between w-full mb-4">
          <Button
            variant="secondary"
            className="h-8 w-8 rounded-full bg-[#353535] hover:bg-[#454545] flex items-center justify-center p-0"
            onClick={onToggleStats}
          >
            <Info className="h-4 w-4" />
          </Button>

          <div className="flex gap-2">
            {isMintable && onMint && (
              <Button
                variant="secondary"
                className="h-8 w-8 rounded-full bg-[#353535] hover:bg-[#454545] flex items-center justify-center p-0"
                onClick={onMint}
              >
                <span className="text-lg">+</span>
              </Button>
            )}
          </div>
        </div>

        {id && <NftDataFooter id={id} />}

        {showStats && predictions && (
          <div className="mt-2 p-2 bg-black/80 text-white rounded-md text-xs w-full">
            <div>Drawing: {(predictions.Drawing * 100).toFixed(1)}%</div>
            <div>Neutral: {(predictions.Neutral * 100).toFixed(1)}%</div>
            <div>Sexy: {(predictions.Sexy * 100).toFixed(1)}%</div>
            <div>Hentai: {(predictions.Hentai * 100).toFixed(1)}%</div>
            <div>Porn: {(predictions.Porn * 100).toFixed(1)}%</div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

ContentGrid.Item = ContentGridItem;

export default ContentGrid;