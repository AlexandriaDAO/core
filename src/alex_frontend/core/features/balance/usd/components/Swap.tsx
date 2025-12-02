import React, { useCallback, useEffect, useState } from "react";
import { ArrowRightLeft, LoaderCircle, X } from "lucide-react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/lib/components/tooltip";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useStripe, useIcpLedger } from "@/hooks/actors";
import swap from "../thunks/swap";
import { clearSwapError } from "../usdSlice";
import { Alert } from "@/components/Alert";
import { Principal } from "@dfinity/principal";
import fetchIcpAmount from './../../icp/thunks/amount';
import fetchUsdAmount from './../thunks/amount';

const Swap: React.FC = () => {
	const dispatch = useAppDispatch();
	const { actor: stripeActor } = useStripe();
	const { actor: icpLedgerActor } = useIcpLedger();
	const {
		amount: usdBalance,
		swapping,
		swapError,
	} = useAppSelector((state) => state.balance.usd);

	const [isOpen, setIsOpen] = useState(false);
	const [canisterIcpBalance, setCanisterIcpBalance] = useState<number>(0);
	const [loadingBalance, setLoadingBalance] = useState(true);

	// Canister principal that holds ICP for swapping
	const SWAP_CANISTER_PRINCIPAL = "br5f7-7uaaa-aaaaa-qaaca-cai";

	// Fetch canister ICP balance
	useEffect(() => {
		const fetchCanisterBalance = async () => {
			if (!icpLedgerActor) return;

			try {
				setLoadingBalance(true);
				const principal = Principal.fromText(SWAP_CANISTER_PRINCIPAL);
				const balance = await icpLedgerActor.icrc1_balance_of({
					owner: principal,
					subaccount: [],
				});
				// Convert from e8s to ICP (divide by 100,000,000)
				setCanisterIcpBalance(Number(balance) / 100_000_000);
			} catch (error) {
				console.error("Failed to fetch canister ICP balance:", error);
				setCanisterIcpBalance(0);
			} finally {
				setLoadingBalance(false);
			}
		};

		fetchCanisterBalance();
	}, [icpLedgerActor]);

	const canSwap = usdBalance > 0 && canisterIcpBalance > 0 && !swapping && !loadingBalance;

	const handleSwap = useCallback(async () => {
		if (!stripeActor || !canSwap) return;

		try {
			await dispatch(swap(stripeActor)).unwrap();

			// Close dialog on successful swap
			setIsOpen(false);

			dispatch(fetchIcpAmount());
			dispatch(fetchUsdAmount(stripeActor));
		} catch (error) {
			// Error handled by slice
		}
	}, [stripeActor, canSwap, dispatch]);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			// Clear any previous errors when opening
			dispatch(clearSwapError());
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<ArrowRightLeft
							size="18"
							className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
						/>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>Swap USD to ICP</p>
				</TooltipContent>
			</Tooltip>

			<DialogContent
				className="w-auto max-w-md flex flex-col gap-6 font-roboto-condensed p-6"
				closeIcon={null}
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<div className="text-center">
					<DialogTitle className="text-lg font-semibold">
						Swap USD to ICP
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Convert your USD balance to ICP using canister reserves
					</DialogDescription>
				</div>

				{/* Error Alert */}
				{swapError && (
					<div className="relative">
						<Alert variant="danger" title="Swap Error">
							{swapError}
						</Alert>
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

				<div>
					{/* Warnings and Information */}
					{usdBalance <= 0 && (
						<Alert variant="danger" title="Insufficient USD Balance">
							You need a positive USD balance to perform a swap.
						</Alert>
					)}

					{canisterIcpBalance <= 0 && !loadingBalance && (
						<Alert variant="danger" title="No ICP Available">
							The swap canister currently has no ICP available for swapping.
						</Alert>
					)}

					{usdBalance > 0 && canisterIcpBalance > 0 && (
						<div className="text-center text-sm text-muted-foreground">
							This will convert your entire USD balance to ICP at current market rate
						</div>
					)}
				</div>

				{/* Balance Information */}
				<div className="space-y-4">
					<div className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-4 rounded-lg">
						<div className="flex justify-between items-center text-sm mb-2">
							<span className="text-muted-foreground">
								Your USD Balance:
							</span>
							<span className={`font-medium ${usdBalance < 0 ? 'text-destructive' : ''}`}>
								${Math.max(0, usdBalance).toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between items-center text-sm">
							<span className="text-muted-foreground">
								Available ICP:
							</span>
							<div className="flex items-center gap-2">
								{loadingBalance ? (
									<LoaderCircle
										size={14}
										className="animate-spin"
									/>
								) : (
									<span className="font-medium">
										{canisterIcpBalance.toFixed(4)} ICP
									</span>
								)}
								<img
									className="w-4 h-4"
									src="images/icp-logo.png"
									alt="ICP"
								/>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="justify-between sm:justify-between items-center gap-2">
					<Button
						onClick={handleSwap}
						disabled={!canSwap || loadingBalance}
						variant="info"
						className="flex-1"
					>
						{swapping ? (
							<>
								<LoaderCircle
									size={18}
									className="animate-spin"
								/>
								<span>Swapping...</span>
							</>
						) : (
							<>
								<ArrowRightLeft size={18} />
								<span>Swap to ICP</span>
							</>
						)}
					</Button>

					<DialogClose asChild>
						<Button
							type="button"
							variant="inverted"
							className="px-4 py-2"
						>
							Cancel
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default Swap;
