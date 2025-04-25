import React, { useEffect } from 'react';
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

const PageSize: React.FC = () => {
	const dispatch = useAppDispatch();
	const { size, found } = useAppSelector((state) => state.imporium.listings);

	useEffect(() => {
		dispatch(setPage(0));
	}, [size]);

	return (
        <Select
            disabled={Object.keys(found).length > 0}
            value={size.toString()}
            onValueChange={(value) => dispatch(setSize(Number(value)))}
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