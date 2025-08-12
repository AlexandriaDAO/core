import React from "react";
import Preview from "./../Preview";
import { File } from "lucide-react";
import useFullData from "../../../hooks/useFullData";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";
import { AssetProps } from "../../../types/assetTypes";

const TextModal: React.FC<AssetProps> = ({ url }) => {
    // OPTIMIZATION: Use TanStack Query-based useFullData with automatic cancellation
    const { data, fetching, fetchError, progress } = useFullData(url);

    // Show loading with progress
    if (fetching) return <AssetSkeleton progress={progress} />

    // Show error state with consistent UI
    if (fetchError) return <Preview icon={File} message="Failed to load text content" />;

    // Show empty state - check for empty or whitespace-only content
    if (!data || !data.trim()) return <Preview icon={File} message="Text is empty" />;

    const scrollClasses = "overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400";

    return (
        <pre className={`relative p-10 w-full h-full font-mono text-xs bg-gray-50 dark:bg-gray-800 rounded-lg border border-border/30 whitespace-break-spaces ${scrollClasses}`}>
            {data}
        </pre>
    )
};

export default TextModal;