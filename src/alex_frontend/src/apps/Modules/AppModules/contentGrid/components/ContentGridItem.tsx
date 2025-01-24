import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/lib/components/card";
import { Loader2, Flag, User, Search, Plus, Heart, Check } from "lucide-react";
import { Button } from "@/lib/components/button";
import { AspectRatio } from "@/lib/components/aspect-ratio";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/lib/components/collapsible";
import { Progress } from "@/lib/components/progress";
import { useDispatch } from "react-redux";
import { setSearchState } from "@/apps/Modules/shared/state/arweave/arweaveSlice";
import { ContentGridItemProps } from '../types/contentGrid.types';
import { NftDataFooter } from './NftDataFooter';

const formatId = (id?: string) => id ? `${id.slice(0, 4)}...${id.slice(-4)}` : 'N/A';

export function ContentGridItem({ 
  children, 
  onClick, 
  id, 
  owner, 
  showStats, 
  onToggleStats, 
  isMintable, 
  isOwned, 
  onMint, 
  predictions, 
  isMinting 
}: ContentGridItemProps) {
  const [searchTriggered, setSearchTriggered] = useState(false);
  const dispatch = useDispatch();
  const isAlexandrian = window.location.pathname.includes('/alexandrian');

  const handleOwnerClick = (e: React.MouseEvent, ownerValue?: string) => {
    e.stopPropagation();
    if (ownerValue) {
      dispatch(setSearchState({ ownerFilter: ownerValue }));
      setSearchTriggered(true);
      setTimeout(() => setSearchTriggered(false), 2000);
    }
  };

  const renderMintButton = () => {
    if (!isMintable || isOwned || !onMint) return null;

    return (
      <Button
        variant="secondary"
        className={`${isAlexandrian 
          ? 'bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200'
          : 'bg-black hover:bg-zinc-900 text-[#ffff00] hover:text-[#ffff33] border border-[#ffff00]/50 hover:border-[#ffff00] shadow-[0_0_10px_rgba(255,255,0,0.1)] hover:shadow-[0_0_15px_rgba(255,255,0,0.15)]'
        } px-2 sm:px-4 py-1 sm:py-2 rounded-md flex items-center gap-1 sm:gap-2 transition-all duration-200 text-xs sm:text-sm font-medium shrink-0 ${isMinting ? 'opacity-80' : ''}`}
        onClick={onMint}
        disabled={isMinting}
      >
        <span className="flex items-center gap-1 sm:gap-2">
          {isMinting ? (
            <>
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              {isAlexandrian ? 'Liking...' : 'Minting'}
            </>
          ) : (
            <>
              {isAlexandrian ? 'Like' : 'Mint NFT'}
              {isAlexandrian ? (
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ${isMinting ? 'scale-125' : ''}`} />
              ) : (
                <Plus className={`h-4 w-4 sm:h-5 sm:w-5 text-red-500 transition-all duration-200 ${isMinting ? 'scale-125 text-green-500' : ''}`} />
              )}
            </>
          )}
        </span>
      </Button>
    );
  };

  return (
    <Card
      className="cursor-pointer hover:bg-gray-50 flex flex-col relative overflow-hidden bg-white h-full"
      onClick={onClick}
    >
      <CardHeader className="flex flex-col items-start p-2 sm:px-4 sm:py-2 gap-1 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-2 w-full">
          {owner && (
            <div 
              className="flex items-center gap-1 group cursor-pointer hover:bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition-colors"
              onClick={(e) => handleOwnerClick(e, owner)}
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              <span className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-900">
                {formatId(owner)}
              </span>
              {searchTriggered ? (
                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              ) : (
                <Search className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 group-hover:text-gray-600" />
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-start gap-2 sm:gap-4 p-0">
        <AspectRatio ratio={1} className="w-full">
          <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden h-full">
            {children}
          </div>
        </AspectRatio>
      </CardContent>

      <CardFooter className="flex flex-col w-full rounded-lg border border-[--border] bg-[--card] mt-2 p-2 sm:p-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
            {renderMintButton()}

            {predictions && Object.keys(predictions).length > 0 ? (
              <Collapsible open={showStats} onOpenChange={onToggleStats}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="secondary"
                    className="h-6 sm:h-8 px-2 sm:px-3 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 rounded-md flex items-center gap-1 sm:gap-1.5 transition-colors shrink-0 group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Flag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="text-[10px] sm:text-xs font-medium">Stats</span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent onClick={(e) => e.stopPropagation()}>
                  <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 w-full">
                    {Object.entries(predictions).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-[10px] sm:text-xs">
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

          {(!predictions || Object.keys(predictions).length === 0) && id && <NftDataFooter id={id} />}
        </div>
      </CardFooter>
    </Card>
  );
} 