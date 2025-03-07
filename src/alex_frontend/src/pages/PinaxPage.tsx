import React, { lazy, Suspense } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { reset } from "@/features/upload/uploadSlice";
import useNavigationGuard from "@/features/upload/hooks/useNavigationGuard";

const AlexWalletActor = lazy(() => import("@/actors").then(module => ({ default: module.AlexWalletActor })));
const NftManagerActor = lazy(() => import("@/actors").then(module => ({ default: module.NftManagerActor })));
const Upload = lazy(() => import("@/features/upload"));

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
		<Suspense fallback={<div>Loading components...</div>}>
			<AlexWalletActor>
				<NftManagerActor>
					<div className="py-10 flex-grow flex justify-center items-center">
						<div className="w-full">
							<div className="space-y-6 max-w-2xl mx-auto">
								<Upload />
							</div>
						</div>
					</div>
				</NftManagerActor>
			</AlexWalletActor>
		</Suspense>

	);
}

export default PinaxPage;