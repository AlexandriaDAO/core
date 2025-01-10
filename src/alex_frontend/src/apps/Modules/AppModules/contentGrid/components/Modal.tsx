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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={handleOverlayClick}
    >
      <Card className="relative w-full max-w-4xl max-h-[90vh] bg-background">
        <Button
          variant="outline"
          className="absolute right-4 top-4 z-[60] rounded-full p-3 
            bg-primary text-primary-foreground hover:bg-primary/90
            transition-colors"
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
