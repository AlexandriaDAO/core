import React from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Arinax from "@/features/arinax";
import { reset } from "@/features/arinax/arinaxSlice";
import useNavigationGuard from "@/features/arinax/hooks/useNavigationGuard";

function ArinaxPage() {
	const dispatch = useAppDispatch();
	const { uploading, minting, transaction, minted } = useAppSelector(state => state.arinax);

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
					<Arinax />
				</div>
			</div>
		</div>
	);
}

export default ArinaxPage;