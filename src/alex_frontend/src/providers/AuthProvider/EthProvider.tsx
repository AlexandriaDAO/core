import React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SiweIdentityProvider } from "ic-use-siwe-identity";
import { wagmiConfig } from "./wagmi.config";
import { _SERVICE } from "../../../../declarations/ic_siwe_provider/ic_siwe_provider.did";
import { canisterId, idlFactory } from "../../../../declarations/ic_siwe_provider/index";

interface EthProviderProps {
	children: React.ReactNode;
}

const queryClient = new QueryClient();

const EthProvider: React.FC<EthProviderProps> = ({ children }) => {

	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<SiweIdentityProvider<_SERVICE>
					canisterId={canisterId}
					idlFactory={idlFactory}
				>
					<>{children}</>
				</SiweIdentityProvider>
			</QueryClientProvider>
		</WagmiProvider>
	)
}

export default EthProvider;