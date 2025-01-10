import React from 'react';
import ReactPaginate from 'react-paginate';
import { Paginate } from '../styles';

interface PaginationComponentProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (selectedItem: { selected: number }) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({ totalPages, currentPage, onPageChange }) => {
    return (
            <Paginate className='py-5'>
                <ReactPaginate
                    breakLabel="....."
                    nextLabel="next >"
                    onPageChange={onPageChange}
                    pageRangeDisplayed={1}
                    pageCount={totalPages}
                    previousLabel="< previous"
                    renderOnZeroPageCount={null}
                    containerClassName="pagination"
                    activeClassName="selected"
                    disabledClassName="disabled"
                    forcePage={currentPage}
                    marginPagesDisplayed={1}
                />
            </Paginate>
    );
};

export default PaginationComponent;


