import React from "react";

import { Button } from "@/lib/components/button";

import { LogIn, LoaderCircle } from "lucide-react";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function ConnectWallet() {
	const { setVisible } = useWalletModal();
	const { connecting } = useWallet();

	const handleClick = () => {
		if (connecting) return;
		setVisible(true);
	};

	return (
		<Button
			variant="link"
			disabled={connecting}
			className="w-full justify-between"
			onClick={handleClick}
		>
			<>
				{
					connecting ?
						<LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> :
						<img alt="Solana" className="inline-block w-3 h-3" src="/images/solana.svg" />
				}
			</>
			{connecting ? "Connecting" : "Connect Solana wallet"}
			<LogIn size={20}/>
		</Button>
	);
}
