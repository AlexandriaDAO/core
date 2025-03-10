import React, { useState } from 'react';
import { ArrowDownNarrowWide, ArrowDownWideNarrow } from "lucide-react";
import { Button } from '@/lib/components/button';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { setSearchEmporium } from '../emporiumSlice';

const PriceSort = () => {
    const dispatch = useAppDispatch();
    const search = useAppSelector((state) => state.emporium.search);

    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Tracks current sort order
    const [isSortActive, setIsSortActive] = useState(false); // Tracks whether sorting is active

    const toggleSortOrder = () => {
        if (!isSortActive) return; // Ignore sort changes if sorting is not active
        const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newSortOrder);
        handleSearchStateChange(newSortOrder)
    };

    const toggleSortActivation = () => {
        const newActiveState = !isSortActive;
        setIsSortActive(newActiveState);
        if (!newActiveState) {
            handleSearchStateChange("");
            setSortOrder("asc"); // Reset sort order when deactivating sort
        }
        else {
            handleSearchStateChange(sortOrder);
        }
    };

    const handleSearchStateChange = (value: string) => {
        dispatch(setSearchEmporium({ ...search, sort: value }));
    }
    return (
        <div className="price-sort">
            <span className="block mb-3 text-lg font-medium font-['Syne'] text-foreground">
                Price Sort</span>
            <div className='flex gap-1'>
                <div className="toggle-container">
                    <Button
                        className={`toggle-Button  rounded-xl${isSortActive ? "active dark:bg-[#FFFFFF] dark:text-black dark:border-[#FFFFFF] rounded-xl " : ""}`}
                        onClick={toggleSortActivation}
                        aria-label="Activate or deactivate sorting"
                    >
                        {isSortActive ? "Active" : "Inactive"}
                    </Button>

                </div>

                <Button
                    className={`sort-Button rounded-xl dark:border-white dark:hover:bg-grey ${isSortActive ? "" : "disabled"}`}
                    onClick={toggleSortOrder}
                    aria-label="Sort by price"
                    disabled={!isSortActive} // Disable Button when sorting is inactive
                >

                    {sortOrder === "desc" && <ArrowDownWideNarrow className="h-4 w-4 dark:white" />}
                    {sortOrder === "asc" && <ArrowDownNarrowWide className="h-4 w-4 dark:white" />}
                </Button>
               
            </div>
        </div>
    )
}
export default PriceSort;