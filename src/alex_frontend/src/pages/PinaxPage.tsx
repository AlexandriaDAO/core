import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Upload from "@/features/upload";
import { reset } from "@/features/upload/uploadSlice";
import useNavigationGuard from "@/features/upload/hooks/useNavigationGuard";

function PinaxPage() {
	const dispatch = useAppDispatch();
	const { uploading, minting, transaction, minted } = useAppSelector(state => state.upload);

	// Handle cleanup on unmount
	React.useEffect(() => {
		return () => {
			dispatch(reset());
		};
	}, [dispatch]);

	// Custom hook for navigation guards
	useNavigationGuard({ uploading, minting, transaction, minted });

	return (
		<div className="py-10 flex-grow flex justify-center items-center">
			<div className="w-full">
				<div className="space-y-6 max-w-2xl mx-auto">
					<Upload />
				</div>
			</div>
		</div>
	);
}

export default PinaxPage;