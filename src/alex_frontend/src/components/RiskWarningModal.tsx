import React, { useState } from 'react';
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
import { ChevronDown, ChevronUp } from "lucide-react";
import { TermsContent } from './TermsContent';

interface RiskWarningModalProps {
  onClose: () => void;
  open: boolean;
}

const RiskWarningModal: React.FC<RiskWarningModalProps> = ({ onClose, open }) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Project Status: Pre-Alpha</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            <ScrollArea className="h-[60vh] pr-4">
              <TermsContent />
            </ScrollArea>
          </AlertDialogDescription>
        </AlertDialogHeader>
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