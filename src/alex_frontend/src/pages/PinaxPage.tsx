import FileUpload from "@/features/file-upload";
import { reset } from "@/features/file-upload/fileUploadSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";
import { useBlocker } from "react-router";

function PinaxPage() {
	const dispatch = useAppDispatch();
	const {uploading, minting, transaction, minted} = useAppSelector(state=>state.fileUpload)

	useEffect(()=>{
		return ()=>{
			dispatch(reset());
		}
	}, [reset, dispatch])

	// Handle tab/browser closing
	React.useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (uploading) {
				// Cancel the event
				e.preventDefault();
				// Chrome requires returnValue to be set
				e.returnValue = 'You have an upload in progress. Are you sure you want to leave? The upload will be lost.';
				// For older browsers
				return 'You have an upload in progress. Are you sure you want to leave? The upload will be lost.';
			}
			
			if (minting) {
				// Cancel the event
				e.preventDefault();
				// Chrome requires returnValue to be set
				e.returnValue = 'You have a minting process in progress. Are you sure you want to leave? Minting can fail in the process.';
				// For older browsers
				return 'You have a minting process in progress. Are you sure you want to leave? Minting can fail in the process.';
			}

			if (transaction && minted !== transaction) {
				e.preventDefault();
				e.returnValue = 'Your file is not minted. If you leave now you will lose the transaction. Make sure to copy the transaction id and file url.';
				return 'Your file is not minted. If you leave now you will lose the transaction. Make sure to copy the transaction id and file url.';
			}
		};

		if (uploading || minting || (transaction && minted !== transaction)) {
			window.addEventListener('beforeunload', handleBeforeUnload);
		}

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [uploading, minting, transaction, minted]);

	// Block navigation when uploading or minting is true
	useBlocker(
		({ currentLocation, nextLocation }) => {
			if (currentLocation.pathname !== nextLocation.pathname) {
				if (uploading) {
					return !window.confirm(
						"You have an upload in progress. Are you sure you want to leave? The upload will be lost."
					);
				}
				if (minting) {
					return !window.confirm(
						"You have a minting process in progress. Are you sure you want to leave? Minting can fail in the process."
					);
				}
				if (transaction && minted !== transaction) {
					return !window.confirm(
						"Your file is not minted. If you leave now you will lose the transaction. Make sure to copy the transaction id and file url."
					);
				}
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