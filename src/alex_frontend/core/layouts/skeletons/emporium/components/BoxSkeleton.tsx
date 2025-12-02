import React from 'react'
import { Skeleton } from "@/lib/components/skeleton"

const BoxSkeleton = () => {
    return (
        <div className="container px-2 mt-10 mb-20">
            <Skeleton className="w-full h-[600px] rounded-lg" />
        </div>
    )
}

export default BoxSkeleton