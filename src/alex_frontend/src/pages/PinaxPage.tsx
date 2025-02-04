import FileUpload from "@/features/file-upload";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";
import { useBlocker } from "react-router";

function PinaxPage() {
	const {uploading, minting} = useAppSelector(state=>state.fileUpload)

	// Handle tab/browser closing
	React.useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (uploading || minting) {
				// Cancel the event
				e.preventDefault();
				// Chrome requires returnValue to be set
				e.returnValue = 'You have an upload in progress. Are you sure you want to leave? The upload will be cancelled.';
				// For older browsers
				return 'You have an upload in progress. Are you sure you want to leave? The upload will be cancelled.';
			}
		};

		if (uploading || minting) {
			window.addEventListener('beforeunload', handleBeforeUnload);
		}

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [uploading, minting]);

	// Block navigation when uploading or minting is true
	useBlocker(
		({ currentLocation, nextLocation }) => {
			if ((uploading || minting) && currentLocation.pathname !== nextLocation.pathname) {
				return !window.confirm(
					"You have an upload in progress. Are you sure you want to leave? The upload will be cancelled."
				);
			}
			return false;
		}
	);
	
	return (
		<div className="py-10 flex-grow flex justify-center items-center">
			<FileUpload />
		</div>
	);
}

export default PinaxPage;