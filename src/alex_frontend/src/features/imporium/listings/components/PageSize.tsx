import React, { useCallback } from 'react';
import { PageSizeOptions, setSize, setPage } from "../listingsSlice";
import { useAppDispatch} from "@/store/hooks/useAppDispatch";
import { useAppSelector } from '@/store/hooks/useAppSelector';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/lib/components/select";
import getListings from '../thunks/getListings';

const PageSize: React.FC = () => {
	const dispatch = useAppDispatch();
	const { size, found, sortByPrice, sortByTime } = useAppSelector((state) => state.imporium.listings);

    const handleSizeChange = useCallback((value: string) => {
        const newSize = Number(value);
        dispatch(setSize(newSize));
		dispatch(setPage(0));
        dispatch(getListings({ page: 0, size: newSize, sortByPrice, sortByTime }));
    },[sortByPrice, sortByTime]);

	return (
        <Select
            disabled={Object.keys(found).length > 0}
            value={size.toString()}
            onValueChange={handleSizeChange}
        >
            <SelectTrigger className="w-32 min-w-28 h-12 font-syne border-border focus:ring-1 focus:outline-0">
                <SelectValue placeholder="Page Size" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Per Page</SelectLabel>
                    {PageSizeOptions.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                            {option} items
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
	);
};

export default PageSize;