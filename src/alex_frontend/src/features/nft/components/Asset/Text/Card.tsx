import React, { useMemo } from "react";
import Preview from "./../Preview";
import { File, Loader, MoreHorizontal } from "lucide-react";
import usePartialData from "../../../hooks/usePartialData";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";

import { AssetProps } from "../../../types/assetTypes";

const TextCard: React.FC<AssetProps> = ({ url }) => {
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

        return { displayText: trimmedData, isTruncated: partial, isEmpty: false };
    }, [fetching, fetchError, data, partial]);


    if (fetching) return <div className="relative min-h-40 h-full w-full place-items-center place-content-center">
        <Loader className="animate-spin" />
    </div>

    if (fetchError) return <Preview title="Loading Error" description={fetchError || 'Failed to load text content'} />

    if (!data || isEmpty) return <Preview title="Text is empty" />

    return (
        <>
            <pre className="truncate font-mono text-xs max-h-80 h-full w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-input whitespace-break-spaces overflow-hidden">
                {displayText}
            </pre>
            {isTruncated && (
                <div className="absolute bottom-2 right-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1 opacity-75">
                    <MoreHorizontal size={16} className="text-gray-600 dark:text-gray-300" />
                </div>
            )}
        </>
    )
};

export default TextCard;