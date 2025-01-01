import React from "react";

import { Connector, useAccount, useConnect } from "wagmi";

import { Button } from "@/lib/components/button";
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from "@/lib/components/dialog";

import { DialogTitle } from "@radix-ui/react-dialog";
import { LogIn, LoaderCircle } from "lucide-react";

export default function ConnectWallet() {
	const { connect, connectors, error, isPending, variables, reset } = useConnect();
	const { isConnecting, isConnected } = useAccount();

	const icon = (connector: Connector) => {
		if (
			isPending &&
			variables &&
			"id" in variables.connector &&
			connector.id === variables.connector.id
		) {
			return <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> ;
		}
		return undefined;
	};

	const iconSource = (connector: Connector) => {
		// WalletConnect does not provide an icon, so we provide a custom one.
		if (connector.id === "walletConnect") {
			return "/images/walletconnect.svg";
		}
		return connector.icon;
	};

	return (
		<Dialog onOpenChange={(open) => (open ? reset() : "")}>
			<DialogTrigger asChild>
				{/* <div className="flex-shrink h-auto flex justify-between gap-1 px-4 py-2 items-center border border-white text-[#828282] hover:text-white rounded-full cursor-pointer transition-all duration-300">
					<span className="text-base font-normal font-roboto-condensed tracking-wider">
						{isConnecting ? "Connecting" : "Connect wallet"}
					</span>
				</div> */}
				<Button
					variant="link"
					disabled={isConnecting}
					className="w-full justify-between"
				>
					<>
						{ isConnecting ?
							<LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> :
							<img alt="Ethereum" className="inline-block w-3 h-3" src="/images/ethereum.svg" />
						}
						{isConnecting ? "Connecting" : "Connect Ethereum wallet"}
					</>
					<LogIn size={20}/>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] font-roboto-condensed">
				<DialogTitle>Connect Wallet</DialogTitle>
				<DialogDescription> Please select a wallet to connect to the application.</DialogDescription>

				{connectors.map((connector) => (
					<Button
						className="justify-between w-52"
						disabled={isConnected || isPending}
						// icon={icon(connector)}
						key={connector.id}
						onClick={() => connect({ connector })}
						// spin
						variant="outline"
					>
						{icon(connector) || <img className="w-4 h-4" src={iconSource(connector)} />}
						{connector.name}
					</Button>
				))}
				{error && (
					<div className="p-2 text-center text-white bg-red-500">
						{error.message}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
