import type { TokenType } from './common';

export interface AlexandrianUser {
	principal: string;
	username: string;
	hasNfts: boolean;
	hasSbts: boolean;
}

export interface AlexandrianToken {
	id: string;
	arweaveId: string;
	owner: string;
	collection: TokenType;
	canister?: string;
	createdAt?: number;
}