import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/lib/components/card";
import { Check, Loader2, Flag, User, Search, Plus, Heart } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Progress } from "@/lib/components/progress";
import { AspectRatio } from "@/lib/components/aspect-ratio";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/lib/components/collapsible";
import { useDispatch, useSelector } from "react-redux";
import { setSearchState } from "@/apps/Modules/shared/state/arweave/arweaveSlice";
import { NftDataFooter } from "./components/NftDataFooter";
import { copyToClipboard } from "./utils/clipboard";
import { Badge } from "@/lib/components/badge";
import { RootState } from "@/store";

interface ContentCardProps {
  children: React.ReactNode;
  onClick: () => void;
  id?: string;
  owner?: string;
  showStats?: boolean;
  onToggleStats?: (open: boolean) => void;
  isOwned?: boolean;
  onMint?: (e: React.MouseEvent) => void;
  onWithdraw?: (e: React.MouseEvent) => void;
  predictions?: any;
  isMinting?: boolean;
  footer?: React.ReactNode;
}

export function ContentCard({ children, onClick, id, owner, showStats, onToggleStats, onMint, predictions, isMinting, footer }: ContentCardProps) {
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);
  const dispatch = useDispatch();
  const arweaveToNftId = useSelector((state: RootState) => state.nftData.arweaveToNftId);

  const formatId = (id: string | undefined) => {
    if (!id) return 'N/A';
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  };

  const handleOwnerClick = async (e: React.MouseEvent, owner: string | undefined) => {
    e.stopPropagation();
    if (owner) {
      const copied = await copyToClipboard(owner);
      if (copied) {
        setCopiedOwner(true);
        setTimeout(() => setCopiedOwner(false), 2000);
      }

      // Filter results
      dispatch(setSearchState({ ownerFilter: owner }));
      setSearchTriggered(true);
      setTimeout(() => setSearchTriggered(false), 2000);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col relative overflow-hidden bg-white dark:bg-gray-900 h-full"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-start p-0">
        <AspectRatio ratio={1} className="w-full relative">
          <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden h-full">
            {children}
          </div>
          {/* Like button positioned absolutely */}
          {id && arweaveToNftId[id] && (
            <div 
              className="absolute bottom-2 left-2 z-[30]" 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <Button
                variant="secondary"
                className="bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onMint?.(e);
                }}
                disabled={isMinting}
              >
                <span className="flex items-center gap-0.5">
                  {isMinting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Liking...
                    </>
                  ) : (
                    <>
                      Like
                      <Heart className={`h-3 w-3 transition-all duration-200 ${isMinting ? 'scale-125' : ''}`} />
                    </>
                  )}
                </span>
              </Button>
            </div>
          )}
        </AspectRatio>
      </CardContent>

      <CardFooter className="flex flex-col w-full bg-[--card] dark:border-gray-700 p-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {/* NFT data or custom footer - now first */}
          {(!predictions || Object.keys(predictions).length === 0) && id && !footer && <NftDataFooter id={id} />}
          {footer}

          {/* Owner badge */}
          {owner && (
            <Badge 
              variant="secondary" 
              className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-0.5 py-0.5 px-1"
              onClick={(e) => handleOwnerClick(e, owner)}
            >
              <User className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {formatId(owner)}
              </span>
              {copiedOwner ? (
                <Check className="h-2.5 w-2.5 text-green-500" />
              ) : (
                <Search className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
              )}
            </Badge>
          )}

          {/* Stats button */}
          {predictions && Object.keys(predictions).length > 0 ? (
            <Collapsible open={showStats} onOpenChange={onToggleStats}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="secondary"
                  className="h-5 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800 rounded-md flex items-center gap-0.5 transition-colors shrink-0 group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Flag className="h-2.5 w-2.5" />
                  <span className="text-[10px] font-medium">Stats</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent onClick={(e) => e.stopPropagation()}>
                <div className="mt-1.5 space-y-1 w-full">
                  {Object.entries(predictions).map(([key, value]) => (
                    <div key={key} className="space-y-0.5">
                      <div className="flex justify-between text-[10px] dark:text-gray-300">
                        <span>{key}</span>
                        <span>{(Number(value) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={Number(value) * 100} className="h-1" />
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
} 