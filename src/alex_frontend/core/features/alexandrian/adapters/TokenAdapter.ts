import { Principal } from "@dfinity/principal";
import { icrc7 } from "../../../../../declarations/icrc7";
import { icrc7_scion } from "../../../../../declarations/icrc7_scion";
import { nft_manager } from "../../../../../declarations/nft_manager";
import { ALEX } from "../../../../../declarations/ALEX";
import { LBRY } from "../../../../../declarations/LBRY";
import { feed } from "../../../../../declarations/feed";
import { IcpInfo, TokenType } from "../types";

// Constants
const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

// Utility Functions
const convertE8sToToken = (e8sAmount: bigint): number => {
	return Number(e8sAmount) / 1e8;
};


export interface TokenAdapter {
	getTokenType(): TokenType;
	getTotalSupply(): Promise<bigint>;
	getBalanceOf(
		owner: Principal,
		subaccount?: Uint8Array | number[]
	): Promise<bigint>;
	getTokens(start?: bigint, take?: bigint): Promise<bigint[]>;
	getTokensOf(
		owner: Principal,
		cursor?: bigint,
		take?: bigint
	): Promise<bigint[]>;
	getOwnerOf(
		tokenIds: bigint[]
	): Promise<
		Array<
			| []
			| [{ owner: Principal; subaccount: [] | [Uint8Array | number[]] }]
		>
	>;
	getTokenMetadata(
		tokenIds: bigint[]
	): Promise<Array<[] | [Array<[string, any]>]>>;
	getCollectionMetadata(): Promise<Array<[string, any]>>;
	tokenToIcpInfo(tokenId: bigint): Promise<IcpInfo>;
}

class NFTAdapter implements TokenAdapter {
	getTokenType(): TokenType {
		return "NFT";
	}

	async getTotalSupply(): Promise<bigint> {
		return await icrc7.icrc7_total_supply();
	}

	async getBalanceOf(
		owner: Principal,
		subaccount?: Uint8Array | number[]
	): Promise<bigint> {
		const params: any = [
			{
				owner,
				subaccount: subaccount ? [subaccount] : [],
			},
		];
		const balance = await icrc7.icrc7_balance_of(params);
		return balance[0];
	}

	async getTokens(start?: bigint, take?: bigint): Promise<bigint[]> {
		const startParam: [] | [bigint] = start !== undefined ? [start] : [];
		const takeParam: [] | [bigint] = take !== undefined ? [take] : [];
		return await icrc7.icrc7_tokens(startParam, takeParam);
	}

	async getTokensOf(
		owner: Principal,
		cursor?: bigint,
		take?: bigint
	): Promise<bigint[]> {
		const params: any = { owner, subaccount: [] };
		const cursorParam: [] | [bigint] = cursor !== undefined ? [cursor] : [];
		const takeParam: [] | [bigint] = take !== undefined ? [take] : [];
		return await icrc7.icrc7_tokens_of(params, cursorParam, takeParam);
	}

	async getOwnerOf(
		tokenIds: bigint[]
	): Promise<
		Array<
			| []
			| [{ owner: Principal; subaccount: [] | [Uint8Array | number[]] }]
		>
	> {
		return await icrc7.icrc7_owner_of(tokenIds);
	}

	async getTokenMetadata(
		tokenIds: bigint[]
	): Promise<Array<[] | [Array<[string, any]>]>> {
		return await icrc7.icrc7_token_metadata(tokenIds);
	}

	async getCollectionMetadata(): Promise<Array<[string, any]>> {
		return await icrc7.icrc7_collection_metadata();
	}

	// async tokenToNFTData(
	// 	tokenId: bigint,
	// 	ownerPrincipal: string
	// ): Promise<TokenData> {
	// 	try {

	// 		return {
	// 			id: tokenId.toString(),
	// 			arweaveId: natToArweaveId(tokenId),
	// 			principal: ownerPrincipal,
	// 			collection: "NFT",
	// 			canister: process.env.CANISTER_ID_ICRC7,
	// 		};
	// 	} catch (error) {
	// 		console.warn(`Error fetching metadata for NFT ${tokenId}:`, error);
	// 		// Return basic data if metadata fetching fails
	// 		return {
	// 			id: tokenId.toString(),
	// 			arweaveId: natToArweaveId(tokenId),
	// 			principal: ownerPrincipal,
	// 			collection: "NFT",
	// 			canister: process.env.CANISTER_ID_ICRC7,
	// 		};
	// 	}
	// }

