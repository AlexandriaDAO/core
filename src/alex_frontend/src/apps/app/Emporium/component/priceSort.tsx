import React, { useState } from 'react';
import { ArrowDownNarrowWide, ArrowUpNarrowWide, Filter } from "lucide-react";
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
    };

    const handleSearchStateChange = (value: string) => {
         dispatch(setSearchEmporium({ ...search, sort: value }));
    }
    return (
        <div className="price-sort">
                <span className="label mb-3 block">Price Sort</span>
                <div className='flex gap-1'>
            <div className="toggle-container">
                <Button
                    className={`toggle-Button  rounded-xl${isSortActive ? "active" : ""}`}
                    onClick={toggleSortActivation}
                    aria-label="Activate or deactivate sorting"
                >
                    {isSortActive ? "Active" : "Inactive"}
                </Button>
                
            </div>

            <Button
                className={`sort-Button rounded-xl ${isSortActive ? "" : "disabled"}`}
                onClick={toggleSortOrder}
                aria-label="Sort by price"
                disabled={!isSortActive} // Disable Button when sorting is inactive
            >

                {sortOrder === "asc" && <ArrowUpNarrowWide className="h-4 w-4" />}
                {sortOrder === "desc" && <ArrowDownNarrowWide className="h-4 w-4" />}
            </Button>
            </div>
        </div>
    )
}
export default PriceSort;