import React from 'react'

const NodeSkeleton = () => {
    return (
        <div className="animate-pulse">
            <div className="p-4 rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
        </div>
    );
}

export default NodeSkeleton