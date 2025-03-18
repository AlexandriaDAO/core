import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import importSeedPhrase from "../thunks/importSeedPhrase";

import { Button } from "@/lib/components/button";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Alert } from "@/components/Alert";
import { KeyRound, Shield, Loader2, TriangleAlert } from "lucide-react";

export function SeedPhraseTab() {
	const dispatch = useAppDispatch();
	const { importing } = useAppSelector((state) => state.addWallet);
	const [seedPhrase, setSeedPhrase] = useState("");

	const handleSubmit = async () => {
		if (!seedPhrase) return;
		try {
			await dispatch(importSeedPhrase(seedPhrase)).unwrap();
		} catch (error) {
			console.error("Error importing wallet:", error);
		}
	};

	return (
		<div className="space-y-6 py-4">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label
						htmlFor="seedphrase"
						className="text-base font-medium text-gray-900 dark:text-gray-100"
					>
						Enter your seed phrase
					</Label>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Enter your 12 words separated by spaces
					</p>
				</div>

				<div className="space-y-3">
					<Textarea
						id="seedphrase"
						value={seedPhrase}
						onChange={(e) => setSeedPhrase(e.target.value)}
						placeholder="Enter your 12-word seed phrase here"
						disabled={importing}
						rows={3}
						className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 resize-none px-4 py-2 font-mono !text-xl min-h-[60px]"
					/>

					<div className="space-y-3">
						<Alert
							variant="default"
							title="Example seed phrase:"
							icon={KeyRound}
						>
							<div className="flex flex-col gap-2">
								<span>
									witch collapse practice feed shame open despair creek road again ice least
								</span>
								<div className="flex justify-start items-center gap-2 text-destructive">
									<TriangleAlert className="w-4 h-4" />
									<span >Do not use this example seed phrase.</span>
								</div>
							</div>
						</Alert>
{/* 
						<Alert
							variant="warning"
							title="Security Warning"
							icon={Shield}
						>
							Do not use this example seed phrase. It is publicly
							known and any funds sent to its associated wallet
							will be lost.
						</Alert> */}
					</div>
				</div>
			</div>

			<Button
				variant="primary"
				onClick={handleSubmit}
				disabled={!seedPhrase || importing}
				className="w-full"
			>
				{importing ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						Importing...
					</>
				) : (
					"Import Wallet"
				)}
			</Button>
			{importing && (
				<Alert
					variant="info"
					title="Please Wait..."
				>
					<div className="flex flex-col space-y-1">
						<span className="font-medium">Your wallet is being imported securely...</span>
						<span>This process typically takes 1-2 minutes to complete as we're importing and encrypting your wallet seed phrase.</span>
					</div>
				</Alert>
			)}
		</div>
	);
}
