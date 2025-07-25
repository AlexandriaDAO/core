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
		byOwner?: {
			edges: GraphQLEdge[];
			pageInfo: GraphQLPageInfo;
		};
		byId?: Transaction;
		transactions?: {
			edges: GraphQLEdge[];
			pageInfo: GraphQLPageInfo;
		};
	};
	errors?: Array<{ message: string }>;
}
