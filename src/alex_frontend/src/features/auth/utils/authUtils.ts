import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import {
  createActor,
  alex_backend,
} from "../../../../../declarations/alex_backend";
import {
  createActor as createIcrc7Actor,
  icrc7,
} from "../../../../../declarations/icrc7";
import {
  createActor as createNftManagerActor,
  nft_manager,
} from "../../../../../declarations/nft_manager"
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

export const getPrincipal = (client: AuthClient): string => {
  const identity = client.getIdentity();
  const principal = identity.getPrincipal().toString();
  return principal;
};

export const initializeActor = async (client: AuthClient) => {
  try {
    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      const agent = new HttpAgent({ identity });
      const actor = createActor(backend_canister_id, { agent });
      return actor;
    }
  } catch (error) {
    console.error("Error initializing backend actor", error);
  }
  return alex_backend;
};
export const initializeIcrc7Actor = async (client: AuthClient) => {
  try {
    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      const agent = new HttpAgent({ identity });
      const actor = createIcrc7Actor(icrc7_canister_id, { agent });
      return actor;
    }
  } catch (error) {
    console.error("Error initializing ICRC7 actor", error);
  }
  return icrc7;
};
export const initializeNftManagerActor = async (client: AuthClient) => {
  try {
    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      const agent = new HttpAgent({ identity });
      const actor = createNftManagerActor(nft_manager_canister_id, { agent });
      return actor;
    }
  } catch (error) {
    console.error("Error initializing NFT Manager actor", error);
  }
  return nft_manager;
}
export const initializeActorSwap = async (client: AuthClient) => {
  try {
    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      const agent = new HttpAgent({ identity });
      const actor = createActorSwap(icp_swap_canister_id, { agent });
      return actor;
    }
  } catch (error) {
    console.error("Error initializing swap actor", error);
  }
  return icp_swap;
};
export const initializeIcpLedgerActor = async (client: AuthClient) => {
  try {
    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      const agent = new HttpAgent({ identity });
      const actor = createActorIcpLedger(icp_ledger_canister_id, { agent });
      return actor;
    }
  } catch (error) {
    console.error("Error initializing icp actor", error);
  }
  return icp_ledger_canister;
};
export const initializeTokenomicsActor = async (client: AuthClient) => {
  try {
    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      const agent = new HttpAgent({ identity });
      const actor = createActorTokenomics(tokenomics_canister_id, { agent });
      return actor;
    }
  } catch (error) {
    console.error("Error initializing tokenomics actor", error);
  }
  return tokenomics;
};
export const initializeLbryActor = async (client: AuthClient) => {
  try {
    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      const agent = new HttpAgent({ identity });
      const actor = createActorLbry(lbry_canister_id, { agent });
      return actor;
    }
  } catch (error) {
    console.error("Error initializing Lbry actor", error);
  }
  return LBRY;
};
export const initializeAlexActor = async (client: AuthClient) => {
  try {
    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();
      const agent = new HttpAgent({ identity });
      const actor = createActorAlex(alex_canister_id, { agent });
      return actor;
    }
  } catch (error) {
    console.error("Error initializing Alex actor", error);
  }
  return ALEX;
};
