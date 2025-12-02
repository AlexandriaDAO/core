import React, { useEffect } from "react";
import { Button } from "@/lib/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/lib/components/dialog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/lib/components/tabs";
import { Plus, Key, KeyRound } from "lucide-react";
import { KeyFileTab } from "./components/KeyFileTab";
import { SeedPhraseTab } from "./components/SeedPhraseTab";
import { NewWalletTab } from "./components/NewWalletTab";
import { SuccessMessage } from "./components/SuccessMessage";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { reset } from "./addWalletSlice";
import storeWallet from "./thunks/storeWallet";
import { useAlexWallet } from "@/hooks/actors";

export function AddArweaveWallet() {
	const {actor} = useAlexWallet();
	const dispatch = useAppDispatch();
	const { wallet } = useAppSelector((state) => state.addWallet);
	useEffect(() => {
		return () => {
			dispatch(reset());
		};
	}, []);

	useEffect(() => {
		if (actor) {
			dispatch(storeWallet(actor));
		}
	}, [wallet]);

	return (
		<Dialog onOpenChange={(isOpen) => { if (!isOpen) dispatch(reset()); }}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					scale="default"
					className="flex items-center gap-2 border border-ring"
				>
					<Plus className="h-4 w-4" />
					Add Arweave Wallet
				</Button>
			</DialogTrigger>

			<DialogContent className={`${wallet?.new ? 'sm:max-w-[900px]':'sm:max-w-[600px]'} bg-white dark:bg-gray-900 border dark:border-gray-800`}>
				{wallet ? (
					<>
						<DialogHeader>
							<DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
								Wallet Added
							</DialogTitle>
							<DialogDescription className="text-base text-gray-500 dark:text-gray-400">
								Your wallet has been added successfully
							</DialogDescription>
						</DialogHeader>
						<SuccessMessage />
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
								Add Arweave Wallet
							</DialogTitle>
							<DialogDescription className="text-base text-gray-500 dark:text-gray-400">
								Import an existing wallet or create a new one to
								start using Arweave
							</DialogDescription>
						</DialogHeader>
						<Tabs defaultValue="keyfile" className="w-full">
							<TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 dark:bg-gray-800">
								<TabsTrigger
									value="keyfile"
									className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
								>
									<Key className="h-4 w-4" />
									Key File
								</TabsTrigger>
								<TabsTrigger
									value="seedphrase"
									className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
								>
									<KeyRound className="h-4 w-4" />
									Seed Phrase
								</TabsTrigger>
								<TabsTrigger
									value="new"
									className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
								>
									<Plus className="h-4 w-4" />
									New Wallet
								</TabsTrigger>
							</TabsList>

							<TabsContent value="keyfile"><KeyFileTab /></TabsContent>
							<TabsContent value="seedphrase"><SeedPhraseTab /></TabsContent>
							<TabsContent value="new"><NewWalletTab /></TabsContent>
						</Tabs>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
