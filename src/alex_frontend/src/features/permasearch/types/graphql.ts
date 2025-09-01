import { BlockFilter, TagFilter } from './filters';
import { Transaction } from './transaction';

// GraphQL response structure types
export interface GraphQLEdge {
	cursor: string;
	node: Transaction;
}

export interface GraphQLPageInfo {
	hasNextPage: boolean;
}

export interface GraphQLQueryResponse {
	data: {
		byOwners?: {
			edges: GraphQLEdge[];
			pageInfo: GraphQLPageInfo;
		};
		byIds?: {
			edges: GraphQLEdge[];
			pageInfo: GraphQLPageInfo;
		};
		transactions?: {
			edges: GraphQLEdge[];
			pageInfo: GraphQLPageInfo;
		};
	};
	errors?: Array<{ message: string }>;
}

export const TransactionFields = `
	edges {
		cursor
		node {
			id
			data { size type }
			tags { name value }
			block { height timestamp }
		}
	}
	pageInfo { hasNextPage }
`;

export interface QueryParams {
	query?: string;
	order: string;
	after?: string;
	tags: TagFilter[];
	range: BlockFilter;
	signal?: AbortSignal;
}

export interface QueryResult {
	transactions: Transaction[];
	cursor: string | null;
	hasNext: boolean;
}
