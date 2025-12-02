import React from "react";
import { Button } from "@/lib/components/button";
import SearchBox from "./SearchBox";
import SortToggle from "./SortToggle";
import { FilterToggle } from "./Filters";
import { RotateCw } from "lucide-react";

interface FilterBarProps {
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore?: boolean;
    transactionsCount: number;
    onRefresh: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ isLoading, isRefreshing, isLoadingMore, transactionsCount, onRefresh }) => {
    return (
        <div className="flex flex-wrap items-stretch gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <FilterToggle isLoading={isLoading} />

            <SortToggle isLoading={isLoading} count={transactionsCount}/>

            <SearchBox disabled={isLoading} isRefreshing={isRefreshing} />

            <Button
                onClick={onRefresh}
                variant="outline"
                scale="icon"
                rounded="full"
                title="Refresh results"
            >
                <RotateCw size={28} className={`p-1 ${isLoading || isRefreshing || isLoadingMore ? "animate-spin" : ""}`} />
            </Button>
        </div>
    )
}

export default FilterBar;