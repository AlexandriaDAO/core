import "@solana/wallet-adapter-react-ui/styles.css";

import {
	ConnectionProvider,
	WalletProvider,
} from "@solana/wallet-adapter-react";
import React, { useMemo } from "react";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

import { SiwsIdentityProvider } from "ic-use-siws-identity";

import { canisterId, idlFactory } from "../../../../declarations/ic_siws_provider";
import { _SERVICE } from "../../../../declarations/ic_siws_provider/ic_siws_provider.did";


export default function SolProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const network = WalletAdapterNetwork.Devnet;
	const endpoint = useMemo(() => clusterApiUrl(network), [network]);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider autoConnect wallets={[]}>
				<WalletModalProvider>
					<SiwsIdentityProvider<_SERVICE>
						canisterId={canisterId}
						idlFactory={idlFactory}
					>
						{children}
					</SiwsIdentityProvider>
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
}
