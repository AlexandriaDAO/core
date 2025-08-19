import type { IcpInfo, TokenType } from './common';

export interface Token {
	id: string;
	arweaveId: string;
	owner: string;
	collection: TokenType;
	// canister?: string;
}

export type AlexandrianToken = Token & IcpInfo;