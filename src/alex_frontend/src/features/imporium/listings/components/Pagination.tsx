import React, { useCallback, useEffect } from 'react';
import { useAppDispatch} from "@/store/hooks/useAppDispatch";
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { setPage } from "@/features/imporium/listings/listingsSlice";
import getListings from "../thunks/getListings";
import ReactPaginate from 'react-paginate';

const Pagination: React.FC = () => {
    const dispatch = useAppDispatch();
    const { page, pages, size, sortByPrice, sortByTime } = useAppSelector((state) => state.imporium.listings);

    const handlePageClick = useCallback((event: { selected: number }) => {
        dispatch(getListings({ page: event.selected, size, sortByPrice, sortByTime }));
        dispatch(setPage(event.selected));
    }, [size, sortByPrice, sortByTime]);

    if(!pages || pages <= 0) return null;

    return (
        <div className="flex justify-center my-8">
            <ReactPaginate
                previousLabel="←"
                nextLabel="→"
                breakLabel="..."
                pageCount={pages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                forcePage={page}
                containerClassName="flex items-center gap-1"
                pageLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                previousLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                nextLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                breakLinkClassName="flex items-center justify-center w-10 h-10 text-muted-foreground"
                activeLinkClassName="!bg-primary text-white hover:!bg-primary/90"
                disabledLinkClassName="opacity-50 cursor-not-allowed hover:bg-transparent"
            />
        </div>
    );
};

export default Pagination;