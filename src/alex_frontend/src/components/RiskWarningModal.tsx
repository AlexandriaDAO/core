import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/lib/components/alert-dialog";
import { ScrollArea } from "@/lib/components/scroll-area";

interface RiskWarningModalProps {
  onClose: () => void;
  open: boolean;
}

const RiskWarningModal: React.FC<RiskWarningModalProps> = ({ onClose, open }) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader className='space-y-0'>
          <AlertDialogTitle>Important Notice</AlertDialogTitle>
          <AlertDialogDescription>Project Status: Pre-Alpha</AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="pr-4">
          <div className="p-4 space-y-4">
            <p className="font-medium">
              This project is in pre-alpha stage. Use at your own risk.
            </p>
            <p>
              For more information, please contact the project administrators.
            </p>
          </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RiskWarningModal; 