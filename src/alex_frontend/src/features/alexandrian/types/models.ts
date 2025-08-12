import type { TokenType } from './common';

export interface AlexandrianToken {
	id: string;
	arweaveId: string;
	owner: string;
	collection: TokenType;
	createdAt?: number;
}