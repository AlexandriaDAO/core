import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import LoginPrompt from "./LoginPrompt";
import LoadingView from "./LoadingView";
import RedeemForm from "./RedeemForm";
import InfoCard from "./InfoCard";
import RedeemError from "./RedeemError";
import { IcpSwapActor } from "@/actors";

const RedeemPage: React.FC = () => {
	const { user } = useAppSelector((state) => state.auth);
	const { redeeming } = useAppSelector((state) => state.balance.icp);

	return (
		<IcpSwapActor>
			<div className="px-4 py-8">
				<div className="max-w-7xl mx-auto">
					{/* Error Alert */}
					<RedeemError />

					<div className="space-y-8">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<div className="flex flex-col gap-4">
								<div>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Redeem Archive</h2>
									<p className="text-gray-600 dark:text-gray-400">Recover your archived ICP balance.</p>
								</div>

								{!user ? (
									<LoginPrompt />
								) : redeeming ? (
									<LoadingView />
								) : (
									<RedeemForm />
								)}
							</div>

							<InfoCard />
						</div>
					</div>
				</div>
			</div>
		</IcpSwapActor>
	);
};

export default RedeemPage;
