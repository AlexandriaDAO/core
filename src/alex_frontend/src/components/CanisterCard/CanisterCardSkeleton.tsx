import React from "react";

function CanisterCardSkeleton() {
    return (
        <div className="max-w-md p-3 flex gap-2 flex-col rounded-xl border">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
                <div className="w-24 h-7 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <div className="flex flex-col gap-4 justify-start items-center">
                <div className="flex flex-col items-center justify-between gap-3">
                    {/* Icon skeleton */}
                    <div className="p-2 bg-gray-200 border rounded-full animate-pulse">
                        <div className="w-[22px] h-[22px] bg-gray-300 rounded-full"></div>
                    </div>
                    
                    {/* Text skeleton - using multiple lines for paragraph */}
                    <div className="flex flex-col items-center gap-2 w-full">
                        <div className="w-[250px] h-5 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-[220px] h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    
                    {/* Button skeleton */}
                    <div className="w-32 h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                </div>
            </div>
        </div>
    )
}

export default CanisterCardSkeleton;