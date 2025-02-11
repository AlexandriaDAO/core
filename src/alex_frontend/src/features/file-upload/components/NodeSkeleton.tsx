import React from 'react'

const NodeSkeleton = () => {
    return (
        <div className="animate-pulse">
            <div className="p-3 rounded border-2 border-gray-400 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="h-10 bg-gray-400 rounded w-9/12 dark:bg-gray-700"></div>
                    <div className="h-10 bg-gray-400 rounded w-2/12 dark:bg-gray-700"></div>
                </div>
            </div>
        </div>
    );
}

export default NodeSkeleton