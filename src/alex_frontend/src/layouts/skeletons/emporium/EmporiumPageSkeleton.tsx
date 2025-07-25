import React from "react";
import CardSkeleton from "./components/CardSkeleton";

const EmporiumPageSkeleton = () =>(
	<div className="container px-2 lg:mb-20 md:mb-16 sm:mb-10 xs:mb-6">
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{Array(4).fill(0).map((_, index) => <CardSkeleton key={index} />)}
		</div>
	</div>
);

export default EmporiumPageSkeleton;