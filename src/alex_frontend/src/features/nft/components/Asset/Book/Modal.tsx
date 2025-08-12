import React from "react";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { AssetProps } from "../../../types/assetTypes";

const BookModal: React.FC<AssetProps> = ({ url }) => {
    return (
        <div className="p-8 w-full h-full bg-background rounded-lg border border-border/30 overflow-hidden place-content-center place-items-center">
            <ReaderProvider>
                <Reader bookUrl={url} />
            </ReaderProvider>
        </div>
    )
};

export default BookModal;