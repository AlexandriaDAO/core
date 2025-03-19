import React from "react";
import { Check, LoaderPinwheel, TriangleAlert, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";

function UploadProgress() {
	const {
		progress,
		scanning,
		fetching,
		selecting,
		uploading,
		estimating,
		cost,
		estimateError,
		fetchError,
		selectError,
		uploadError,
		scanError,
	} = useAppSelector((state) => state.upload);

	let statusText = "Preparing...";

	if (scanning) statusText = "Scanning content";
	else if (estimating) statusText = "Estimating cost";
	else if (fetching) statusText = "Fetching wallets";
	else if (fetchError) statusText = "Couldn't fetch wallets";
	else if (selecting) statusText = "Selecting wallet";
	else if (selectError) statusText = "Couldn't select a suitable wallet";
	else if (uploading) statusText = "Uploading file";
	else if (uploadError) statusText = "Couldn't upload file";
	else if (scanError) statusText = "Inappropriate content";
	else if (cost) statusText = "Ready to upload";

	return (
		<div className="flex justify-between items-center gap-2">
			<div className="flex-grow h-4 bg-secondary dark:bg-[#3A3630] rounded-full border dark:border-transparent overflow-hidden">
				{progress > 0 ? (
					<div
						className="h-full bg-primary dark:bg-white rounded-full"
						style={{ width: `${progress}%` }}
					/>
				) : (
					<div className="h-full text-xs flex justify-center items-center text-gray-700 dark:text-gray-300">{statusText}</div>
				)}
			</div>
			{fetching || selecting || uploading ? (
				<LoaderPinwheel
					size={20}
					className="animate-spin text-muted-foreground"
				/>
			) : progress >= 100 ? (
				<Check size={26} className="text-constructive" />
			) : estimateError || fetchError || selectError || uploadError ? (
				<TriangleAlert size={20} className="text-destructive" />
			) : null}
		</div>
	);
}

export default UploadProgress;
