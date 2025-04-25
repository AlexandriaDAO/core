import React, { useEffect } from "react";
import NProgress from "nprogress";
import HeaderSkeleton from "./components/HeaderSkeleton";
import BoxSkeleton from "./components/BoxSkeleton";
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

			{/* Single content box */}
			<BoxSkeleton />
		</>
	);
};

export default EmporiumSkeleton;
