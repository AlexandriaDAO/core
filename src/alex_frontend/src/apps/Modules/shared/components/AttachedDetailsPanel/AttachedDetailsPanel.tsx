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
        </ScrollArea>
        
        <SheetFooter className="p-4 border-t border-border mt-auto">
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}; 