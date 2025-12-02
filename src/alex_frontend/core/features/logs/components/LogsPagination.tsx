import React from "react";
import ReactPaginate from "react-paginate";

interface LogsPaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (event: { selected: number }) => void;
    disabled?: boolean;
}

const LogsPagination: React.FC<LogsPaginationProps> = ({
    totalPages,
    currentPage,
    onPageChange,
    disabled = false,
}) => {
    if (totalPages <= 1) return null;

    return (
        <div className={`flex justify-center my-8 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
            <ReactPaginate
                previousLabel="←"
                nextLabel="→"
                breakLabel="..."
                pageCount={totalPages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={disabled ? () => {} : onPageChange}
                forcePage={currentPage > 0 ? currentPage - 1 : 0}
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

export default LogsPagination;