import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { getCallerAssetCanister } from "@/apps/Modules/shared/state/assetManager/assetManagerThunks";
import CanisterView from "./CanisterView";
import NonCanisterView from "./NonCanisterView";
import CanisterCardSkeleton from "./CanisterCardSkeleton";

function CanisterCard() {
	const dispatch = useAppDispatch();
	const { userAssetCanister, isLoading } = useAppSelector(state => state.assetManager);

	useEffect(() => {
		dispatch(getCallerAssetCanister());
	}, []);

	if (isLoading) {
		return <CanisterCardSkeleton />;
	}

	return (
		<div className="max-w-md p-3 flex gap-2 flex-col rounded-xl border">
			<div className="flex justify-between items-center">
				<div className="font-syne font-medium text-xl">
					Canister
				</div>
			</div>
			<div className="flex flex-col gap-4 justify-start items-center">
				{userAssetCanister ? <CanisterView /> : <NonCanisterView/>}
			</div>
		</div>
	);
}

export default CanisterCard;