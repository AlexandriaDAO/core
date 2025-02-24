import React from "react";

const Failed = () => {
	return (
		<div className="flex flex-col items-center justify-center py-10">
			<h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
				Upload Failed
			</h1>
			<p className="mt-6 text-base leading-7 text-gray-600">
				Your files could not be uploaded.
			</p>
		</div>
	);
};

export default Failed;
