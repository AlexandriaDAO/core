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
  const [inputError, setInputError] = useState(false);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputError(false);
    setPageInput(e.target.value);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit();
    }
  };

  const handlePageInputSubmit = () => {
    const newPage = parseInt(pageInput);
    if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
      setInputError(false);
      onPageChange(newPage);
    } else {
      setInputError(true);
      // Reset to current page after a short delay
      setTimeout(() => {
        setPageInput(currentPage.toString());
        setInputError(false);
      }, 2000);
    }
  };

  // Update page input when currentPage changes
  React.useEffect(() => {
    setPageInput(currentPage.toString());
    setInputError(false);
  }, [currentPage]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg border border-input bg-background w-full">
      <div className="text-sm">
        <p className="text-muted-foreground">
          Page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
          <span className="font-medium text-foreground">{totalPages}</span>
          {' · '}
          <span className="font-medium text-foreground">{totalItems}</span> items
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-3 py-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <Input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputKeyDown}
              onBlur={handlePageInputSubmit}
              className={`w-[60px] text-center ${inputError ? 'border-red-500' : ''}`}
              disabled={loading}
            />
            {inputError && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-red-500 whitespace-nowrap">
                Enter page 1-{totalPages}
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}; 