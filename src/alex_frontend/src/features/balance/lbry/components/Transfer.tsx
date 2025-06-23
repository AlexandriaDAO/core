import React, { useState, useCallback, useEffect } from "react";
import { ArrowDownToLine, X, LoaderCircle } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useLbry, useNftManager } from "@/hooks/actors";
import transfer from "../thunks/transfer";
import fee from "../thunks/fee";
import fetchUnlockedLbry from "../thunks/unlocked";
import fetchLockedLbry from "../thunks/locked";
import { clearTransferError, clearFeeError } from "../lbrySlice";
import { Alert } from "@/components/Alert";

const Transfer: React.FC = () => {
	const dispatch = useAppDispatch();
	const { actor: lbryActor } = useLbry();
	const { actor: nftManagerActor } = useNftManager();
	const { user } = useAppSelector((state) => state.auth);
	const { unlocked: lbryBalance, transferring, transferError, fee: lbryFee, feeLoading, feeError } = useAppSelector((state) => state.balance.lbry);

	const [isOpen, setIsOpen] = useState(false);
	const [amount, setAmount] = useState("");

	const availableBalance = lbryBalance > 0 ? lbryBalance.toFixed(4) : "0.0000";
	const currentFee = lbryFee > 0 ? lbryFee : 0.04; // single fee for transfer
	const isValidAmount = Number(amount) > 0 && Number(amount) <= lbryBalance && Number(amount) >= currentFee;
	const canTransfer = isValidAmount && !transferring && user?.principal && lbryActor && nftManagerActor;

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

	const handleSubmit = useCallback(async (event: React.FormEvent) => {
		event.preventDefault();
		if (!canTransfer) return;

		try {
			await dispatch(
				transfer({
					nftManagerActor: nftManagerActor!,
					lbryActor: lbryActor!,
					amount: amount,
					userPrincipal: user!.principal,
				})
			).unwrap();

			// Reset amount and refresh balances on success but keep dialog open
			setAmount("");
			dispatch(fetchUnlockedLbry());
			dispatch(fetchLockedLbry());
		} catch (error) {
			// Error handled by slice
		}
	}, [canTransfer, nftManagerActor, lbryActor, amount, user, dispatch]);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			// Clear any previous errors when opening and fetch fee if not available
			dispatch(clearTransferError());
			dispatch(clearFeeError());
			if (lbryFee <= 0) {
				dispatch(fee());
			}
		} else {
			// Reset form when closing
			setAmount("");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<ArrowDownToLine size="18" className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors" />
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>Topup</p>
				</TooltipContent>
			</Tooltip>
			<DialogContent className="w-auto max-w-md flex flex-col gap-6 font-roboto-condensed p-6" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
				<div className="text-center">
					<DialogTitle className="text-lg font-semibold">Transfer to Spending Wallet</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Transfer LBRY from main wallet to spending wallet.
					</DialogDescription>
				</div>

				{/* Error Alert */}
				{transferError && (
					<div className="relative">
						<Alert variant="danger" title="Transfer Error" className="mb-0">{transferError}</Alert>
						<Button
							variant="muted"
							scale="icon"
							rounded="full"
							onClick={() => dispatch(clearTransferError())}
							className="absolute top-2 right-2"
						>
							<X size={16} />
						</Button>
					</div>
				)}

				{/* Fee Error Alert */}
				{feeError && (
					<div className="relative">
						<Alert variant="danger" title="Fee Error" className="mb-0">{feeError}</Alert>
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
							<Label htmlFor="transfer-amount">Enter amount</Label>
							<div className="flex items-center space-x-2">
								<span className="text-sm text-muted-foreground">Available:</span>
								<span className="text-sm font-medium">{availableBalance} LBRY</span>
								<img className="w-4 h-4" src="images/lbry-logo.svg" alt="LBRY"/>
							</div>
						</div>

						<div className="relative">
							<Input
								id="transfer-amount"
								type="number"
								min="0"
								step="any"
								value={amount}
								onChange={handleAmountChange}
								placeholder="0"
								disabled={transferring}
								className="pr-20"
							/>
							<div className="absolute right-3 top-1/2 -translate-y-1/2 flex justify-between items-center gap-2">
								<span className="text-sm font-medium text-muted-foreground">LBRY</span>
								<Button
									type="button"
									variant="ghost"
									scale="sm"
									onClick={handleMaxLbry}
									disabled={transferring}
								>
									Max
								</Button>
							</div>
						</div>
					</div>

					{/* Fee Display */}
					<div className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-3 rounded-lg">
						<div className="flex justify-between items-center text-sm">
							<span className="text-muted-foreground">Network Fees:</span>
							<span className="font-medium">
								{feeLoading ? "Loading..." : `${currentFee.toFixed(4)} LBRY`}
							</span>
						</div>
					</div>

					{/* Info Alert */}
					<Alert variant="info" title="Info">
						Transferring LBRY to locked balance allows you to use it for platform features like uploading, NFT creation and trading.
					</Alert>

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

					{!user && (
						<Alert variant="warning" title="Authentication Required">
							Please sign in to transfer LBRY tokens
						</Alert>
					)}
				</form>

				<DialogFooter className="justify-between sm:justify-between items-center gap-2">
					<Button
						onClick={handleSubmit}
						disabled={!canTransfer}
						variant="info"
						className="flex-1"
					>
						{transferring ? (
							<>
								<LoaderCircle size={18} className="animate-spin" />
								<span>Transferring...</span>
							</>
						) : (
							<>
								<ArrowDownToLine size={18} />
								<span>Transfer</span>
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

export default Transfer;