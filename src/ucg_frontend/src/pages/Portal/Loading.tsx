import React from "react";
import { ImSpinner11 } from "react-icons/im";

const Loading = () => {
	return (
		<div className="flex items-center mt-6 text-center border border-gray-800 rounded-lg h-auto py-10 bg-blue-200">
			<div className="flex flex-col w-full px-4 mx-auto">
				<div className="p-3 mx-auto text-blue-500 bg-blue-100 rounded-full ">
					<ImSpinner11 className="animate-spin" />
				</div>
				<h1 className="mt-3 text-lg font-semibold text-gray-800 ">
					Loading
				</h1>
				<p className="mt-2 text-base text-gray-500 ">
					Please wait while we are loading your NFT's
				</p>
			</div>
		</div>
	);
};

export default Loading;
