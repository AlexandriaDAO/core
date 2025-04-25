import React, { useEffect } from "react";
import NProgress from "nprogress";
import HeaderSkeleton from "./components/HeaderSkeleton";
import ContentSkeleton from "./components/ContentSkeleton";
import SearchSkeleton from "./components/SearchSkeleton";

const EmporiumSkeleton = () => {
	useEffect(() => {
		NProgress.start();
        return () => {
			NProgress.done();
        };
    }, []);

	return (
		<>
			{/* Header section */}
			<HeaderSkeleton>
				<SearchSkeleton />
			</HeaderSkeleton>

			{/* Content Skeleton */}
			<ContentSkeleton />
		</>
	);
};

export default EmporiumSkeleton;
