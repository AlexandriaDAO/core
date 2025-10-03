import type { ActorSubclass, Identity } from "@dfinity/agent";
import type { AuthClientLoginOptions } from "@dfinity/auth-client";
import type { DelegationChain, ECDSAKeyIdentity } from "@dfinity/identity";
import type { Eip1193Provider, JsonRpcSigner } from "ethers";
import type {
	_SERVICE,
	LoginRequest,
	SIWALoginRequest,
	SIWAMessageRequest,
	SIWSLoginRequest,
	SignedDelegation,
} from "../../../../declarations/authentication/authentication.did";

export interface LoginOptions
	extends Omit<
		AuthClientLoginOptions,
		"onSuccess" | "onError" | "maxTimeToLive"
	> {
	/**
	 * Expiration of the authentication in nanoseconds
	 * @default  BigInt(3_600_000_000_000) nanoseconds (1 hour)
	 */
	maxTimeToLive?: bigint;
}

export type Status =
	| "initializing"
	| "idle"
	| "connecting"
	| "preparing"
	| "signing"
	| "authenticating"
	| "delegating"
	| "success"
	| "error";

export type IdentityContext = {
	/** The identity is available after successfully loading the identity from local storage
	 * or completing the login process. */
	identity?: Identity;

	/** Clears the identity from the state and local storage. Effectively "logs the user out". */
	clear: () => Promise<void>;

	/** The status of the login process. Note: The login status is not affected when a stored
	 * identity is loaded on mount. */
	status: Status;

	/** Login error. Unsurprisingly. */
	error?: Error;
};

export type InternetIdentityContext = {
	/** Connect to Internet Identity to login the user. */
	login: (loginOptions?: LoginOptions) => void;
};

export type ETHContext = {
	/** Connect to Ethereum wallet and return address and signer. */
	connectWallet: (
		ethereum: Eip1193Provider,
	) => Promise<{ address: string; signer: JsonRpcSigner }>;

	/** Prepare SIWE message for signing. */
	prepareMessage: (
		address: string,
		actor: ActorSubclass<_SERVICE>,
	) => Promise<{ message: string; message_id: string }>;

	/** Sign message with Ethereum wallet. */
	signMessage: (signer: JsonRpcSigner, message: string) => Promise<string>;

	/** Authenticate with signed message and get session details. */
	authenticate: (
		request: LoginRequest,
		actor: ActorSubclass<_SERVICE>,
	) => Promise<{
		session_id: string;
		user_canister_pubkey: Uint8Array<ArrayBufferLike> | number[];
	}>;

	/** Get IC delegation for session. */
	getDelegation: (
		sessionId: string,
		actor: ActorSubclass<_SERVICE>,
	) => Promise<SignedDelegation>;

	/** Create IC identity from delegation. */
	createIdentity: (
		sessionIdentity: ECDSAKeyIdentity,
		signedDelegation: SignedDelegation,
		userCanisterPubkey: Uint8Array<ArrayBufferLike> | number[],
	) => Promise<{ identity: Identity; delegationChain: DelegationChain }>;

	/** Store identity in local storage. */
	storeIdentity: (
		sessionIdentity: ECDSAKeyIdentity,
		delegationChain: DelegationChain,
	) => Promise<void>;

	/** Connect to Ethereum to login the user. */
	login: () => Promise<void>;
};

export type PhantomWallet = {
	connect(): Promise<{ publicKey: { toString(): string } }>;
	disconnect(): Promise<void>;
	isConnected: boolean;
	publicKey?: { toString(): string };
	signMessage(
		message: Uint8Array,
		display?: "utf8" | "hex",
	): Promise<{ signature: Uint8Array; publicKey: { toString(): string } }>;
};


export type SOLContext = {
	/** Connect to Phantom wallet and return address. */
	connectWallet: (wallet: PhantomWallet) => Promise<{ address: string }>;

	/** Prepare SIWE message for signing. */
	prepareMessage: (
		address: string,
		actor: ActorSubclass<_SERVICE>,
	) => Promise<{ message: Uint8Array; message_id: string }>;

	/** Sign message with Phantom wallet. */
	signMessage: (
		wallet: PhantomWallet,
		message: Uint8Array,
	) => Promise<Uint8Array>;

	/** Authenticate with signed message and get session details. */
	authenticate: (
		request: SIWSLoginRequest,
		actor: ActorSubclass<_SERVICE>,
	) => Promise<{
		session_id: string;
		user_canister_pubkey: Uint8Array<ArrayBufferLike> | number[];
	}>;

	/** Get IC delegation for session. */
	getDelegation: (
		sessionId: string,
		actor: ActorSubclass<_SERVICE>,
	) => Promise<SignedDelegation>;

	/** Create IC identity from delegation. */
	createIdentity: (
		sessionIdentity: ECDSAKeyIdentity,
		signedDelegation: SignedDelegation,
		userCanisterPubkey: Uint8Array<ArrayBufferLike> | number[],
	) => Promise<{ identity: Identity; delegationChain: DelegationChain }>;

	/** Store identity in local storage. */
	storeIdentity: (
		sessionIdentity: ECDSAKeyIdentity,
		delegationChain: DelegationChain,
	) => Promise<void>;

	/** Connect to Solana to login the user. */
	login: () => Promise<void>;
};

export type ARContext = {
	/** Connect to Wander wallet and return address and public key. */
	connectWallet: (
		wallet: any,
	) => Promise<{ address: string; publicKey: string }>;

	/** Prepare SIWA message for signing. */
	prepareMessage: (
		request: SIWAMessageRequest,
		actor: ActorSubclass<_SERVICE>,
	) => Promise<{ message: Uint8Array; message_id: string }>;

	/** Sign message with Wander wallet. */
	signMessage: (
		wallet: any,
		message: Uint8Array,
	) => Promise<Uint8Array>;

	/** Authenticate with signed message and get session details. */
	authenticate: (
		request: SIWALoginRequest,
		actor: ActorSubclass<_SERVICE>,
	) => Promise<{
		session_id: string;
		user_canister_pubkey: Uint8Array<ArrayBufferLike> | number[];
	}>;

	/** Get IC delegation for session. */
	getDelegation: (
		sessionId: string,
		actor: ActorSubclass<_SERVICE>,
	) => Promise<SignedDelegation>;

	/** Create IC identity from delegation. */
	createIdentity: (
		sessionIdentity: ECDSAKeyIdentity,
		signedDelegation: SignedDelegation,
		userCanisterPubkey: Uint8Array<ArrayBufferLike> | number[],
	) => Promise<{ identity: Identity; delegationChain: DelegationChain }>;

	/** Store identity in local storage. */
	storeIdentity: (
		sessionIdentity: ECDSAKeyIdentity,
		delegationChain: DelegationChain,
	) => Promise<void>;

	/** Connect to Arweave to login the user. */
	login: () => Promise<void>;
};
