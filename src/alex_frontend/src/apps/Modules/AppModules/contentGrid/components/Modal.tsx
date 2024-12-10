import React from 'react';
import { X } from 'lucide-react';
import { Button } from "@/lib/components/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] w-full relative overflow-auto">
        <Button
          variant="secondary"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-[#353535] hover:bg-[#454545] flex items-center justify-center p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
