import React from 'react'
import { Skeleton } from "@/lib/components/skeleton"

const PaginationSkeleton = () => {
    return (
        <div className="flex justify-center items-center space-x-2 mt-4 py-4">
            {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={`page-${item}`} className="h-8 w-8 rounded-lg" />
            ))}
        </div>
    )
}

export default PaginationSkeleton