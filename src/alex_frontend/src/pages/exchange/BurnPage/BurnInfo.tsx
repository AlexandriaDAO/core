import React, { useEffect } from 'react';
import { Card, CardContent } from '@/lib/components/card';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import getRatio from '@/features/balance/lbry/thunks/ratio';
import getRate from '@/features/balance/alex/thunks/rate';
import getFee from '@/features/balance/lbry/thunks/fee';

const BurnInfo: React.FC = () => {
	const dispatch = useAppDispatch();
	const { burnable } = useAppSelector(state => state.balance);
	const { ratio, fee } = useAppSelector(state => state.balance.lbry);
	const { rate } = useAppSelector(state => state.balance.alex);

	useEffect(() => {
		dispatch(getRatio());
		dispatch(getRate());
		dispatch(getFee());
	}, [dispatch]);

	return(
		<div className="space-y-4">
			<div>
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Burn Information</h2>
				<p className="text-gray-600 dark:text-gray-400">
					Current rates and requirements for burning LBRY tokens.
				</p>
			</div>

			{/* Current Rates Card */}
			<Card>
				<CardContent className="pt-6">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Current Rates</h3>
					<div className="space-y-1.5 text-sm">
						{/* Max Burn Allowed - moved to top */}
						{burnable >= 0 && (
							<div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
								<div className="flex justify-between items-center">
									<span className="font-semibold text-blue-800 dark:text-blue-200">Max Burn Allowed</span>
									<span className="font-bold text-blue-800 dark:text-blue-200">
										{burnable.toFixed(4)} LBRY
									</span>
								</div>
							</div>
						)}

						<div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
							<span className="text-gray-600 dark:text-gray-300">LBRY → ICP</span>
							<span className="font-semibold text-gray-900 dark:text-white">
								{ratio > 0 ? `1 LBRY = ${(1 / (ratio * 2)).toFixed(4)} ICP` : 'Loading...'}
							</span>
						</div>
						<div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
							<span className="text-gray-600 dark:text-gray-300">LBRY → ALEX</span>
							<span className="font-semibold text-gray-900 dark:text-white">
								{rate > 0 ? `1 LBRY = ${rate.toFixed(4)} ALEX` : 'Loading...'}
							</span>
						</div>
						<div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
							<span className="text-gray-600 dark:text-gray-300">Network Fee</span>
							<span className="font-semibold text-gray-900 dark:text-white">
								{fee > 0 ? `${fee.toFixed(4)} LBRY` : 'Loading...'}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* How it works Card */}
			<Card>
				<CardContent className="pt-6">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How it works</h3>
					<div className="text-sm text-gray-600 dark:text-gray-400">
						<p className="mb-3">
							Burning LBRY tokens allows you to earn both ICP and ALEX rewards based on current market rates.
						</p>
						<ul className="list-disc list-inside space-y-1 ml-2">
							<li>You burn your LBRY tokens permanently</li>
							<li>Receive ICP tokens as primary reward</li>
							<li>Receive ALEX tokens as bonus reward</li>
							<li>Rewards are calculated based on current ratios</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			{/* Limits Card */}
			<Card>
				<CardContent className="pt-6">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Limits & Requirements</h3>
					<div className="text-sm text-gray-600 dark:text-gray-400">
						<ul className="list-disc list-inside space-y-1 ml-2 mb-4">
							<li>Maximum ALEX reward per transaction: 50 tokens</li>
							<li>Burn amount limited by canister balance availability</li>
							<li>Must have sufficient LBRY balance for transaction fees</li>
						</ul>

						{/* Important Notice - moved here */}
						<div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
							<p className="text-sm text-yellow-800 dark:text-yellow-200">
								<strong>⚠️ Important:</strong> Burning LBRY is irreversible. Make sure you understand the current rates before proceeding.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
};

export default BurnInfo;