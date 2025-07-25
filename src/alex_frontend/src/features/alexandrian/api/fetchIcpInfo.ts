import { createTokenAdapter } from "../adapters/TokenAdapter";
import type { IcpInfo } from "../adapters/TokenAdapter";

export const fetchIcpInfo = async (tokenId: string, collectionType: 'NFT' | 'SBT'): Promise<IcpInfo> => {
	const adapter = createTokenAdapter(collectionType);
	return await adapter.tokenToIcpInfo(BigInt(tokenId));
};