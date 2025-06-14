import React from 'react'
import CardSkeleton from './CardSkeleton'

interface NftsSkeletonProps {
  count?: number
}

const NftsSkeleton: React.FC<NftsSkeletonProps> = ({ count = 4 }) => (
    <div className="container px-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(count).fill(0).map((_, index) => <CardSkeleton key={index} />)}
        </div>
    </div>
)

export default NftsSkeleton