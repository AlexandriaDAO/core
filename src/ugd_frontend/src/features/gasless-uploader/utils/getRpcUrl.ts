/**
 * Helper function to return the RPC URL associated with the given currency.
 * All values are pulled from the .env.local file
 *
 * @param currency The name of the currency used.
 * @returns
 */
function getRpcUrl(currency: string): string | undefined {
	const RPC_URLS: Record<string, string | undefined> = {
		arbitrum: process.env.NEXT_PUBLIC_RPC_ARBITRUM,
		avalanche: process.env.NEXT_PUBLIC_RPC_AVALANCHE,
		chainlink: process.env.NEXT_PUBLIC_RPC_ETHEREUM, // For Chainlink, return Ethereum RPC
		ethereum: process.env.NEXT_PUBLIC_RPC_ETHEREUM,
		fantom: process.env.NEXT_PUBLIC_RPC_FANTOM,
		near: process.env.NEXT_PUBLIC_RPC_NEAR,
		matic: process.env.NEXT_PUBLIC_RPC_MATIC,
		solana: process.env.NEXT_PUBLIC_RPC_SOLANA,
	};

	return RPC_URLS[currency];
}

export default getRpcUrl;
