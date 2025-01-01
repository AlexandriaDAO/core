import React from "react";
import LoginButton from "./LoginButton";
import ConnectWallet from "./ConnectWallet";
import { useWallet } from "@solana/wallet-adapter-react";

const SOLProcessor = () => {
	const { publicKey, connected } = useWallet();

	return (
		<div className="flex flex-col items-stretch w-full gap-2 border border-ring p-2 opacity-50 relative">
			<div className="absolute inset-0 bg-background/50 flex items-center justify-center">
				<span className="text-sm font-medium bg-background/90 px-3 py-1 rounded-full">Coming Soon</span>
			</div>
			<span className="text-base font-normal font-roboto-condensed tracking-wider">Sign in with Solana wallet</span>
			<div className="flex items-center justify-start w-full gap-5">
				<div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-zinc-300 text-zinc-800">
					1
				</div>
				<div className="flex-1">
					{publicKey && connected ? (
						<span>{publicKey.toBase58().slice(0, 6) + "..." + publicKey.toBase58().slice(-6)}</span>
					) : (
						<ConnectWallet />
					)}
				</div>
			</div>
			<div className="flex items-center justify-center w-full gap-5">
				<div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-zinc-300 text-zinc-800">
					2
				</div>
				<div className="flex-1">
					<LoginButton />
				</div>
			</div>
		</div>
	);
};

export default SOLProcessor;
