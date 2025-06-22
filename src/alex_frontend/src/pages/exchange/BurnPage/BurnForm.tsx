import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import getUnlockedLBRY from '../../../features/balance/lbry/thunks/unlocked';
import getUnlockedALEX from '../../../features/balance/alex/thunks/unlocked';
import getAmountICP from '../../../features/balance/icp/thunks/amount';

import burn from '../../../features/balance/lbry/thunks/burn';
import amount from '../../../features/balance/thunks/amount';
import archived from '../../../features/balance/thunks/archived';
import unclaimed from '../../../features/balance/thunks/unclaimed';
import { Button } from '@/lib/components/button';
import { Card, CardContent } from '@/lib/components/card';
import { Input } from '@/lib/components/input';
import { Label } from '@/lib/components/label';
import { Alert } from '@/components/Alert';
import { useIcpSwap, useLbry } from '@/hooks/actors';
import { RefreshCw } from 'lucide-react';

const BurnForm: React.FC = () => {
	const dispatch = useAppDispatch();
	const { unlocked, burning, ratio, fee, unlockedLoading } = useAppSelector(state => state.balance.lbry);
	const { rate } = useAppSelector(state => state.balance.alex);
	const { burnable } = useAppSelector(state => state.balance);

	const { actor: lbryActor } = useLbry();
	const { actor: icpSwapActor } = useIcpSwap();

	const [amountLBRY, setAmountLBRY] = useState(0);

	const tentativeICP = useMemo(() => (amountLBRY / ratio) / 2, [amountLBRY, ratio]);
	const tentativeALEX = useMemo(() => amountLBRY * rate , [amountLBRY, rate]);
	const availableBalance = useMemo(() => unlocked > 0 ? unlocked.toFixed(4) : "0.0000", [unlocked]);
	const isValidAmount = useMemo(() => amountLBRY > 0 && amountLBRY <= unlocked && amountLBRY <= burnable && tentativeALEX <= 50, [amountLBRY, unlocked, burnable, tentativeALEX]);

	const handleSubmit = useCallback(async (event: React.FormEvent) => {
		event.preventDefault();
		if (!lbryActor || !icpSwapActor || !isValidAmount) return;

		try {
			await dispatch(burn({ lbryActor,swapActor: icpSwapActor,amount: amountLBRY})).unwrap();

			// Refresh balances after successful burn
			dispatch(getUnlockedLBRY());
			dispatch(getUnlockedALEX());
			dispatch(getAmountICP());

			dispatch(amount());
			dispatch(archived());
			dispatch(unclaimed());
			setAmountLBRY(0);
		} catch (error) {}
	}, [ lbryActor, icpSwapActor, amountLBRY, isValidAmount]);

	const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
			setAmountLBRY(Number(value));
		}
	}, []);

	const handleMaxLbry = useCallback(() => {
		const userBal = Math.floor(Math.max(0, unlocked - Number(fee || 0)));
		setAmountLBRY(userBal);
	}, [unlocked, fee]);

	useEffect(() => {
		dispatch(amount());
		dispatch(archived());
		dispatch(unclaimed());
	}, []);

	return (
		<>
			<style>
				{`
				input[type="number"]::-webkit-inner-spin-button,
				input[type="number"]::-webkit-outer-spin-button {
					-webkit-appearance: none;
					margin: 0;
				}
				input[type="number"] {
					-moz-appearance: textfield;
				}
				`}
			</style>
			<Card className="flex-grow">
				<CardContent className="pt-6">
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Amount Input */}
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<Label htmlFor="burn-amount">Amount to burn</Label>
								<div className={`flex items-center space-x-2 ${unlockedLoading ? 'opacity-50':'opacity-100'}`}>
									<span className="text-sm text-muted-foreground">Balance:</span>
									<span className="text-sm font-medium">{availableBalance} LBRY</span>
									<img className="w-4 h-4" src="images/lbry-logo.svg" alt="LBRY" />
									<Button
										type="button"
										variant="ghost"
										scale="icon"
										onClick={() => dispatch(getUnlockedLBRY())}
										disabled={unlockedLoading}
									>
										<RefreshCw size={14} className={`${unlockedLoading ? 'animate-spin':''}`} />
									</Button>
								</div>
							</div>

							<div className="relative">
								<Input
									id="burn-amount"
									type="number"
									min="0"
									step="any"
									value={amountLBRY.toString()}
									onChange={handleAmountChange}
									placeholder="0"
									disabled={burning}
									className="pr-20 text-xl"
								/>
								<div className="absolute right-3 top-1/2 -translate-y-1/2 flex justify-between items-center gap-2">
									<span className="text-sm font-medium text-muted-foreground">
										LBRY
									</span>
									<Button
										type="button"
										variant="ghost"
										scale="sm"
										onClick={handleMaxLbry}
										disabled={burning}
									>
										Max
									</Button>
								</div>
							</div>
						</div>

						{/* Rewards Preview */}
						<div className="space-y-3">
							<h5 className="text-lg font-roboto-condensed font-medium text-gray-900 dark:text-white">You get</h5>

							{/* ICP Reward */}
							<div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
								<div className="flex items-center space-x-2">
									<img className="w-6 h-6" src="images/icp-logo.png" alt="ICP" />
									<span className="font-medium">ICP</span>
								</div>
								<span className={`font-medium ${amountLBRY > burnable ? 'text-red-500' : ''}`}>
									{tentativeICP.toFixed(4)}
								</span>
							</div>

							{/* ALEX Reward */}
							<div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
								<div className="flex items-center space-x-2">
									<img className="w-6 h-6" src="images/alex-logo.svg" alt="ALEX" />
									<span className="font-medium">ALEX</span>
								</div>
								<span className={`font-medium ${tentativeALEX > 50 ? 'text-red-500' : ''}`}>
									{tentativeALEX.toFixed(4)}
								</span>
							</div>
						</div>

						<Button
							type="submit"
							disabled={!isValidAmount || burning}
							variant='info'
							scale="md"
							className={`w-full ${!isValidAmount || burning ? 'opacity-50' : 'opacity-100'}`}
						>
							{burning ? 'Processing...' : 'Burn LBRY'}
						</Button>

						{/* Validation Alerts */}
						{amountLBRY > burnable && (
							<Alert variant="danger" title="Amount Exceeds Limit">
								Amount exceeds maximum burn allowed: {burnable.toFixed(4)} LBRY
							</Alert>
						)}

						{tentativeALEX > 50 && (
							<Alert variant="danger" title="ALEX Limit Exceeded">
								ALEX reward exceeds 50 token limit
							</Alert>
						)}

						{!amountLBRY && (
							<Alert title="Info">
								If the transaction doesn't complete as expected, please check the redeem page to locate your tokens.
							</Alert>
						)}
					</form>
				</CardContent>
			</Card>
		</>
	);
};

export default BurnForm;