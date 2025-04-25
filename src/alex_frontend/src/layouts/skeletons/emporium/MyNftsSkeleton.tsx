import React, { useEffect } from "react";
import NProgress from "nprogress";
import HeaderSkeleton from "./components/HeaderSkeleton";
import NftsSkeleton from "./components/NftsSkeleton";

const MyNftsSkeleton = () => {
	useEffect(() => {
		NProgress.start();
        return () => {
			NProgress.done();
        };
    }, []);

	return (
		<>
			{/* Header section */}
			<HeaderSkeleton />

			{/* NFTs Skeleton */}
			<div className="container px-2">
				<div className="lg:mb-20 md:mb-16 sm:mb-10 xs:mb-6">
					<NftsSkeleton />
				</div>
			</div>
		</>
	);
};

export default MyNftsSkeleton;
