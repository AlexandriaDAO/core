import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/select";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  loading: boolean;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => Promise<void>;
  onItemsPerPageChange: (value: number) => Promise<void>;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  loading,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) => {
  const [pageInput, setPageInput] = useState(currentPage.toString());

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newPage = parseInt(pageInput);
      if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
        onPageChange(newPage);
      } else {
        setPageInput(currentPage.toString());
      }
    }
  };

  // Update page input when currentPage changes
  React.useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-[14px] rounded-2xl border border-input bg-background w-full">
      <div className="text-sm">
        <p className="text-muted-foreground">
          Page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
          <span className="font-medium text-foreground">{totalPages}</span>
          {' · '}
          <span className="font-medium text-foreground">{totalItems}</span> items
        </p>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            onKeyDown={handlePageInputKeyDown}
            className="w-[60px] text-center"
            disabled={loading}
          />
          
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}; 