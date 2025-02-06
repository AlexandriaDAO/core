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
					{/* Title */}
					<div className="w-32 h-8 bg-secondary rounded animate-pulse" />

					{/* Action */}
					<div className="w-32 h-8 bg-secondary rounded animate-pulse" />
				</div>
				<div className="bg-secondary rounded-lg shadow-md p-6">
					{/* Content */}
					{/* <div className="w-full h-32 bg-secondary-foreground rounded animate-pulse" />{" "} */}
				</div>
			</div>
		</>
	);
};

export default MainPageSkeleton;
