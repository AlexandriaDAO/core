import React from 'react'
import { Skeleton } from "@/lib/components/skeleton"

const NavigationSkeleton = () => {
    return (
        <div className="flex space-x-2 overflow-x-auto py-2">
            {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={`nav-${item}`} className="h-10 w-28 rounded-lg shrink-0" />
            ))}
        </div>
    )
}

export default NavigationSkeleton