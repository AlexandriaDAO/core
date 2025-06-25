import React, { useState, useCallback, useEffect } from "react";
import { ArrowUpFromLine, X, LoaderCircle } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useLbry } from "@/hooks/actors";
import withdraw from "../thunks/withdraw";
import fee from "../thunks/fee";
import fetchUnlockedLbry from "../thunks/unlocked";
import { clearWithdrawError, clearFeeError } from "../lbrySlice";
import { Alert } from "@/components/Alert";
import { Principal } from "@dfinity/principal";

const Withdraw: React.FC = () => {
	const dispatch = useAppDispatch();
	const { actor: lbryActor } = useLbry();
	const { unlocked: lbryBalance, withdrawing, withdrawError, fee: lbryFee, feeLoading, feeError } = useAppSelector((state) => state.balance.lbry);
	
	const [isOpen, setIsOpen] = useState(false);
	const [amount, setAmount] = useState("");
	const [destination, setDestination] = useState("");
	const [destinationError, setDestinationError] = useState("");

	const availableBalance = lbryBalance > 0 ? lbryBalance.toFixed(4) : "0.0000";
	const currentFee = lbryFee > 0 ? lbryFee : 0.0001; // fallback fee
	const isValidAmount = Number(amount) > 0 && Number(amount) <= lbryBalance && Number(amount) >= currentFee;
	const isValidDestination = destination.trim().length > 0 && !destinationError;
	const canWithdraw = isValidAmount && isValidDestination && !withdrawing;

	const validateDestination = (value: string): boolean => {
		try {
			if (!value) {
				setDestinationError("Destination is required");
				return false;
			}
			
			// LBRY uses Principal IDs only
			try {
				Principal.fromText(value);
				setDestinationError("");
				return true;
			} catch (e) {
				setDestinationError("Invalid Principal ID format");
				return false;
			}
		} catch (error) {
			setDestinationError("Invalid destination format");
			return false;
		}
	};

	const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
			setAmount(value);
		}
	}, []);

	const handleMaxLbry = useCallback(() => {
		const userBal = Math.max(0, lbryBalance - currentFee);
		setAmount(userBal.toFixed(4));
	}, [lbryBalance, currentFee]);

	const handleDestinationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setDestination(value);
		if (value) {
			validateDestination(value);
		} else {
			setDestinationError("");
		}
	}, []);

	const handleSubmit = useCallback(async (event: React.FormEvent) => {
		event.preventDefault();
		if (!lbryActor || !canWithdraw) return;

		try {
			await dispatch(
				withdraw({
					actor: lbryActor,
					amount: amount,
					destination: destination,
				})
			).unwrap();

			// Reset amount and refresh balance on success but keep dialog open
			setAmount("");
			dispatch(fetchUnlockedLbry());
		} catch (error) {
			// Error handled by slice
		}
	}, [lbryActor, amount, destination, canWithdraw, dispatch]);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			// Clear any previous errors when opening and fetch fee if not available
			dispatch(clearWithdrawError());
			dispatch(clearFeeError());
			if (lbryFee <= 0) {
				dispatch(fee());
			}
		} else {
			// Reset form when closing
			setAmount("");
			setDestination("");
			setDestinationError("");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<ArrowUpFromLine size="18" className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors" />
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>Withdraw</p>
				</TooltipContent>
			</Tooltip>
			<DialogContent className="w-auto max-w-md flex flex-col gap-6 font-roboto-condensed p-6" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
				<div className="text-center">
					<DialogTitle className="text-lg font-semibold">Withdraw LBRY</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Enter amount and destination to withdraw your LBRY
					</DialogDescription>
				</div>

				{/* Error Alert */}
				{withdrawError && (
					<div className="relative">
						<Alert variant="danger" title="Withdraw Error">{withdrawError}</Alert>
						<Button
							variant="muted"
							scale="icon"
							rounded="full"
							onClick={() => dispatch(clearWithdrawError())}
							className="absolute top-2 right-2"
						>
							<X size={16} />
						</Button>
					</div>
				)}

				{/* Fee Error Alert */}
				{feeError && (
					<div className="relative">
						<Alert variant="danger" title="Fee Error">{feeError}</Alert>
						<Button
							variant="muted"
							scale="icon"
							rounded="full"
							onClick={() => dispatch(clearFeeError())}
							className="absolute top-2 right-2"
						>
							<X size={16} />
						</Button>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Amount Input */}
					<div>
						<div className="flex justify-between items-center">
							<Label htmlFor="withdraw-amount">Enter amount</Label>
							<div className="flex items-center space-x-2">
								<span className="text-sm text-muted-foreground">Balance:</span>
								<span className="text-sm font-medium">{availableBalance} LBRY</span>
								<img className="w-4 h-4" src="images/lbry-logo.svg" alt="LBRY"/>
							</div>
						</div>

						<div className="relative">
							<Input
								id="withdraw-amount"
								type="number"
								min="0"
								step="any"
								value={amount}
								onChange={handleAmountChange}
								placeholder="0"
								disabled={withdrawing}
								className="pr-20"
							/>
							<div className="absolute right-3 top-1/2 -translate-y-1/2 flex justify-between items-center gap-2">
								<span className="text-sm font-medium text-muted-foreground">LBRY</span>
								<Button
									type="button"
									variant="ghost"
									scale="sm"
									onClick={handleMaxLbry}
									disabled={withdrawing}
								>
									Max
								</Button>
							</div>
						</div>
					</div>

					{/* Destination Input */}
					<div>
						<Label htmlFor="withdraw-destination">Destination Address</Label>
						<Input
							id="withdraw-destination"
							type="text"
							value={destination}
							onChange={handleDestinationChange}
							placeholder="Enter Principal ID"
							disabled={withdrawing}
							className={`${destinationError ? 'border-destructive' : ''}`}
						/>
						{destinationError && (
							<div className="text-destructive text-sm mt-1">
								{destinationError}
							</div>
						)}
					</div>

					{/* Fee Display */}
					<div className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg">
						<div className="flex justify-between items-center text-sm">
							<span className="text-muted-foreground">Network Fee:</span>
							<span className="font-medium">
								{feeLoading ? "Loading..." : `${currentFee.toFixed(4)} LBRY`}
							</span>
						</div>
					</div>

					{/* Validation Messages */}
					{Number(amount) > 0 && Number(amount) < currentFee && (
						<Alert variant="danger" title="Amount Too Small">
							Please enter at least {currentFee.toFixed(4)} LBRY to cover network fees
						</Alert>
					)}

					{Number(amount) > lbryBalance && (
						<Alert variant="danger" title="Insufficient Balance">
							Amount exceeds available LBRY balance
						</Alert>
					)}
				</form>

				<DialogFooter className="justify-between sm:justify-between items-center gap-2">
					<Button
						onClick={handleSubmit}
						disabled={!canWithdraw}
						variant="info"
						className="flex-1"
					>
						{withdrawing ? (
							<>
								<LoaderCircle size={18} className="animate-spin" />
								<span>Withdrawing...</span>
							</>
						) : (
							<>
								<ArrowUpFromLine size={18} />
								<span>Withdraw</span>
							</>
						)}
					</Button>

					<DialogClose asChild>
						<Button type="button" variant="inverted" className="px-4 py-2">
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default Withdraw;