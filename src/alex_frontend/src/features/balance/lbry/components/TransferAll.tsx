import React, { useState, useCallback } from "react";
import { ArrowUpFromLine, X, LoaderCircle } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { Label } from "@/lib/components/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useNftManager } from "@/hooks/actors";
import transferAll from "../thunks/transferAll";
import fetchUnlockedLbry from "../thunks/unlocked";
import fetchLockedLbry from "../thunks/locked";
import { clearTransferError } from "../lbrySlice";
import { Alert } from "@/components/Alert";

const TransferAll: React.FC = () => {
	const dispatch = useAppDispatch();
	const { actor: nftManagerActor } = useNftManager();
	const { user } = useAppSelector((state) => state.auth);
	const { locked: lockedBalance, transferring, transferError } = useAppSelector((state) => state.balance.lbry);

	const [isOpen, setIsOpen] = useState(false);

	const availableLockedBalance = lockedBalance > 0 ? lockedBalance.toFixed(4) : "0.0000";
	const hasBalance = lockedBalance > 0;
	const canTransferAll = hasBalance && !transferring && user?.principal && nftManagerActor;

	const handleSubmit = useCallback(async () => {
		if (!canTransferAll) return;

		try {
			await dispatch(
				transferAll({
					nftManagerActor: nftManagerActor!,
					userPrincipal: user!.principal,
				})
			).unwrap();

			// Refresh balances on success and close dialog
			dispatch(fetchUnlockedLbry());
			dispatch(fetchLockedLbry());
			setIsOpen(false);
		} catch (error) {
			// Error handled by slice
		}
	}, [canTransferAll, nftManagerActor, user, dispatch]);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			// Clear any previous errors when opening
			dispatch(clearTransferError());
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
					<p>Withdraw All</p>
				</TooltipContent>
			</Tooltip>
			<DialogContent className="w-auto max-w-md flex flex-col gap-6 font-roboto-condensed p-6" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
				<div className="text-center">
					<DialogTitle className="text-lg font-semibold">Withdraw All</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Transfer all LBRY from your Spending wallet back to your Main wallet
					</DialogDescription>
				</div>

				{/* Error Alert */}
				{transferError && (
					<div className="relative">
						<Alert variant="danger" title="Transfer Error">{transferError}</Alert>
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

				{/* Balance Display */}
				<div className="space-y-4">
					<div>
						<Label>Spending Wallet Balance</Label>
						<div className="flex items-center justify-between p-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
							<div className="flex items-center space-x-2">
								<img className="w-6 h-6" src="images/lbry-logo.svg" alt="LBRY"/>
								<span className="font-medium">LBRY</span>
							</div>
							<span className="font-medium">{availableLockedBalance}</span>
						</div>
					</div>

					{/* Info Alert */}
					<Alert variant="info" title="Info">
						This will transfer all LBRY from your spending wallet back to your main wallet. This operation cannot be undone.
					</Alert>

					{/* Validation Messages */}
					{!hasBalance && (
						<Alert variant="warning" title="No Balance">
							No LBRY available in your spending wallet to transfer
						</Alert>
					)}

					{!user && (
						<Alert variant="warning" title="Authentication Required">
							Please sign in to transfer LBRY tokens
						</Alert>
					)}
				</div>

				<DialogFooter className="justify-between sm:justify-between items-center gap-2">
					<Button
						onClick={handleSubmit}
						disabled={!canTransferAll}
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
								<ArrowUpFromLine size={18} />
								<span>Transfer All</span>
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

export default TransferAll;