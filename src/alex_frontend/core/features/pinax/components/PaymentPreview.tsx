import React, { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import { useAlexWallet, useNftManager } from "@/hooks/actors";
import processPayment from "../thunks/processPayment";
import TopupBalanceWarning from "@/components/TopupBalanceWarning";
import {
	AlertCircle,
	Loader2,
	CreditCard,
	CheckCircle,
	TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Alert } from "@/components/Alert";
import checkEligibility from "../thunks/checkEligibility";

interface PaymentPreviewProps {
	file: File;
}

function PaymentPreview({ file }: PaymentPreviewProps) {
	const dispatch = useAppDispatch();
	const { actor: nftManagerActor } = useNftManager();
	const { actor: alexWalletActor } = useAlexWallet();

	// Get the spending balance from the swap state
	const { locked, lockedLoading } = useAppSelector(
		(state) => state.balance.lbry
	);
	const {
		lbryFee,
		paymentStatus,
		paymentError,
		eligible,
		eligibilityError,
		checkingEligibility,
	} = useAppSelector((state) => state.pinax);

	useEffect(() => {
		if (checkingEligibility || eligible || eligibilityError) return;

		if (alexWalletActor && lbryFee && lbryFee > 0) {
			dispatch(checkEligibility(alexWalletActor));
		}
	}, [alexWalletActor, lbryFee]);

	if (checkingEligibility) {
		return (
			<div className="flex justify-start items-center gap-2 w-full">
				<Loader2 size={16} className="animate-spin" />
				<span className="text-sm text-muted-foreground">
					Checking eligibility...
				</span>
			</div>
		);
	}

	if (!eligible) {
		return (
			<Alert
				variant="danger"
				title="Wallet Error"
				icon={TriangleAlert}
				className="w-full text-left"
			>
				{eligibilityError || "Payment can't be processed at this time"}
			</Alert>
		);
	}

	// Calculate file size in MB
	const fileSizeMB = Math.ceil(file.size / (1024 * 1024));

	// Check if user has sufficient balance
	const hasInsufficientBalance = locked < (lbryFee || 0);

	const handlePayment = async () => {
		if (!nftManagerActor) {
			toast.error("NFT Manager actor not available");
			return;
		}

		// Check balance before proceeding
		if (hasInsufficientBalance) {
			toast.error(
				`Insufficient LBRY balance. Please top up your wallet.`
			);
			return;
		}

		try {
			await dispatch(
				processPayment({
					fileSizeBytes: file.size,
					actor: nftManagerActor,
				})
			).unwrap();
		} catch (error) {
			// Error is already handled in the thunk
			console.error("Payment process failed:", error);
		}
	};

	if (lbryFee === null) {
		return null;
	}

	return (
		<div className="w-full space-y-4">
			{/* Include the TopupBalanceWarning component */}
			<TopupBalanceWarning />

			<div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
				<h3 className="text-lg font-medium mb-2">Upload Fee</h3>

				<div className="space-y-2 mb-4">
					<div className="flex justify-between">
						<span>File Size:</span>
						<span>{fileSizeMB} MB</span>
					</div>
					<div className="flex justify-between font-medium">
						<span>Required LBRY Tokens:</span>
						<span>{lbryFee} LBRY</span>
					</div>

					{!lockedLoading && (
						<div className="flex justify-between">
							<span>Your Balance:</span>
							<span
								className={
									hasInsufficientBalance
										? "text-red-500"
										: "text-green-500"
								}
							>
								{locked} LBRY
							</span>
						</div>
					)}
				</div>

				{paymentError && (
					<div className="flex items-center gap-2 text-red-500 mb-4 p-2 bg-red-50 dark:bg-red-900/20 rounded">
						<AlertCircle size={16} />
						<span>{paymentError}</span>
					</div>
				)}

				<div className="flex justify-center">
					{lockedLoading ? (
						<Button disabled className="w-full">
							<Loader2 size={16} className="mr-2 animate-spin" />
							Checking Balance...
						</Button>
					) : paymentStatus === "idle" ? (
						<Button
							onClick={handlePayment}
							disabled={
								!nftManagerActor || hasInsufficientBalance
							}
							className="w-full"
							variant="inverted"
						>
							<CreditCard size={16} className="mr-2" />
							Pay {lbryFee} LBRY Tokens
						</Button>
					) : paymentStatus === "pending" ? (
						<Button disabled className="w-full">
							<Loader2 size={16} className="mr-2 animate-spin" />
							Processing Payment...
						</Button>
					) : paymentStatus === "success" ? (
						<div className="flex items-center gap-2 text-green-500 p-2 bg-green-50 dark:bg-green-900/20 rounded w-full justify-center">
							<CheckCircle size={16} />
							<span>Payment Successful - Ready to Upload</span>
						</div>
					) : (
						<Button
							onClick={handlePayment}
							className="w-full"
							variant="destructive"
						>
							<AlertCircle size={16} className="mr-2" />
							Payment Failed - Retry
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

export default PaymentPreview;
