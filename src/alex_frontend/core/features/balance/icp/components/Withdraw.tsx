import React, { useState, useCallback } from "react";
import { ArrowUpFromLine, X, LoaderCircle } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useIcpLedger } from "@/hooks/actors";
import withdraw from "../thunks/withdraw";
import fetchIcpAmount from "../thunks/amount";
import { clearWithdrawError } from "../icpSlice";
import { icp_fee } from "@/utils/utils";
import { Alert } from "@/components/Alert";
import { Principal } from "@dfinity/principal";

const Withdraw: React.FC = () => {
	const dispatch = useAppDispatch();
	const { actor: icpLedgerActor } = useIcpLedger();
	const { amount: icpBalance, withdrawing, withdrawError } = useAppSelector((state) => state.balance.icp);
	
	const [isOpen, setIsOpen] = useState(false);
	const [amount, setAmount] = useState("");
	const [destination, setDestination] = useState("");
	const [destinationError, setDestinationError] = useState("");

	const availableBalance = icpBalance > 0 ? icpBalance.toFixed(4) : "0.0000";
	const isValidAmount = Number(amount) > 0 && Number(amount) <= icpBalance && Number(amount) >= icp_fee;
	const isValidDestination = destination.trim().length > 0 && !destinationError;
	const canWithdraw = isValidAmount && isValidDestination && !withdrawing;

	const validateDestination = (value: string): boolean => {
		try {
			if (!value) {
				setDestinationError("Destination is required");
				return false;
			}
			// Try to parse as Principal ID first
			try {
				Principal.fromText(value);
				setDestinationError("");
				return true;
			} catch (e) {
				// If not a valid Principal, check if it looks like an Account ID (64 hex chars)
				if (/^[a-fA-F0-9]{64}$/.test(value)) {
					setDestinationError("");
					return true;
				} else {
					setDestinationError("Invalid Principal ID or Account ID format");
					return false;
				}
			}
		} catch (error) {
			setDestinationError("Invalid destination format");
			return false;
		}
	};

	const getAccountType = (value: string): string => {
		try {
			Principal.fromText(value);
			return "principal";
		} catch (e) {
			return "account";
		}
	};

	const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
			setAmount(value);
		}
	}, []);

	const handleMaxIcp = useCallback(() => {
		const userBal = Math.max(0, icpBalance - icp_fee);
		setAmount(userBal.toFixed(4));
	}, [icpBalance]);

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
		if (!icpLedgerActor || !canWithdraw) return;

		const accountType = getAccountType(destination);

		try {
			await dispatch(
				withdraw({
					actor: icpLedgerActor,
					amount: amount,
					destination: destination,
					accountType: accountType,
				})
			).unwrap();

			// Reset amount and refresh balance on success but keep dialog open
			setAmount("");
			dispatch(fetchIcpAmount());
		} catch (error) {
			// Error handled by slice
		}
	}, [icpLedgerActor, amount, destination, canWithdraw, dispatch]);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			// Clear any previous errors when opening
			dispatch(clearWithdrawError());
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
					<DialogTitle className="text-lg font-semibold">Withdraw ICP</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Enter amount and destination to withdraw your ICP
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

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Amount Input */}
					<div>
						<div className="flex justify-between items-center">
							<Label htmlFor="withdraw-amount">Enter amount</Label>
							<div className="flex items-center space-x-2">
								<span className="text-sm text-muted-foreground">Balance:</span>
								<span className="text-sm font-medium">{availableBalance} ICP</span>
								<img className="w-4 h-4" src="images/icp-logo.png" alt="ICP"/>
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
								<span className="text-sm font-medium text-muted-foreground">ICP</span>
								<Button
									type="button"
									variant="ghost"
									scale="sm"
									onClick={handleMaxIcp}
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
							placeholder="Enter Principal ID or Account ID"
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
							<span className="font-medium">{icp_fee} ICP</span>
						</div>
					</div>

					{/* Validation Messages */}
					{Number(amount) > 0 && Number(amount) < icp_fee && (
						<Alert variant="danger" title="Amount Too Small">
							Please enter at least {icp_fee} ICP to cover network fees
						</Alert>
					)}

					{Number(amount) > icpBalance && (
						<Alert variant="danger" title="Insufficient Balance">
							Amount exceeds available ICP balance
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