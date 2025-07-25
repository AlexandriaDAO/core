import React from "react";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { AssetProps } from "../../../types/assetTypes";

const BookModal: React.FC<AssetProps> = ({ url }) => {
    return (
        <div className="w-full pb-5 text-black scale-y-100 transition-all duration-500 flex flex-col justify-between">
            <ReaderProvider>
                <div className="relative w-full p-2">
                    <div className="max-w-7xl m-auto grid grid-cols-1 gap-4">
                        <Reader bookUrl={url} />
                    </div>
                </div>
            </ReaderProvider>
        </div>
    )
};

export default BookModal;