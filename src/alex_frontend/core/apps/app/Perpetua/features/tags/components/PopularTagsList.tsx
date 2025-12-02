import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/lib/components/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import { LoaderCircle } from "lucide-react";
import { useTagActions } from '../hooks/useTagActions';
import { useTagData } from '../hooks/useTagData';
import { RootState } from '@/store';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { selectTagShelfCountsMap } from '@/apps/app/Perpetua/state/perpetuaSlice';
import { Badge } from "@/lib/components/badge";

// Define thresholds for tag size tiers (adjust as needed)
const TAG_SIZE_THRESHOLDS = {
    low: 5,
    medium: 20,
};

const getTagSize = (count: number | undefined): 'small' | 'medium' | 'large' => {
    if (count === undefined) return 'small';
    if (count <= TAG_SIZE_THRESHOLDS.low) return 'small';
    if (count <= TAG_SIZE_THRESHOLDS.medium) return 'medium';
    return 'large';
};

export const PopularTagsList: React.FC = () => {
    const { fetchPopularTags, fetchTagShelfCount, setTagFilter } = useTagActions();
    const { popularTags, isLoadingPopularTags } = useTagData();
    const allCounts = useAppSelector(selectTagShelfCountsMap);

    
    useEffect(() => {
        fetchPopularTags({ limit: 20 });
    }, [fetchPopularTags]);

    useEffect(() => {
        popularTags.forEach(tagName => {
            const count = allCounts[tagName];
            if (count === undefined) {
                fetchTagShelfCount(tagName);
            }
        });
    }, [popularTags, fetchTagShelfCount, allCounts]);

    const handleTagClick = (tagName: string) => {
        setTagFilter(tagName);
    };

    if (isLoadingPopularTags && popularTags.length === 0) {
        return (
            <div className="flex items-center justify-center p-4">
                <LoaderCircle size={24} className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!isLoadingPopularTags && popularTags.length === 0) {
        return <p className="text-sm text-muted-foreground">No popular tags found.</p>;
    }

    // TODO: Handle error state from fetching popular tags

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2 mb-0 overflow-x-auto whitespace-nowrap py-2 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
                {popularTags.map(tagName => {
                    const count = allCounts[tagName];
                    const size = getTagSize(count);
                    const sizeClasses = 
                        size === 'large' ? 'text-base px-3 py-1.5' : 
                        size === 'medium' ? 'text-sm px-2.5 py-1' : 
                        'text-xs px-2 py-0.5';

                    return (
                        <Tooltip key={tagName} delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Badge
                                    variant="outline"
                                    className={`rounded-full cursor-pointer ${sizeClasses}`}
                                    onClick={() => handleTagClick(tagName)}
                                >
                                    {tagName}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Shelves: {count ?? 'Loading...'}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}; 