import { Button } from '@/lib/components/button';
import React, { useEffect, useState } from 'react';
import { EllipsisVertical } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/lib/components/dropdown-menu";
import { PageSizeOptions, setSize, setPage } from "../listingsSlice";
import { useAppDispatch} from "@/store/hooks/useAppDispatch";
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { Badge } from '@/lib/components/badge';

const PageSize: React.FC = () => {
    const dispatch = useAppDispatch();
    const { size } = useAppSelector((state) => state.imporium.listings);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        dispatch(setPage(0));
    }, [size]);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" scale="md" rounded="lg" className='font-syne border-border px-4 gap-0 relative' onClick={() => setOpen(!open)}>
                        <span className="font-medium">Page Size</span>
                        <EllipsisVertical className="h-4" />
                        <Badge className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {size}
                        </Badge>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start">
                    <DropdownMenuLabel className="text-center">Items On Page</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className='space-y-1'>
                        {PageSizeOptions.map((option) => (
                            size === option ? (
                                <DropdownMenuItem key={option} onClick={e=> e.preventDefault()} className='cursor-not-allowed bg-primary focus:bg-primary text-white focus:text-white'>
                                    <span>{option} items</span>
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    key={option}
                                    className="cursor-pointer"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        dispatch(setSize(option));
                                    }}>
                                    <span>{option} items</span>
                                </DropdownMenuItem>
                            )
                        ))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default PageSize;