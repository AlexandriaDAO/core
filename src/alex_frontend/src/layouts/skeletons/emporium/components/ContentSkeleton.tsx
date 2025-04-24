import React from 'react'
import PaginationSkeleton from './PaginationSkeleton'
import NftsSkeleton from './NftsSkeleton'
import NavigationSkeleton from './NavigationSkeleton'

const ContentSkeleton = () => {
    return (
        <div className="container px-2 mt-10">
            {/* Content wrapper */}
            <div className="flex flex-col space-y-8 mb-10">
                {/* Navigation strip */}
                <NavigationSkeleton />

                {/* Main content */}
                <NftsSkeleton />

                {/* Pagination */}
                <PaginationSkeleton />
            </div>
        </div>
    )
}

export default ContentSkeleton