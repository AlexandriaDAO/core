import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetTrigger,
  SheetFooter
} from '@/lib/components/sheet';
import { ScrollArea } from '@/lib/components/scroll-area';
import TransactionDetails from '@/apps/Modules/AppModules/contentGrid/components/TransactionDetails';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { PredictionResults } from "@/apps/Modules/shared/state/arweave/arweaveSlice";
import NftAppearsInList from './NftAppearsInList';
import { useNftAppearsIn } from '@/apps/Modules/shared/hooks/useNftAppearsIn';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { NFTData } from '../../types/nft';

interface AttachedDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  predictions?: PredictionResults;
}

export const AttachedDetailsPanel: React.FC<AttachedDetailsPanelProps> = ({
  isOpen,
  onClose,
  transaction,
  predictions,
}) => {
  if (!isOpen || !transaction) {
    return null;
  }

  const arweaveId = transaction?.id;

  const currentNftData = useSelector((state: RootState) => {
    if (!arweaveId) return undefined;
    const nftStoreKey = state.nftData.arweaveToNftId[arweaveId];
    return nftStoreKey ? state.nftData.nfts[nftStoreKey] : undefined;
  });

  const { appearsIn, loading, error } = useNftAppearsIn(currentNftData);

  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col p-0 bg-background/95 backdrop-blur-sm">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle>Details</SheetTitle>
          <SheetDescription>
            Transaction metadata and NFT information.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow p-4">
          <TransactionDetails
            transaction={transaction}
            predictions={predictions}
          />
          {currentNftData && (
            <div className="mt-4">
              <NftAppearsInList appearsIn={appearsIn} loading={loading} error={error} />
            </div>
          )}
        </ScrollArea>
        
        <SheetFooter className="p-4 border-t border-border mt-auto">
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}; 