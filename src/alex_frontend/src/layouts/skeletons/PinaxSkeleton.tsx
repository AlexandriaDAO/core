import React from "react";
import { ChevronUp } from "lucide-react";

function PinaxSkeleton() {
	return (
        <div className="py-10 px-4 sm:px-6 md:px-10 flex-grow flex justify-center">
            <div className="max-w-2xl w-full flex flex-col justify-center items-center gap-8">

                {/* Heading Skeleton */}
                <div className="flex flex-col justify-center items-center">
                    <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md mb-2"></div>
                    <div className="h-4 w-64 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md"></div>
                </div>

                {/* Description Skeleton */}
                <div className="flex justify-center items-center gap-4">
                    <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-full"></div>
                    <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-full"></div>
                </div>

                {/* Steps Skeleton */}
                <div className="w-full flex justify-center items-center gap-6">
                    <div className="flex justify-center items-center gap-2">
                        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-full"></div>
                        <div className="w-16 h-4 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md"></div>
                    </div>

                    <div className="flex-grow h-0.5 bg-gray-300 dark:bg-gray-700 animate-pulse"></div>

                    <div className="flex justify-center items-center gap-2">
                        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-full"></div>
                        <div className="w-16 h-4 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md"></div>
                    </div>

                    <div className="flex-grow h-0.5 bg-gray-300 dark:bg-gray-700 animate-pulse"></div>

                    <div className="flex justify-center items-center gap-2">
                        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-full"></div>
                        <div className="w-16 h-4 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md"></div>
                    </div>
                </div>

                {/* File Selector Skeleton */}
                <div className="w-full font-roboto-condensed space-y-1">
                    {/* Accordion Skeleton */}
                    <button className="w-full font-syne text-xl flex items-center justify-between group">
                        <div className="h-7 w-56 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md"></div>
                        <span className="text-sm text-gray-300 dark:text-gray-600">
                            <ChevronUp
                                className="w-6 h-6 text-gray-300 dark:text-gray-600"
                                strokeWidth={2}
                            />
                        </span>
                    </button>

                    {/* Expanded content (fileSelector is true) */}
                    <div className="relative border-2 rounded-lg py-8 px-4 sm:px-6 md:px-8 text-center border-gray-300 dark:border-gray-700 border-dashed">
                        <div className="space-y-6">
                            {/* Drag and drop text */}
                            <div className="flex justify-center">
                                <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                            </div>

                            <div className="flex justify-center">
                                <div className="h-5 w-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                            </div>

                            {/* Select file button */}
                            <div className="flex justify-center">
                                <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full"></div>
                            </div>

                            {/* File Type Categories */}
                            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                                {[1, 2, 3, 4].map((index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-start justify-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 border rounded dark:border-gray-700"
                                    >
                                        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                                        <div className="w-full flex flex-col items-center justify-center gap-2 p-2 bg-card/50 border border-border rounded dark:border-gray-700">
                                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
	);
}

export default PinaxSkeleton;
