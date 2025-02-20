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
import TermsAndConditions from '@/components/TermsAndConditions';

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
          <TermsAndConditions />
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            I Understand the Risks
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RiskWarningModal; 