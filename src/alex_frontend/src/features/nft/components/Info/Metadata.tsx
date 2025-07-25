import React from "react";
import { formatFileSize } from "@/features/pinax/utils";

interface MetadataProps {
	status?: string;
	timestamp?: number;
	size?: number;
};

const dateFormat: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
}

const Metadata: React.FC<MetadataProps> = ({ timestamp = 0, size = 0, status }) => {

	const readableSize = size > 0 ? formatFileSize(size) : null;

	const readableTimestamp = timestamp > 0 ? new Date(timestamp * 1000).toLocaleDateString('en-US', dateFormat) : null;

	return (
		<div className="flex justify-between items-center gap-1 text-xs font-roboto-condensed">
			{ readableTimestamp && (
				<div>
					<span className="text-gray-500 text-sm">Date:</span>
					<p className="font-medium text-sm">
						{readableTimestamp}
					</p>
				</div>
			)}

			{ readableSize && (
				<div className="flex flex-col items-center">
					<span className="text-gray-500 text-sm">Size:</span>
					<p className="font-medium text-sm">
						{readableSize}
					</p>
				</div>
			)}


			{ status && (
				<div className="flex flex-col items-center">
					<span className="text-gray-500 text-sm">Status:</span>
					<div className="mt-1">
						<span className="px-2 py-1 text-xs font-medium rounded-full bg-info text-info-foreground">
							{status}
						</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default Metadata;
