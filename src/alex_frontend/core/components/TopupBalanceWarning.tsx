import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Alert } from "./Alert";

interface TopupBalanceWarningProps {
	minimumBalance?: number;
}

const TopupBalanceWarning: React.FC<TopupBalanceWarningProps> = ({
	minimumBalance = 10,
}) => {
	const {
		lbry: { locked },
	} = useAppSelector((state) => state.balance);

	if (locked < 0 || locked > minimumBalance) return null;

	return (
		<Alert
			variant="warning"
			className="w-full"
			title="Insufficient Balance"
			icon={AlertCircle}
		>
			<span>
				You need some LBRY in your topup wallet to access main features.
			</span>
			<div className="flex justify-start items-center gap-1">
				<span>Your current balance is {locked} LBRY.</span>
				<Link
					to="/swap"
					className="font-medium underline hover:text-yellow-600"
				>
					Top up your wallet here
				</Link>
			</div>
		</Alert>
	);
};

export default TopupBalanceWarning;
