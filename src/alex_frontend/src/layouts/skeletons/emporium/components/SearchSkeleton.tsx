import React from 'react'
import { Skeleton } from "@/lib/components/skeleton"

const SearchSkeleton = () => {
    return (
        <div className="w-full mt-4">
            <Skeleton className="h-10 md:h-12 w-full rounded-lg" />
            <div className="flex w-full gap-4 flex-wrap justify-center mt-4">
                <Skeleton className="h-10 md:h-[50px] w-24 md:w-[100px] xl:w-[120px] rounded-lg" />
                <Skeleton className="h-10 md:h-[50px] flex-grow min-w-[230px] md:min-w-[400px] xl:min-w-[600px] rounded-lg" />
            </div>
        </div>
    )
}

export default SearchSkeleton