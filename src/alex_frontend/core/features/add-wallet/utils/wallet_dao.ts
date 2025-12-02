import Arweave from 'arweave';
// import { CreateTransactionInterface } from 'arweave/node/common';
import { JWKWallet } from './jwk_wallet';
import {
	// TransactionID,
	Winston,
	// NetworkReward,
	SeedPhrase,
	ArweaveAddress,
	W,
	// AR,
	// RewardSettings,
	// GQLTagInterface,
	// TxID
} from '../types';
import { generateKeyPair, getKeyPairFromMnemonic } from 'human-crypto-keys';
import { JWKInterface } from 'arweave/node/lib/wallet';

// export type ARTransferResult = {
// 	txID: TransactionID;
// 	winston: Winston;
// 	reward: NetworkReward;
// };

const algorithm = { id: 'rsa', modulusLength: 4096 } as const;
const options = { privateKeyFormat: 'pkcs8-pem' } as const;

export class WalletDAO {
	constructor(
		private readonly arweave: Arweave,
		private readonly appName = 'Alexandrian',
		private readonly appVersion = '1.0.0'
	) {}

	async generateSeedPhrase(): Promise<SeedPhrase> {
		const keys = await generateKeyPair(algorithm, options);
		return new SeedPhrase(keys.mnemonic);
	}

	async generateJWKWallet(seedPhrase: SeedPhrase): Promise<JWKWallet> {
		const { privateKey } = await getKeyPairFromMnemonic(seedPhrase.toString(), algorithm, options);

		// Convert PEM to JWK using browser's crypto API
        const binaryDer = this.pemToBinary(privateKey);
        const cryptoKey = await crypto.subtle.importKey(
            'pkcs8',
            binaryDer,
            {
                name: 'RSA-PSS',
                hash: 'SHA-256',
            },
            true,
            ['sign']
        );
        const jwk = await crypto.subtle.exportKey('jwk', cryptoKey);

        return Promise.resolve(new JWKWallet(jwk as JWKInterface));
	}

    // Helper method to convert PEM to binary
    private pemToBinary(pem: string): ArrayBuffer {
        const pemContents = pem
            .replace('-----BEGIN PRIVATE KEY-----', '')
            .replace('-----END PRIVATE KEY-----', '')
            .replace(/\s/g, '');
        const binary = window.atob(pemContents);
        const buffer = new ArrayBuffer(binary.length);
        const bufView = new Uint8Array(buffer);
        for (let i = 0; i < binary.length; i++) {
            bufView[i] = binary.charCodeAt(i);
        }
        return buffer;
    }


	async getAddressWinstonBalance(address: ArweaveAddress): Promise<Winston> {
		return Promise.resolve(W(+(await this.arweave.wallets.getBalance(address.toString()))));
	}

	// async sendARToAddress(
	// 	arAmount: AR,
	// 	fromWallet: Wallet,
	// 	toAddress: ArweaveAddress,
	// 	rewardSettings: RewardSettings = {},
	// 	dryRun = false,
	// 	[
	// 		{ value: appName = this.appName },
	// 		{ value: appVersion = this.appVersion },
	// 		{ value: txType = 'transfer' },
	// 		...otherTags
	// 	]: GQLTagInterface[],
	// 	assertBalance = false
	// ): Promise<ARTransferResult> {
	// 	// TODO: Figure out how this works for other wallet types
	// 	const jwkWallet = fromWallet as JWKWallet;
	// 	const winston: Winston = arAmount.toWinston();

	// 	// Create transaction
	// 	const txAttributes: Partial<CreateTransactionInterface> = {
	// 		target: toAddress.toString(),
	// 		quantity: winston.toString()
	// 	};

	// 	// If we provided our own reward settings, use them now
	// 	if (rewardSettings.reward) {
	// 		txAttributes.reward = rewardSettings.reward.toString();
	// 	}

	// 	// TODO: Use a mock arweave server instead
	// 	if (process.env.NODE_ENV === 'test') {
	// 		txAttributes.last_tx = 'STUB';
	// 	}
	// 	const transaction = await this.arweave.createTransaction(txAttributes, jwkWallet.getPrivateKey());
	// 	if (rewardSettings.feeMultiple?.wouldBoostReward()) {
	// 		transaction.reward = rewardSettings.feeMultiple.boostReward(transaction.reward);
	// 	}

	// 	if (assertBalance) {
	// 		const fromAddress = await fromWallet.getAddress();
	// 		const balanceInWinston = await this.getAddressWinstonBalance(fromAddress);
	// 		const total = W(transaction.reward).plus(W(transaction.quantity));
	// 		if (total.isGreaterThan(balanceInWinston)) {
	// 			throw new Error(
	// 				[
	// 					`Insufficient funds for this transaction`,
	// 					`quantity: ${transaction.quantity}`,
	// 					`minerReward: ${transaction.reward}`,
	// 					`balance: ${balanceInWinston}`,
	// 					`total: ${total}`,
	// 					`difference: ${Winston.difference(total, balanceInWinston)}`
	// 				].join('\n\t')
	// 			);
	// 		}
	// 	}

	// 	// Tag file with data upload Tipping metadata
	// 	transaction.addTag('App-Name', appName);
	// 	transaction.addTag('App-Version', appVersion);
	// 	transaction.addTag('Type', txType);
	// 	if (rewardSettings.feeMultiple?.wouldBoostReward()) {
	// 		transaction.addTag('Boost', rewardSettings.feeMultiple.toString());
	// 	}
	// 	otherTags?.forEach((tag) => {
	// 		transaction.addTag(tag.name, tag.value);
	// 	});

	// 	assertTagLimits(transaction.tags);

	// 	// Sign file
	// 	await this.arweave.transactions.sign(transaction, jwkWallet.getPrivateKey());

	// 	// Submit the transaction
	// 	const response = await (async () => {
	// 		if (dryRun) {
	// 			return { status: 200, statusText: 'OK', data: '' };
	// 		} else {
	// 			return this.arweave.transactions.post(transaction);
	// 		}
	// 	})();
	// 	if (response.status === 200 || response.status === 202) {
	// 		return Promise.resolve({
	// 			txID: TxID(transaction.id),
	// 			winston,
	// 			reward: W(transaction.reward)
	// 		});
	// 	} else {
	// 		throw new Error(`Transaction failed. Response: ${response}`);
	// 	}
	// }
}
