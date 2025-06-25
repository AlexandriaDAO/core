import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Alert } from "@/components/Alert";
import { clearRedeemError } from "../../../features/balance/icp/icpSlice";
import { X } from "lucide-react";
import { Button } from "@/lib/components/button";

const RedeemError: React.FC = () => {
	const dispatch = useAppDispatch();
	const { redeemError } = useAppSelector((state) => state.balance.icp);

	if (!redeemError) return <></>;

	return (
		<div className="relative mb-6">
			<Alert variant="danger" title="Error">
				{redeemError}
			</Alert>
			<Button
				variant="muted"
				scale="icon"
				rounded="full"
				onClick={() => dispatch(clearRedeemError())}
				className="absolute top-2 right-2"
			>
				<X size={16} />
			</Button>
		</div>
	);
};

export default RedeemError;