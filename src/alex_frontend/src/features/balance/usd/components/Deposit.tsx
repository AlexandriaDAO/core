import React, { useCallback, useState } from "react";
import { Plus, LoaderCircle, X, ArrowDownToLine } from "lucide-react";
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
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/lib/components/tooltip";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useStripe } from "@/hooks/actors";
import session from "../thunks/session";
import { clearSessionError } from "../usdSlice";
import { Alert } from "@/components/Alert";

const Deposit: React.FC = () => {
	const dispatch = useAppDispatch();
	const { actor: stripeActor } = useStripe();
	const { sessionLoading, sessionError } = useAppSelector(
		(state) => state.balance.usd
	);

	const [isOpen, setIsOpen] = useState(false);
	const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
	const [customAmount, setCustomAmount] = useState("");

	// Predefined amounts in USD
	const predefinedAmounts = [10, 30, 100, 200];

	const finalAmount =
		selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
	const canDeposit = finalAmount > 0 && !sessionLoading;

	const handleAmountSelect = useCallback((amount: number) => {
		setSelectedAmount(amount);
		setCustomAmount(""); // Clear custom amount when predefined is selected
	}, []);

	const handleCustomAmountChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
				setCustomAmount(value);
				setSelectedAmount(null); // Clear predefined selection when custom is entered
			}
		},
		[]
	);

	const handleDeposit = useCallback(async () => {
		if (!stripeActor || !canDeposit) return;

		try {
			// Convert USD to cents for backend
			const amountInCents = Math.round(finalAmount * 100);
			const sessionUrl = await dispatch(
				session({ actor: stripeActor, amount: amountInCents })
			).unwrap();

			// Open Stripe checkout in new window/tab
			if (sessionUrl) {
				window.open(sessionUrl, "_blank");
				setIsOpen(false); // Close dialog after opening Stripe
			}
		} catch (error) {
			// Error handled by slice
		}
	}, [stripeActor, finalAmount, canDeposit, dispatch]);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open) {
			// Clear any previous errors when opening
			dispatch(clearSessionError());
		} else {
			// Reset form when closing
			setSelectedAmount(null);
			setCustomAmount("");
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
					<p>Deposit USD</p>
				</TooltipContent>
			</Tooltip>

			<DialogContent
				className="w-96 flex flex-col gap-6 font-roboto-condensed p-6"
				closeIcon={null}
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<div className="text-center">
					<DialogTitle className="text-lg font-semibold">
						Deposit USD
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground">
						Select an amount to add to your USD balance
					</DialogDescription>
				</div>

				{/* Error Alert */}
				{sessionError && (
					<div className="relative">
						<Alert variant="danger" title="Deposit Error">
							{sessionError}
						</Alert>
						<Button
							variant="muted"
							scale="icon"
							rounded="full"
							onClick={() => dispatch(clearSessionError())}
							className="absolute top-2 right-2"
						>
							<X size={16} />
						</Button>
					</div>
				)}

				{/* Predefined Amount Buttons */}
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-3">
						{predefinedAmounts.map((amount) => (
							<Button
								key={amount}
								type="button"
								variant={
									selectedAmount === amount
										? "info"
										: "outline"
								}
								onClick={() => handleAmountSelect(amount)}
								disabled={sessionLoading}
								className="h-12 text-lg font-medium dark:border-muted-foreground"
							>
								${amount}
							</Button>
						))}
					</div>
				</div>

				{/* Custom Amount Input */}
				<div className="space-y-2">
					<Label htmlFor="custom-amount">Custom Amount (USD)</Label>
					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
							$
						</span>
						<Input
							id="custom-amount"
							type="number"
							min="0"
							step="0.01"
							value={customAmount}
							onChange={handleCustomAmountChange}
							placeholder="0.00"
							disabled={sessionLoading}
							className="pl-8"
						/>
					</div>
				</div>

				<DialogFooter className="justify-between sm:justify-between items-center gap-2">
					<Button
						onClick={handleDeposit}
						disabled={!canDeposit}
						variant="info"
						className="flex-1"
					>
						{sessionLoading ? (
							<>
								<LoaderCircle
									size={18}
									className="animate-spin"
								/>
								<span>Creating Session...</span>
							</>
						) : (
							<>
								<Plus size={18} />
								<span>Deposit ${finalAmount.toFixed(2)}</span>
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

export default Deposit;
