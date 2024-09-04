import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import {
  createActor,
  alex_backend,
} from "../../../../../declarations/alex_backend";
import {
  createActor as createAlexLibrarianActor,
  alex_librarian
} from "../../../../../declarations/alex_librarian";
import {
  createActor as createAlexWalletActor,
} from "../../../../../declarations/alex_wallet";
import {
  createActor as createIcrc7Actor,
  icrc7,
} from "../../../../../declarations/icrc7";
import {
  createActor as createNftManagerActor,
  nft_manager,
} from "../../../../../declarations/nft_manager";
import {
  icp_swap,
  createActor as createActorSwap,
} from "../../../../../declarations/icp_swap";
import {
  icp_ledger_canister,
  createActor as createActorIcpLedger,
} from "../../../../../declarations/icp_ledger_canister";
import {
  tokenomics,
  createActor as createActorTokenomics,
} from "../../../../../declarations/tokenomics";
import {
  LBRY,
  createActor as createActorLbry,
} from "../../../../../declarations/LBRY";
import {
  ALEX,
  createActor as createActorAlex,
} from "../../../../../declarations/ALEX";

const backend_canister_id = process.env.CANISTER_ID_ALEX_BACKEND!;
const icrc7_canister_id = process.env.CANISTER_ID_ICRC7!;
const nft_manager_canister_id = process.env.CANISTER_ID_NFT_MANAGER!;
const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
const icp_ledger_canister_id = process.env.CANISTER_ID_ICP_LEDGER_CANISTER!;
const tokenomics_canister_id = process.env.CANISTER_ID_TOKENOMICS!;
const lbry_canister_id = process.env.CANISTER_ID_LBRY!;
const alex_canister_id = process.env.CANISTER_ID_ALEX!;
const alex_librarian_canister_id = process.env.CANISTER_ID_ALEX_LIBRARIAN!;
const alex_wallet_canister_id = process.env.CANISTER_ID_ALEX_WALLET!;

export const getPrincipal = (client: AuthClient): string => {
  const identity = client.getIdentity();
  const principal = identity.getPrincipal().toString();
  return principal;
};

const createAuthenticatedActor = async <T>(
  client: AuthClient,
  canisterId: string,
  createActorFn: (canisterId: string, options: { agent: HttpAgent }) => T,
  defaultActor: T
): Promise<T> => {
  try {
    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      const agent = new HttpAgent({ identity });
      return createActorFn(canisterId, { agent });
    }
  } catch (error) {
    console.error(`Error initializing actor for ${canisterId}:`, error);
  }
  return defaultActor;
};

export const initializeActor = (client: AuthClient) =>
  createAuthenticatedActor(client, backend_canister_id, createActor, alex_backend);

export const initializeActorAlexLibrarian = (client: AuthClient) =>
  createAuthenticatedActor(client, alex_librarian_canister_id, createAlexLibrarianActor, alex_librarian);

export const initializeActorAlexWallet = async (client: AuthClient) => {
  try {
    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      const agent = new HttpAgent({ identity });
      const actor = createAlexWalletActor(alex_wallet_canister_id, { agent });
      return actor;
    }
  } catch (error) {
    console.error("Error initializing Alex Wallet actor", error);
  }
  return createAlexWalletActor(alex_wallet_canister_id);
};

export const initializeIcrc7Actor = (client: AuthClient) =>
  createAuthenticatedActor(client, icrc7_canister_id, createIcrc7Actor, icrc7);

export const initializeNftManagerActor = (client: AuthClient) =>
  createAuthenticatedActor(client, nft_manager_canister_id, createNftManagerActor, nft_manager);

export const initializeActorSwap = (client: AuthClient) =>
  createAuthenticatedActor(client, icp_swap_canister_id, createActorSwap, icp_swap);

export const initializeIcpLedgerActor = (client: AuthClient) =>
  createAuthenticatedActor(client, icp_ledger_canister_id, createActorIcpLedger, icp_ledger_canister);

export const initializeTokenomicsActor = (client: AuthClient) =>
  createAuthenticatedActor(client, tokenomics_canister_id, createActorTokenomics, tokenomics);

export const initializeLbryActor = (client: AuthClient) =>
  createAuthenticatedActor(client, lbry_canister_id, createActorLbry, LBRY);

export const initializeAlexActor = (client: AuthClient) =>
  createAuthenticatedActor(client, alex_canister_id, createActorAlex, ALEX);
