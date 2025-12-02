import React from "react";

const HeaderSkeleton = () => {
	return (
        <div className="flex-grow-0 flex-shrink-0 bg-gray-900basis-24">
            <div className="h-24 px-10 flex items-center justify-between">
                <div className="w-32 h-8 bg-gray-600 rounded animate-pulse" />
                {/* Logo */}
                <div className="flex gap-4">
                    {/* Tabs */}
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="w-24 h-8 bg-gray-600 rounded animate-pulse"
                        />
                    ))}
                </div>
                <div className="w-32 h-8 bg-gray-600 rounded animate-pulse" />{" "}
                {/* Auth */}
            </div>
        </div>
	);
};

export default HeaderSkeleton;
