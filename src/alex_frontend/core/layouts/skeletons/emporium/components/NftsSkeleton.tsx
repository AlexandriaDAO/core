import React from 'react'
import CardSkeleton from './CardSkeleton'
import { Skeleton } from '@/lib/components/skeleton'

interface NftsSkeletonProps {
  count?: number
}

const NftsSkeleton: React.FC<NftsSkeletonProps> = ({ count = 4 }) => (
    <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-5/12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(count).fill(0).map((_, index) => <CardSkeleton key={index} />)}
        </div>
    </div>
)

export default NftsSkeleton