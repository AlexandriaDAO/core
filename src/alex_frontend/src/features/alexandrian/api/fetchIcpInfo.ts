import { createTokenAdapter } from "../adapters/TokenAdapter";
import type { IcpInfo } from "../adapters/TokenAdapter";
import { TokenType } from "../types";

export const fetchIcpInfo = async (tokenId: string, collectionType: TokenType): Promise<IcpInfo> => {
	const adapter = createTokenAdapter(collectionType);
	return await adapter.tokenToIcpInfo(BigInt(tokenId));
};