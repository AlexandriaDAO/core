import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getUnlockedLBRY from "../../features/balance/lbry/thunks/unlocked";
import getAmountICP from "../../features/balance/icp/thunks/amount";
import getRatio from "../../features/balance/lbry/thunks/ratio";
import swapLbry from "../../features/balance/lbry/thunks/swapLbry";
import { clearSwapError } from "../../features/balance/lbry/lbrySlice";

import { Button } from "@/lib/components/button";
import { Card, CardContent } from "@/lib/components/card";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Alert } from "@/components/Alert";
import { useIcpSwap, useIcpLedger } from "@/hooks/actors";
import { RefreshCw, X } from "lucide-react";
import { icp_fee, minimum_icp } from "@/utils/utils";

const ExchangePage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.auth);
	const { amount: icpBalance, amountLoading: icpLoading } = useAppSelector(state => state.balance.icp);
	const {unlocked, ratio, swapping, swapError, ratioLoading, unlockedLoading} = useAppSelector((state) => state.balance.lbry);

	const { actor: icpLedgerActor } = useIcpLedger();
	const { actor: icpSwapActor } = useIcpSwap();

	const [amountICP, setAmountICP] = useState("");

	const tentativeLBRY = useMemo(() => Number(amountICP) * ratio, [amountICP, ratio]);
	const availableBalance = useMemo(() => (icpBalance > 0 ? icpBalance.toFixed(4) : "0.0000"), [icpBalance]);
	const isValidAmount = useMemo(() => Number(amountICP) > 0 && Number(amountICP) >= minimum_icp && Number(amountICP) <= icpBalance, [amountICP, icpBalance]);

	const handleSubmit = useCallback(async (event: React.FormEvent) => {
		event.preventDefault();
		if (!icpLedgerActor || !icpSwapActor || !isValidAmount) return;

		try {
			const amountAfterFees = Number(amountICP).toFixed(4);
			await dispatch(
				swapLbry({
					actorIcpLedger: icpLedgerActor,
					actorSwap: icpSwapActor,
					amount: amountAfterFees,
				})
			).unwrap();

			// Refresh balances after successful swap
			dispatch(getUnlockedLBRY());
			dispatch(getAmountICP());
			setAmountICP("");
		} catch (error) {}
	},[icpLedgerActor, icpSwapActor, user?.principal, amountICP, isValidAmount]);

	const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
			setAmountICP(value);
		}
	},[]);

	const handleMaxIcp = useCallback(() => {
		const userBal = Math.max(0, icpBalance - 2 * icp_fee);
		setAmountICP(userBal.toFixed(4));
	}, [icpBalance]);

	useEffect(() => {
		dispatch(getRatio());
	}, []);

	return (
		<div className="max-w-7xl mx-auto">
			{/* Error Alert */}
			{swapError && (
				<div className="relative mb-6">
					<Alert variant="danger" title="Swap Error">{swapError}</Alert>
					<Button
						variant="muted"
						scale="icon"
						rounded="full"
						onClick={() => dispatch(clearSwapError())}
						className="absolute top-2 right-2"
					>
						<X size={16} />
					</Button>
				</div>
			)}

			<div className="grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 gap-6">
				{/* Left Side - Swap Form */}
				<div className="space-y-4">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							Exchange
						</h2>
						<p className="text-gray-600 dark:text-gray-400">
							Swap your ICP tokens for LBRY tokens at current
							market rates.
						</p>
					</div>
					<Card className="flex-grow">
						<CardContent className="pt-6">
							<form onSubmit={handleSubmit} className="space-y-4">
								{/* ICP Amount Input */}
								<div>
									<div className="flex justify-between items-center">
										<Label htmlFor="swap-amount">Amount to swap</Label>
										<div className={`flex items-center space-x-2 ${icpLoading ? "opacity-50" : "opacity-100"}`}>
											<span className="text-sm text-muted-foreground">Balance:</span>
											<span className="text-sm font-medium">{availableBalance} ICP</span>
											<img className="w-8 h-8" src="images/icp-logo.png" alt="ICP"/>
											<Button
												type="button"
												variant="ghost"
												scale="icon"
												onClick={() => dispatch(getAmountICP())}
												disabled={icpLoading}
											>
												<RefreshCw size={14} className={`${icpLoading ? "animate-spin" : ""}`}/>
											</Button>
										</div>
									</div>

									<div className="relative">
										<Input
											id="swap-amount"
											type="number"
											min="0"
											step="any"
											value={amountICP}
											onChange={handleAmountChange}
											placeholder="0"
											disabled={swapping}
											className="pr-20 text-xl"
										/>
										<div className="absolute right-3 top-1/2 -translate-y-1/2 flex justify-between items-center gap-2">
											<span className="text-sm font-medium text-muted-foreground">ICP</span>
											<Button
												type="button"
												variant="ghost"
												scale="sm"
												onClick={handleMaxIcp}
												disabled={swapping}
											>
												Max
											</Button>
										</div>
									</div>
								</div>

								{/* LBRY Receive Preview */}
								<div>
									<div className="flex justify-between items-center">
										<h5 className="text-lg font-roboto-condensed font-medium text-gray-900 dark:text-white">You receive</h5>
										<div className={`flex items-center space-x-2 ${unlockedLoading ? "opacity-50" : "opacity-100"}`}>
											<span className="text-sm text-muted-foreground">Balance:</span>
											<span className="text-sm font-medium">{unlocked > 0 ? unlocked.toFixed(4): "0.0000"} LBRY</span>
											<img className="w-4 h-4" src="images/lbry-logo.svg" alt="LBRY"/>
											<Button
												type="button"
												variant="ghost"
												scale="icon"
												onClick={() => dispatch(getUnlockedLBRY())}
												disabled={unlockedLoading}
											>
												<RefreshCw size={14} className={`${unlockedLoading ? "animate-spin" : ""}`}/>
											</Button>
										</div>
									</div>

									<div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
										<div className="flex items-center space-x-2">
											<img className="w-6 h-6" src="images/lbry-logo.svg" alt="LBRY"/>
											<span className="font-medium">LBRY</span>
										</div>
										<span className="font-medium">{tentativeLBRY.toFixed(4)}</span>
									</div>
								</div>
								<Button
									type="submit"
									disabled={!isValidAmount || swapping}
									variant="info"
									scale="md"
									className={`w-full ${!isValidAmount || swapping ? "opacity-50" : "opacity-100"}`}
								>
									{swapping ? "Processing..." : "Swap ICP to LBRY"}
								</Button>

								{/* Validation Alerts */}
								{Number(amountICP) > 0 && Number(amountICP) < minimum_icp && <Alert variant="danger" title="Amount Too Small" > Please enter at least {minimum_icp} ICP to proceed</Alert>}

								{Number(amountICP) > icpBalance && <Alert variant="danger" title="Insufficient Balance">Amount exceeds available ICP balance</Alert>}

								{!Number(amountICP) && (
									<Alert title="Info">
										If the transaction doesn't complete as
										expected, please check the redeem page
										to locate your tokens.
									</Alert>
								)}
							</form>
						</CardContent>
					</Card>
				</div>

				{/* Right Side - Transaction Info */}
				<div className="space-y-4">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							Transaction Summary
						</h2>
						<p className="text-gray-600 dark:text-gray-400">
							Review your swap details before confirming the transaction.
						</p>
					</div>

					<Card>
						<CardContent className="pt-6">
							<ul className="ps-0 space-y-4">
							<li className="flex justify-between">
								<strong className="lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200">
									Network Fees
								</strong>
								<span className="lg:text-lg md:text-base sm:text-sm font-semibold text-radiocolor dark:text-gray-200">
									{icp_fee} ICP
								</span>
							</li>
							<li className="flex justify-between">
								<strong className="lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200">
									Send
								</strong>
								<span className="lg:text-lg md:text-base sm:text-sm font-semibold text-radiocolor dark:text-gray-200 break-all">
									{Number(amountICP)} ICP
								</span>
							</li>
							<li className="flex justify-between">
								<strong className="lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200">
									Receive
								</strong>
								<span className="lg:text-lg md:text-base sm:text-sm font-semibold text-radiocolor dark:text-gray-200 break-all">
									{tentativeLBRY.toFixed(4)} LBRY
								</span>
							</li>
							<li className="flex justify-between">
								<strong className="lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200">
									Exchange Rate
								</strong>
								<span className="lg:text-lg md:text-base sm:text-sm font-semibold text-radiocolor dark:text-gray-200">
									{ratioLoading
										? "Loading..."
										: `1 ICP = ${ratio.toFixed(4)} LBRY`}
								</span>
							</li>
							<li className="pt-4 border-t border-gray-200 dark:border-gray-600">
								<strong className="lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200">
									For each ICP you swap, you'll receive{" "}
									<span className="text-[#FF9900] dark:text-yellow-400">
										{ratio.toFixed(4)}
									</span>{" "}
									LBRY tokens.
								</strong>
							</li>
							<li>
								<strong className="lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200">
									Please review the details carefully, as
									swaps are irreversible and cannot be undone
									once confirmed.
								</strong>
							</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default ExchangePage;