	async tokenToIcpInfo(tokenId: bigint): Promise<IcpInfo> {
		try {
			// Get NFT subaccount for balance fetching
			const subaccount = await nft_manager.to_nft_subaccount(tokenId);
			const balanceParams = {
				owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
				subaccount: [Array.from(subaccount)] as [] | [number[]],
			};

			// Fetch all data concurrently
			const [alexBalance, lbryBalance, rarityResult] = await Promise.allSettled([
				ALEX.icrc1_balance_of(balanceParams),
				LBRY.icrc1_balance_of(balanceParams),
				feed.get_rarity_percentages_for_og_nfts([tokenId]),
			]);

			// Process results
			const alexBalanceValue = alexBalance.status === "fulfilled" ? convertE8sToToken(alexBalance.value) : 0;

			const lbryBalanceValue = lbryBalance.status === "fulfilled" ? convertE8sToToken(lbryBalance.value) : 0;

			let rank: number | undefined = undefined;
			if (rarityResult.status === "fulfilled" && rarityResult.value.length > 0) {
				const rarityData = rarityResult.value[0];
				if (rarityData && rarityData.length > 0) {
					rank = Number(rarityData[1]) || undefined;
				}
			}
			return { alex: alexBalanceValue, lbry: lbryBalanceValue, rank };
		} catch (error) {
			console.warn(`Error fetching ICP info for NFT ${tokenId}:`, error);
			return { alex: 0, lbry: 0 };
		}
	}
}

class SBTAdapter implements TokenAdapter {
	getTokenType(): TokenType {
		return "SBT";
	}

	async getTotalSupply(): Promise<bigint> {
		return await icrc7_scion.icrc7_total_supply();
	}

	async getBalanceOf(
		owner: Principal,
		subaccount?: Uint8Array | number[]
	): Promise<bigint> {
		const params: any = [
			{
				owner,
				subaccount: subaccount ? [subaccount] : [],
			},
		];
		const balance = await icrc7_scion.icrc7_balance_of(params);
		return balance[0];
	}

	async getTokens(start?: bigint, take?: bigint): Promise<bigint[]> {
		const startParam: [] | [bigint] = start !== undefined ? [start] : [];
		const takeParam: [] | [bigint] = take !== undefined ? [take] : [];
		return await icrc7_scion.icrc7_tokens(startParam, takeParam);
	}

	async getTokensOf(
		owner: Principal,
		cursor?: bigint,
		take?: bigint
	): Promise<bigint[]> {
		const params: any = { owner, subaccount: [] };
		const cursorParam: [] | [bigint] = cursor !== undefined ? [cursor] : [];
		const takeParam: [] | [bigint] = take !== undefined ? [take] : [];
		return await icrc7_scion.icrc7_tokens_of(
			params,
			cursorParam,
			takeParam
		);
	}

	async getOwnerOf(
		tokenIds: bigint[]
	): Promise<
		Array<
			| []
			| [{ owner: Principal; subaccount: [] | [Uint8Array | number[]] }]
		>
	> {
		return await icrc7_scion.icrc7_owner_of(tokenIds);
	}

	async getTokenMetadata(
		tokenIds: bigint[]
	): Promise<Array<[] | [Array<[string, any]>]>> {
		return await icrc7_scion.icrc7_token_metadata(tokenIds);
	}

	async getCollectionMetadata(): Promise<Array<[string, any]>> {
		return await icrc7_scion.icrc7_collection_metadata();
	}

	// async tokenToNFTData(
	// 	tokenId: bigint,
	// 	ownerPrincipal: string
	// ): Promise<TokenData> {
	// 	try {
	// 		const ogId = await nft_manager.scion_to_og_id(tokenId);
	// 		return {
	// 			id: tokenId.toString(),
	// 			arweaveId: natToArweaveId(ogId),
	// 			principal: ownerPrincipal,
	// 			collection: "SBT",
	// 			canister: process.env.CANISTER_ID_ICRC7_SCION,
	// 		};
	// 	} catch (error) {
	// 		console.warn(`Error fetching OG ID for SBT ${tokenId}:`, error);
	// 		return {
	// 			id: tokenId.toString(),
	// 			arweaveId: tokenId.toString(),
	// 			principal: ownerPrincipal,
	// 			collection: "SBT",
	// 			canister: process.env.CANISTER_ID_ICRC7_SCION,
	// 		};
	// 	}
	// }

	async tokenToIcpInfo(tokenId: bigint): Promise<IcpInfo> {
		try {
			// Get subaccount for balance fetching
			const subaccount = await nft_manager.to_nft_subaccount(tokenId);
			const balanceParams = {
				owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
				subaccount: [Array.from(subaccount)] as [] | [number[]],
			};

			// Fetch balances (SBTs don't have rarity/rank)
			const [alexBalance, lbryBalance] = await Promise.allSettled([
				ALEX.icrc1_balance_of(balanceParams),
				LBRY.icrc1_balance_of(balanceParams),
			]);

			// Process results
			const alex = alexBalance.status === "fulfilled" ? convertE8sToToken(alexBalance.value) : 0;

			const lbry = lbryBalance.status === "fulfilled" ? convertE8sToToken(lbryBalance.value) : 0;

			return { alex, lbry };
		} catch (error) {
			return { alex: 0, lbry: 0 };
		}
	}
}

export function createTokenAdapter(collection: TokenType): TokenAdapter {
	switch (collection) {
		case "NFT":
			return new NFTAdapter();
		case "SBT":
			return new SBTAdapter();
		default:
			throw new Error(`Unsupported collection type: ${collection}`);
	}
}
