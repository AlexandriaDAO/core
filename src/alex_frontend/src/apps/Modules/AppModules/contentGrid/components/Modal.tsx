import React from 'react';
import { X } from 'lucide-react';
import { Card, CardContent } from "@/lib/components/card";
import { Button } from "@/lib/components/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <Card className="relative w-full max-w-4xl max-h-[90vh] bg-background">
        <Button
          variant="ghost"
          className="absolute right-4 top-4 z-[60] rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        <CardContent className="p-6 overflow-y-auto max-h-[90vh]">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default Modal;
