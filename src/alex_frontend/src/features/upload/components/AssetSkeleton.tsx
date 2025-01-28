import React from 'react'


const AssetSkeleton = () => {
	return (
		<div className="group cursor-pointer hover:shadow-lg transition-shadow duration-800 bg-gray-50 rounded-lg p-6 basis-60 animate-pulse">
			<div className="flex flex-col items-center space-y-4">
				<div className="p-3 bg-gray-200 rounded-full w-12 h-12" />
				<div className="h-6 bg-gray-200 rounded w-16" />
				<div className="h-4 bg-gray-200 rounded w-32" />
			</div>
		</div>
	);
};

export default AssetSkeleton