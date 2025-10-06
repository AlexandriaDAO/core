import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import LoginPrompt from "./LoginPrompt";
import LoadingView from "./LoadingView";
import BurnForm from "./BurnForm";
import BurnInfo from "./BurnInfo";
import { setBurnable } from "@/features/balance/balanceSlice";
import BurnError from "./BurnError";

const BurnPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.auth);
	const { amount, archived, unclaimed } = useAppSelector(state => state.balance);
	const { ratio, burning } = useAppSelector(state => state.balance.lbry);

	useEffect(()=>{
		if(ratio < 0 || amount < 0 || archived < 0 || unclaimed < 0) {
			dispatch(setBurnable(-1))
			return;
		}

		let lbryPerIcp = ratio * 2;
		let remainingBalance = amount - (unclaimed + archived);
		let actualAvailable = remainingBalance / 2; // 50% for stakers
		let maxAllowed = actualAvailable * lbryPerIcp;

		if(maxAllowed < 0) {
			dispatch(setBurnable(-1));
			return;
		}

		dispatch(setBurnable(maxAllowed));
	}, [ratio, amount, archived, unclaimed])

	return (
		<div className="px-4 py-8">
			<div className="max-w-7xl mx-auto">
				{/* Error Alert */}
				<BurnError />

				<div className="space-y-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div className="space-y-4">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Burn LBRY</h2>
								<p className="text-gray-600 dark:text-gray-400">
									Burn LBRY tokens to earn ICP and ALEX rewards.
								</p>
							</div>

							{!user ? <LoginPrompt /> : burning ? <LoadingView /> : <BurnForm /> }
						</div>

						<BurnInfo />
					</div>
				</div>
			</div>
		</div>
	);
};

export default BurnPage;
