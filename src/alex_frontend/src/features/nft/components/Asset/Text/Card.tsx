import React, { useMemo } from "react";
import Preview from "./../Preview";
import { File, MoreHorizontal } from "lucide-react";
import usePartialData from "../../../hooks/usePartialData";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";

// NEW: Import our shared types
import { AssetProps } from "../../../types/assetTypes";

const TextCard: React.FC<AssetProps> = ({ url }) => {
    // NOTE: usePartialData already uses SWR internally, so it has built-in caching
    // We pass the signal indirectly by checking if cancelled in our render logic
    const { data, fetching, fetchError, partial } = usePartialData(url, 500);

    const { displayText, isTruncated, isEmpty } = useMemo(() => {
        if (fetching || fetchError || !data) return { displayText: '', isTruncated: false, isEmpty: false };

        // Check if text is empty or only whitespace
        const trimmedData = data.trim();
        if (!trimmedData) return { displayText: '', isTruncated: false, isEmpty: true };

        // Based on manual testing: 18 lines max, ~45 chars per line
        const maxLines = 18;
        const lines = trimmedData.split('\n');

        if(lines.length > maxLines){
            const truncated = lines.slice(0, maxLines).join('\n');
            return { displayText: truncated, isTruncated: true, isEmpty: false };
        }

        // Since we already fetched partial data, no need to truncate by length again
        // The usePartialData hook already handles the byte limit
        return { displayText: trimmedData, isTruncated: partial, isEmpty: false };
    }, [fetching, fetchError, data, partial]);


    if (fetching) return <AssetSkeleton />

    if (fetchError) return <Preview icon={File} message="Failed to load text content" />

    if (!data || isEmpty) return <Preview icon={File} message="Text is empty" />

    return (
        <div className="relative w-full">
            <pre className="truncate font-mono text-xs w-full max-h-[19rem] bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-input whitespace-break-spaces overflow-hidden">
                {displayText}
            </pre>
            {isTruncated && (
                <div className="absolute bottom-2 right-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1 opacity-75">
                    <MoreHorizontal size={16} className="text-gray-600 dark:text-gray-300" />
                </div>
            )}
        </div>
    )
};

export default TextCard;