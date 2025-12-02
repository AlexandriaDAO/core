import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import {
  createActor as createAlexBackendActor,
  alex_backend,
} from "../../../../../declarations/alex_backend";
import {
  createActor as createUserActor,
  user,
} from "../../../../../declarations/user";
import {
  createActor as createIcrc7Actor,
  icrc7,
} from "../../../../../declarations/icrc7";
import {
  createActor as createIcrc7ScionActor,
  icrc7_scion,
} from "../../../../../declarations/icrc7_scion";
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

import {
  vetkd,
  createActor as createActorVetkd,
} from "../../../../../declarations/vetkd";

import {
  emporium,
  createActor as createActorEmporium,
} from "../../../../../declarations/emporium";
import {
  logs,
  createActor as createActorLogs,
} from "../../../../../declarations/logs";
import {
  icp_swap_factory,
  createActor as createActorIcpSwapFactory,
} from "../../../../../icp_swap_factory";
import {
  createActor as createActorAssetCanister,
  // asset_canister, // We will not use the potentially undefined global default
} from "../../../../../asset_canister"; 

import {
  asset_manager,
  createActor as createActorAssetManager,
} from "../../../../../declarations/asset_manager";

import {
  perpetua,
  createActor as createActorPerpetua,
} from "../../../../../declarations/perpetua";

// --- Caching Variables ---
let authClientInstance: AuthClient | null = null;
const agentCache = new Map<string, HttpAgent>();
const agentsFetchedRootKey = new Set<HttpAgent>(); // To avoid fetching root key multiple times for the same agent instance
const actorCache = new Map<string, any>();
// --- End Caching Variables ---

const isLocalDevelopment = process.env.DFX_NETWORK !== "ic";

const alex_backend_canister_id = process.env.CANISTER_ID_ALEX_BACKEND!;
const icrc7_canister_id = process.env.CANISTER_ID_ICRC7!;
const icrc7_scion_canister_id = process.env.CANISTER_ID_ICRC7_SCION!;
const nft_manager_canister_id = process.env.CANISTER_ID_NFT_MANAGER!;
const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
const icp_ledger_canister_id = "ryjl3-tyaaa-aaaaa-aaaba-cai";
const tokenomics_canister_id = process.env.CANISTER_ID_TOKENOMICS!;
const lbry_canister_id = process.env.CANISTER_ID_LBRY!;
const alex_canister_id = process.env.CANISTER_ID_ALEX!;
const user_canister_id = process.env.CANISTER_ID_USER!;
const alex_wallet_canister_id = process.env.CANISTER_ID_ALEX_WALLET!;
const vetkd_canister_id = process.env.CANISTER_ID_VETKD!;
const emporium_canister_id = process.env.CANISTER_ID_EMPORIUM!;
const log_canister_id = process.env.CANISTER_ID_LOGS!;
const perpetua_canister_id = process.env.CANISTER_ID_PERPETUA!;
const icp_swap_factory_canister_id = "ggzvv-5qaaa-aaaag-qck7a-cai";
const asset_manager_canister_id = process.env.CANISTER_ID_ASSET_MANAGER!;

export const getPrincipal = (client: AuthClient): string =>
  client.getIdentity().getPrincipal().toString();

export const getAuthClient = async (): Promise<AuthClient> => {
  if (authClientInstance) {
    return authClientInstance;
  }
  authClientInstance = await AuthClient.create();
  return authClientInstance;
};

