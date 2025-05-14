import React from "react";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { Copy, Check, Link, Database, User, Search, Flag, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/lib/components/card";
import { ScrollArea } from "@/lib/components/scroll-area";
import { Badge } from "@/lib/components/badge";
import { Separator } from "@/lib/components/separator";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useNftData, NftDataResult } from '@/apps/Modules/shared/hooks/getNftData';
import { formatId, handleCopy } from "../utils/formatters";
import { formatPrincipal, formatBalance } from '@/apps/Modules/shared/utils/tokenUtils';
import { setSearchState } from "@/apps/Modules/shared/state/arweave/arweaveSlice";
import { Button } from "@/lib/components/button";
import { Progress } from "@/lib/components/progress";
import { PredictionResults } from "@/apps/Modules/shared/state/arweave/arweaveSlice";

const truncateMiddle = (str: string, startChars: number = 4, endChars: number = 4) => {
  if (str.length <= startChars + endChars + 3) return str;
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
};

interface TransactionDetailsProps {
  transaction: Transaction;
  predictions?: PredictionResults;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ 
  transaction,
  predictions
}) => {
  const dispatch = useDispatch();

  // NFT data related hooks and state
  const { nfts, arweaveToNftId } = useSelector((state: RootState) => state.nftData);
  const { getNftData } = useNftData();
  const [copiedPrincipal, setCopiedPrincipal] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedTokenId, setCopiedTokenId] = React.useState(false);
  const [copiedOwner, setCopiedOwner] = React.useState(false);
  const [copiedTxId, setCopiedTxId] = React.useState(false);
  const [searchTriggered, setSearchTriggered] = React.useState(false);
  const [nftDataResult, setNftDataResult] = React.useState<NftDataResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Get the specific NFT data (including balances) from Redux
  const tokenId = arweaveToNftId[transaction.id];
  const nftDataFromStore = useSelector((state: RootState) => tokenId ? state.nftData.nfts[tokenId] : undefined);

  // Fetch basic NFT data (principal, collection) when component mounts or transaction changes
  React.useEffect(() => {
    let isMounted = true;
    const fetchBasicNftData = async () => {
      if (transaction.id) {
        setLoading(true);
        try {
          // Fetch basic data but rely on Redux for balances
          const data = await getNftData(transaction.id);
          if (isMounted) {
            setNftDataResult(data);
          }
        } catch (err) {
          console.error("Error fetching NFT data:", err);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };
    fetchBasicNftData();
    return () => { isMounted = false; }; // Cleanup function
  }, [transaction.id, getNftData]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label} to clipboard`);
      return true;
    } catch (err) {
      toast.error('Failed to copy to clipboard');
      return false;
    }
  };

  // NFT copy handlers
  const handleCopyPrincipal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nftDataResult?.principal) return;
    const success = await copyToClipboard(nftDataResult.principal, 'Principal');
    if (success) {
      setCopiedPrincipal(true);
      setTimeout(() => setCopiedPrincipal(false), 2000);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tokenId) return;
    
    const lbryUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:8080/nft/${tokenId}` 
      : `https://lbry.app/nft/${tokenId}`;
    
    const success = await copyToClipboard(lbryUrl, 'NFT link');
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyTokenId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tokenId) return;
    
    const success = await copyToClipboard(tokenId, 'Token ID');
    if (success) {
      setCopiedTokenId(true);
      setTimeout(() => setCopiedTokenId(false), 2000);
    }
  };
  
  // Transaction ID Copy Handler
  const handleCopyTxId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(transaction.id, 'Transaction ID');
    if (success) {
      setCopiedTxId(true);
      setTimeout(() => setCopiedTxId(false), 2000);
    }
  };

  // Arweave Owner Click Handler
  const handleOwnerClick = (e: React.MouseEvent) => {
    if (!transaction.owner) return;
    
    e.stopPropagation(); 

    handleCopy(e, transaction.owner, setCopiedOwner, () => {
      dispatch(setSearchState({ ownerFilter: transaction.owner }));
      setSearchTriggered(true);
      setTimeout(() => setSearchTriggered(false), 2000);
    });
  };

  const isFromAssetCanister = transaction.assetUrl && transaction.assetUrl !== "";
  // Use principal from local state or store, and check tokenId for NFT data presence
  const hasNftData = tokenId || nftDataResult?.principal || nftDataFromStore?.principal;
  const principalToDisplay = nftDataResult?.principal || nftDataFromStore?.principal;
  const collectionToDisplay = nftDataResult?.collection || nftDataFromStore?.collection;
  const balancesToDisplay = nftDataFromStore?.balances; // Get balances from Redux store
  const orderIndexToDisplay = nftDataResult?.orderIndex ?? nftDataFromStore?.orderIndex;

  // This function now directly returns the details content JSX
  // The old hover wrapper div is removed.
  const renderDetailsContent = (): JSX.Element => (
    <CardContent className="space-y-3 p-2 md:p-3 pt-0 text-[11px] md:text-xs">
      {/* ICP NFT Data Section */}
      {hasNftData && (
        <div className="space-y-2">
          <span className="block text-[11px] md:text-xs font-semibold text-blue-400 mb-1">ICP Info</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] py-0.5 px-1.5">
              {isFromAssetCanister ? "ICP" : "AR"}
            </Badge>
            
            {/* Link badge */}
            {tokenId && (
              <Badge 
                variant="secondary" 
                className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1.5"
                onClick={handleCopyLink}
                title="Copy NFT link"
              >
                {copiedLink ? (
                  <Check className="h-2.5 w-2.5" />
                ) : (
                  <Link className="h-2.5 w-2.5" />
                )}
              </Badge>
            )}

            {/* Collection badge */}
            {collectionToDisplay && collectionToDisplay !== 'No Collection' && (
              <Badge variant={collectionToDisplay === 'NFT' ? 'default' : 'secondary'} className="text-[10px] py-0.5 px-1.5">
                <Database className="h-2.5 w-2.5 mr-0.5" />
                {collectionToDisplay}
              </Badge>
            )}

            {/* Principal badge */}
            {principalToDisplay && (
              <Badge 
                variant="secondary" 
                className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1.5 bg-blue-900/40 text-blue-300 border border-blue-800"
                onClick={handleCopyPrincipal}
                title={`Principal: ${principalToDisplay}`}
              >
                <User className="h-2.5 w-2.5" />
                {formatPrincipal ? formatPrincipal(principalToDisplay) : truncateMiddle(principalToDisplay)}
                {copiedPrincipal ? (
                  <Check className="h-2.5 w-2.5 text-green-500 ml-0.5" />
                ) : (
                  <Copy className="h-2.5 w-2.5 ml-0.5 opacity-50 group-hover:opacity-100" />
                )}
              </Badge>
            )}

            {/* Token ID badge */}
            {tokenId && (
              <Badge 
                variant="secondary" 
                className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1.5"
                onClick={handleCopyTokenId}
                title={`Token ID: ${tokenId}`}
              >
                <Database className="h-2.5 w-2.5 text-gray-400" />
                <span>{formatId(tokenId)}</span>
                {copiedTokenId ? (
                  <Check className="h-2.5 w-2.5 text-green-500 ml-0.5" />
                ) : (
                  <Copy className="h-2.5 w-2.5 ml-0.5 opacity-50 group-hover:opacity-100" />
                )}
              </Badge>
            )}
            
            {/* Order Index */}
            {orderIndexToDisplay !== undefined && (
              <span className="text-[8px] text-muted-foreground/60 ml-auto pl-1" title="Order Index">
                #{orderIndexToDisplay}
              </span>
            )}
          </div>
          
          {/* Balance badges - Use balances from Redux store with better styling */}
          {balancesToDisplay && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {/* ALEX Badge with improved styling */}
              <Badge variant="outline" className="text-[10px] py-0.5 px-1.5 bg-blue-900/30 text-blue-300 border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                <span className="font-mono font-medium">
                  {formatBalance(balancesToDisplay.alex)} ALEX
                </span>
              </Badge>
              {/* LBRY Badge with improved styling */}
              <Badge variant="outline" className="text-[10px] py-0.5 px-1.5 bg-purple-900/30 text-purple-300 border-purple-800 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                <span className="font-mono font-medium">
                  {formatBalance(balancesToDisplay.lbry)} LBRY
                </span>
              </Badge>
            </div>
          )}
          
          <Separator className="bg-gray-700" />
        </div>
      )}

      {/* Arweave Transaction Details Section */}
      <div className="space-y-2">
        <span className="block text-[11px] md:text-xs font-semibold text-amber-400 mb-1">Arweave Info</span>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center group/item cursor-pointer hover:bg-gray-800/50 p-1 rounded"
              onClick={handleCopyTxId}>
            <span className="text-gray-400">Transaction ID</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono truncate ml-1.5 max-w-[120px] sm:max-w-[180px]">{transaction.id}</span>
              {copiedTxId ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 opacity-50 group-hover/item:opacity-100" />
              )}
            </div>
          </div>
          
          {/* Arweave Owner field in proper section with search functionality */}
          {transaction.owner && (
            <div className="flex justify-between items-center group/owner cursor-pointer hover:bg-gray-800/50 p-1 rounded"
                onClick={handleOwnerClick}>
              <span className="text-gray-400">Owner</span>
              <div className="flex items-center gap-1.5">
                <User className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                <span className="font-mono text-gray-300 dark:text-gray-300">
                  {formatId(transaction.owner)}
                </span>
                {copiedOwner ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Search className="w-3 h-3 text-gray-500 dark:text-gray-400 opacity-50 group-hover/owner:opacity-100" />
                )}
              </div>
            </div>
          )}
          
          {transaction.data && (
            <div className="flex justify-between items-center p-1">
              <span className="text-gray-400">Size</span>
              <span className="font-mono">{(transaction.data.size / 1024).toFixed(2)} KB</span>
            </div>
          )}
          {transaction.block && (
            <div className="flex justify-between items-center p-1">
              <span className="text-gray-400">Date</span>
              <span className="text-[10px] md:text-[11px]">
                {new Date(transaction.block.timestamp * 1000).toLocaleString('en-US', {
                  timeZone: 'UTC'
                })} UTC
              </span>
            </div>
          )}
        </div>

        <Separator className="bg-gray-700" />
        
        <div className="space-y-1.5">
          <span className="text-gray-400">Tags</span>
          <div className="flex flex-wrap gap-1.5">
            {transaction.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                title={`${tag.name}: ${tag.value}`}
                className="bg-gray-800 text-gray-200 cursor-pointer hover:bg-gray-700 group/badge flex items-center gap-1 text-[9px] md:text-[10px] py-0.5 px-1.5"
                onClick={() => copyToClipboard(`${tag.name}: ${tag.value}`, 'Tag')}
              >
                {truncateMiddle(tag.name, 4, 2)}: {truncateMiddle(tag.value, 4, 2)}
                <Copy className="w-2.5 h-2.5 opacity-0 group-hover/badge:opacity-100" />
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  );

  // The component now directly returns the result of renderDetailsContent()
  // The hover div and ScrollArea/Card wrappers are removed from here.
  return renderDetailsContent(); 
};

export default TransactionDetails; 