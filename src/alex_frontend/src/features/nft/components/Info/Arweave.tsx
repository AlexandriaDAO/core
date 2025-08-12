import React from "react";

import useTransactionMetadata from "../../hooks/useTransactionMetadata";
import Tags from "./Tags";
import { copyToClipboard, shorten, convertTimestamp } from "@/utils/general";
import { formatFileSize } from "@/features/pinax/utils";

interface ArweaveInfoProps {
    // arweave id
    id: string;
}

const ArweaveInfo: React.FC<ArweaveInfoProps> = ({ id }) => {
    const { metadata, loading: metadataLoading } = useTransactionMetadata(id);

    return (
        <>
            <div className="space-y-1">
                {/* Upload timestamp row */}
                {metadata?.timestamp && metadata.timestamp > 0 && (
                    <div className="flex justify-between items-center border-b border-muted-foreground/30 dark:border-muted-foreground/50">
                        <span className="text-sm text-muted-foreground opacity-70">Uploaded</span>
                        <span className="text-xs text-muted-foreground opacity-70">
                            {convertTimestamp(metadata.timestamp, 'relative')}
                        </span>
                    </div>
                )}

                {/* Owner row */}
                {metadata?.owner && (
                    <div className="flex justify-between items-center border-b border-muted-foreground/30 dark:border-muted-foreground/50">
                        <span className="text-sm text-muted-foreground opacity-70">By</span>
                        <span className="text-xs text-muted-foreground opacity-70 cursor-copy" onClick={()=>copyToClipboard(metadata.owner)} >
                            {shorten(metadata.owner, 6, 4)}
                        </span>
                    </div>
                )}

                {/* Size row */}
                {metadata?.size && metadata.size > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground opacity-70">Size</span>
                        <span className="text-xs text-muted-foreground opacity-70">
                            {formatFileSize(metadata.size)}
                        </span>
                    </div>
                )}
            </div>

            {metadataLoading ? (
                <div className="flex-grow flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-muted-foreground"></div>
                </div>
            ) : (
                <Tags tags={metadata?.tags} />
            )}
        </>
    );
};

export default ArweaveInfo;