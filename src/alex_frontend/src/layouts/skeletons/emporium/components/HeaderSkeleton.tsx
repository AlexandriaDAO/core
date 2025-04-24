import React from 'react'
import { Skeleton } from "@/lib/components/skeleton"

interface HeaderSkeletonProps {
    children?: React.ReactNode;
}

const HeaderSkeleton: React.FC<HeaderSkeletonProps> = ({ children }) => {
    return (
        <div className="flex flex-col items-center gap-3.5 md:gap-6 mx-auto py-10 sm:pb-4 px-5 w-full max-w-md md:max-w-2xl xl:max-w-[800px]">
            <Skeleton className="h-8 md:h-10 w-40 md:w-60 rounded-lg" />
            <Skeleton className="h-6 w-32 md:w-40 rounded-lg mt-2" />
            {children}
        </div>
    )
}

export default HeaderSkeleton