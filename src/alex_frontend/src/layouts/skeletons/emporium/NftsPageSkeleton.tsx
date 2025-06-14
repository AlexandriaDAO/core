import React from "react";
import HeaderSkeleton from "./components/HeaderSkeleton";
import NftsSkeleton from "./components/NftsSkeleton";

const NftsPageSkeleton = () =>(
	<>
		<HeaderSkeleton />
		<div className="container px-2">
			<div className="lg:mb-20 md:mb-16 sm:mb-10 xs:mb-6">
				<NftsSkeleton />
			</div>
		</div>
	</>
);

export default NftsPageSkeleton;
