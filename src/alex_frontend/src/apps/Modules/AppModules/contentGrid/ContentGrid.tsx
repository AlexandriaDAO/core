import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/lib/components/card";
import { Copy, Check } from "lucide-react";
import { useNftData } from '@/apps/Modules/shared/hooks/getNftData';
import { NftDataResult } from '@/apps/Modules/shared/hooks/getNftData';
import { Loader2 } from "lucide-react";

interface ContentGridProps {
  children: React.ReactNode;
}

interface ContentGridItemProps {
  children: React.ReactNode;
  onClick: () => void;
  id?: string;
}

function NftDataFooter({ id }: { id: string }) {
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

  const formatPrincipal = (principal: string | null) => {
    if (!principal) return 'Not owned';
    return `${principal.slice(0, 4)}...${principal.slice(-4)}`;
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
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">Owner:</span>
        <span className="text-sm text-gray-700">
          {formatPrincipal(nftData?.principal || null)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">Collection:</span>
        <span className="text-sm text-gray-700">{nftData?.collection || 'None'}</span>
      </div>
      {nftData?.balances && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">ALEX:</span>
            <span className="text-sm text-gray-700">
              {formatBalance(nftData.balances.alex.toString())}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">LBRY:</span>
            <span className="text-sm text-gray-700">
              {formatBalance(nftData.balances.lbry.toString())}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function ContentGrid({ children }: ContentGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-white">
      {children}
    </div>
  );
}

function ContentGridItem({ children, onClick, id }: ContentGridItemProps) {
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
        {id && <NftDataFooter id={id} />}
      </CardFooter>
    </Card>
  );
}

ContentGrid.Item = ContentGridItem;

export default ContentGrid;