// Generic actor creation and caching utility
const getActor = async <T>(
  canisterId: string,
  createActorFn: (canisterId: string, options: { agent: HttpAgent }) => T,
  // defaultActor: T // Removed: We should always create a specific actor or fail clearly.
): Promise<T> => {
  if (!canisterId) {
    throw new Error("[authUtils.getActor] Canister ID cannot be null or empty.");
  }

  try {
    const client = await getAuthClient();
    const isAuthenticated = await client.isAuthenticated();
    const principalString = isAuthenticated
      ? client.getIdentity().getPrincipal().toString()
      : "ANONYMOUS";

    const actorCacheKey = `${canisterId}_${principalString}`;
    if (actorCache.has(actorCacheKey)) {
      return actorCache.get(actorCacheKey) as T;
    }

    let agent: HttpAgent;
    const agentCacheKey = principalString; // Agent is cached by principal string (or "ANONYMOUS")

    if (agentCache.has(agentCacheKey)) {
      agent = agentCache.get(agentCacheKey)!;
    } else {
      const agentOptions: { identity?: Identity; host?: string } = {};
      agentOptions.host = isLocalDevelopment
        ? (process.env.NODE_ENV === 'development' ? `http://127.0.0.1:4943` : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`) 
        : "https://ic0.app";

      if (isAuthenticated) {
        agentOptions.identity = client.getIdentity();
      } else {
        // For anonymous agent, if local development, ensure it targets the local replica correctly.
        // The host is already set above.
      }
      
      agent = new HttpAgent(agentOptions);
      agentCache.set(agentCacheKey, agent);

      // Fetch root key for new agent if in development (applies to both authenticated and anonymous)
      // Avoid fetching multiple times for the same agent *instance*
      if (isLocalDevelopment && !agentsFetchedRootKey.has(agent)) {
        console.log(`[authUtils.getActor] Agent (Authenticated: ${isAuthenticated}, Principal: ${principalString}) fetching root key for host: ${agentOptions.host}`);
        await agent.fetchRootKey().catch((err) => {
          console.warn(`Unable to fetch root key for agent. Host: ${agentOptions.host}`, err);
        });
        agentsFetchedRootKey.add(agent);
      }
    }

    const newActor = createActorFn(canisterId, { agent });
    actorCache.set(actorCacheKey, newActor);
    return newActor;

  } catch (error) {
    console.error(`[authUtils.getActor] CRITICAL ERROR initializing actor for canister ${canisterId} (Authenticated: ${await authClientInstance?.isAuthenticated()}):`, error);
    throw error; // Rethrow so the caller knows something went wrong
  }
};

// Specific actor getters
export const getActorAlexBackend = () =>
  getActor(alex_backend_canister_id, createAlexBackendActor);

export const getUser = () => getActor(user_canister_id, createUserActor);

export const getIcrc7Actor = () =>
  getActor(icrc7_canister_id, createIcrc7Actor);

export const getIcrc7ScionActor = () =>
  getActor(icrc7_scion_canister_id, createIcrc7ScionActor);

export const getNftManagerActor = () =>
  getActor(nft_manager_canister_id, createNftManagerActor);

export const getActorSwap = () =>
  getActor(icp_swap_canister_id, createActorSwap);

export const getIcpLedgerActor = () =>
  getActor(icp_ledger_canister_id, createActorIcpLedger);

export const getTokenomicsActor = () =>
  getActor(tokenomics_canister_id, createActorTokenomics);

export const getLbryActor = () =>
  getActor(lbry_canister_id, createActorLbry);

export const getAlexActor = () =>
  getActor(alex_canister_id, createActorAlex);

export const getActorVetkd = () =>
  getActor(vetkd_canister_id, createActorVetkd);

export const getActorEmporium = () =>
  getActor(emporium_canister_id, createActorEmporium);

export const getActorPerpetua = () =>
  getActor(perpetua_canister_id, createActorPerpetua);

export const getLogs = () => getActor(log_canister_id, createActorLogs);

export const getIcpSwapFactoryCanister = () =>
  getActor(
    icp_swap_factory_canister_id,
    createActorIcpSwapFactory,
  );

export const getActorUserAssetCanister = (canisterId: string) =>
  getActor(canisterId, createActorAssetCanister);

export const getActorAssetManager = () =>
  getActor(asset_manager_canister_id, createActorAssetManager);
