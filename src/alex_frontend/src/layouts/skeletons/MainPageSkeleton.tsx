import React, { useEffect } from "react";
import NProgress from "nprogress";

const MainPageSkeleton = () => {
	useEffect(() => {
		NProgress.start();
        return () => {
			NProgress.done();
        };
    }, []);
	return (
		<>
			<div className="flex-grow px-4 py-8">
				<div className="flex justify-between items-center mb-8">
					<div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />{" "}
					{/* Title */}
				</div>
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="w-full h-32 bg-gray-100 rounded animate-pulse" />{" "}
					{/* Content */}
				</div>
			</div>
		</>
	);
};

export default MainPageSkeleton;
