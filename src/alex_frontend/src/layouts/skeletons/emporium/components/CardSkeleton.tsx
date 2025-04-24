import React from 'react'
import { Skeleton } from "@/lib/components/skeleton"
import { Card, CardContent, CardFooter } from '@/lib/components/card';

const CardSkeleton = () => {
    return (
        <Card className="w-full overflow-hidden">
            <Skeleton className="h-56 w-full" />
            <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                    <Skeleton className="h-6 w-12 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-24 w-full mt-4" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}

export default CardSkeleton;