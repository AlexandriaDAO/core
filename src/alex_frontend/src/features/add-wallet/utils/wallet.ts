import { ArweaveAddress } from '../types';

export interface Wallet {
	getPublicKey(): Promise<string>;
	getAddress(): Promise<ArweaveAddress>;
	sign(data: Uint8Array): Promise<Uint8Array>;
}
