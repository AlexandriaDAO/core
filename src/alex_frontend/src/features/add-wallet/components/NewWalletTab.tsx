import React from "react";
import { Button } from "@/lib/components/button";
import { Alert } from "@/components/Alert";
import { Shield, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import generateNewWallet from "../thunks/generateNewWallet";
import { useAppSelector } from "@/store/hooks/useAppSelector";

export function NewWalletTab() {
	const dispatch = useAppDispatch();
	const { generating } = useAppSelector((state) => state.addWallet);

	const handleGenerateWallet = async () => {
		try {
			await dispatch(generateNewWallet()).unwrap();
		} catch (error) {
			console.error("Error generating new wallet:", error);
		}
	};

	return (
		<div className="space-y-6 py-4">
			<Alert variant="default" title="Security Notice" icon={Shield}>
				Generate a new Arweave wallet. Make sure to safely store
				your key file and backup phrase in a secure location. You
				won't be able to recover your funds if you lose these.
			</Alert>

			<Button
				variant="primary"
				onClick={handleGenerateWallet}
				disabled={generating}
				className="w-full"
			>
				{generating ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						Generating...
					</>
				) : (
					"Generate New Wallet"
				)}
			</Button>
		</div>
	);
}
