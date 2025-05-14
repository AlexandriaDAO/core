import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import CanisterView from "./CanisterView";
import NonCanisterView from "./NonCanisterView";
// import CanisterCardSkeleton from "./CanisterCardSkeleton";

function CanisterCard() {
	// const dispatch = useAppDispatch();
	const { canister } = useAppSelector(state => state.auth);

	// if (isLoading) {
	// 	return <CanisterCardSkeleton />;
	// }

	return (
		<div className="max-w-md p-3 flex gap-2 flex-col rounded-xl border">
			<div className="flex justify-between items-center">
				<div className="font-syne font-medium text-xl">
					Canister
				</div>
			</div>
			<div className="flex flex-col gap-4 justify-start items-center">
				{canister ? <CanisterView /> : <NonCanisterView/>}
			</div>
		</div>
	);
}

export default CanisterCard;