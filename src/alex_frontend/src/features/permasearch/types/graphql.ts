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
