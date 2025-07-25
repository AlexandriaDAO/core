import React from "react";
import { useQuery } from '@tanstack/react-query';
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";
import { getCover } from "@/utils/epub";
import {ImageCard} from "../Image";
import Preview from "../Preview";
import { BookIcon } from "lucide-react";

// NEW: Import our shared types
import { NsfwAssetProps } from "../../../types/assetTypes";

const BookCard: React.FC<NsfwAssetProps> = ({ url, checkNsfw, setIsNsfw }) => {
    const { data: cover, error, isLoading } = useQuery({
        queryKey: ['epub-cover', url],
        queryFn: () => getCover(url),
        enabled: !!url,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    if (isLoading) return <AssetSkeleton />;

    // Error state - something went wrong (can't open book, network issues, etc.)
    if (error) {
        return <Preview icon={BookIcon} message="Unable to load book cover" />;
    }

    // No cover available - book opened successfully but has no cover
    if (!cover) {
        return <Preview icon={BookIcon} message="Book Cover not available." />;
    }

    // Cover is available - show it (cover is guaranteed to be string here)
    return <ImageCard url={cover} checkNsfw={checkNsfw} setIsNsfw={setIsNsfw} />;
};

export default BookCard;
