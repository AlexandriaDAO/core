export type TransactionStatusType = null | string | TransactionStatus;

export type TransactionStatus = {
	block_height: number;
	block_indep_hash: string;
	number_of_confirmations: number;
}

export type Tag = {
	name: string;
	value: string;
}

export type Tags = Tag[];