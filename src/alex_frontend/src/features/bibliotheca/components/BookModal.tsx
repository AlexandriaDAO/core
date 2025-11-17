import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/lib/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";

interface BookModalProps {
    url: string;
    isOpen: boolean;
    onClose: () => void;
}

export const BookModal: React.FC<BookModalProps> = ({ url, isOpen, onClose }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="max-w-[90vw] max-h-[90vh] w-[90vw] h-[90vh] p-0"
                closeIcon={null}
            >
                <VisuallyHidden>
                    <DialogTitle>Book Reader</DialogTitle>
                    <DialogDescription>
                        Interactive EPUB book reader with navigation and settings
                    </DialogDescription>
                </VisuallyHidden>
                <div className="w-full h-full bg-background rounded-lg overflow-hidden">
                    <ReaderProvider>
                        <Reader bookUrl={url} />
                    </ReaderProvider>
                </div>
            </DialogContent>
        </Dialog>
    );
};