import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import { AlexandrianUser } from "../types";

import { alex_backend } from "../../../../../declarations/alex_backend";

interface NFTUserInfo {
	principal: any;
	username: string;
	has_nfts: boolean;
	has_scion_nfts: boolean;
	last_updated: bigint;
}

// const network = process.env.DFX_NETWORK === "ic" ? "mainnet" : "devnet";

// const TEST_PRINCIPALS: NFTUserInfo[] = [
// 	{
// 		principal:
// 			"2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe",
// 		username: "chadthechad",
// 		has_nfts: true,
// 		has_scion_nfts: true,
// 		last_updated: BigInt(0),
// 	},
// 	{
// 		principal:
// 			"n3br6-rkkdh-5jcq7-pbwsx-yeqm7-jbzqi-54j4d-3isk3-js4sp-vqct5-rae",
// 		username: "asdf",
// 		has_nfts: true,
// 		has_scion_nfts: true,
// 		last_updated: BigInt(0),
// 	},
// 	{
// 		principal:
// 			"yshkh-urigw-n2o44-nh27v-63lw4-tsura-tgmsp-suuel-wjkaw-z7vmo-hae",
// 		username: "Retardio",
// 		has_nfts: true,
// 		has_scion_nfts: true,
// 		last_updated: BigInt(0),
// 	},
// 	{
// 		principal:
// 			"jfu7o-xjjug-zk7c5-yipen-o62uu-vbwua-2zvsd-73otf-2lisp-jco6v-xqe",
// 		username: "evanmcfarland",
// 		has_nfts: true,
// 		has_scion_nfts: true,
// 		last_updated: BigInt(0),
// 	},
// 	{
// 		principal:
// 			"d3sjl-odpvw-6gc5j-hu7ga-ftzk4-vfa5a-hg3ee-u6t2b-kvams-7liqb-7qe",
// 		username: "adillOS",
// 		has_nfts: true,
// 		has_scion_nfts: true,
// 		last_updated: BigInt(0),
// 	},
// ];

const fetchUsers = createAsyncThunk<
	AlexandrianUser[],
	void,
	{ rejectValue: string; state: RootState }
>("alexandrian/fetchUsers", async (_, { rejectWithValue }) => {
	try {
		if (!alex_backend) {
			throw new Error("Actor not available");
		}

		let nftUsers: NFTUserInfo[];

		// if (network === "devnet") {
		//   nftUsers = TEST_PRINCIPALS;
		// } else {
		nftUsers = await alex_backend.get_stored_nft_users();
		// }

		const processedUsers: AlexandrianUser[] = nftUsers.map(
			(user: NFTUserInfo) => ({
				principal: user.principal.toString(),
				username: user.username,
				hasNfts: user.has_nfts,
				hasSbts: user.has_scion_nfts,
			})
		);

		return processedUsers;
	} catch (error) {
		console.error("Error fetching users:", error);
		return rejectWithValue(
			error instanceof Error ? error.message : "Failed to fetch users"
		);
	}
});

export default fetchUsers;
