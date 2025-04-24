import { Button } from '@/lib/components/button';
import React, { useState } from 'react';
import { FilterIcon, Fingerprint, Hash } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/lib/components/dropdown-menu";


const Filter: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<'token-id' | 'principal'>('token-id');
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" scale="md" rounded="lg" className='font-syne border-border px-8' onClick={() => setOpen(!open)}>
                        <span className="font-medium">Filter</span>
                        <FilterIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start">
                    <DropdownMenuLabel className="text-center">Filter By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className='space-y-1'>
                        {filter === 'token-id'?
                             <DropdownMenuItem onClick={e=> e.preventDefault()} className='cursor-not-allowed bg-primary focus:bg-primary text-white focus:text-white'>
                                <Hash /> <span>Token ID</span>
                            </DropdownMenuItem>
                            :
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(event) => {
                                    event.preventDefault();
                                    setFilter('token-id');
                                }}>
                                <Hash /> <span>Token ID</span>
                            </DropdownMenuItem>
                        }

                        {filter === 'principal' ? (
                            <DropdownMenuItem onClick={e=> e.preventDefault()} className='cursor-not-allowed bg-primary focus:bg-primary text-white focus:text-white'>
                                <Fingerprint /> <span>Principal</span>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={(event) => {
                                    event.preventDefault();
                                    setFilter('principal');
                                }}>
                                <Fingerprint /> <span>Principal</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default Filter;