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
  asset_canister,
} from "../../../../../asset_canister"; 

import {
  asset_manager,
  createActor as createActorAssetManager,
} from "../../../../../declarations/asset_manager";

import {
  perpetua,
  createActor as createActorPerpetua,
} from "../../../../../declarations/perpetua";

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
  // create new client each time inspired by default react app
  // https://gitlab.com/kurdy/dfx_base/-/blob/main/src/dfx_base_frontend/src/services/auth.ts?ref_type=heads

  // reason for creating new client each time is
  // if the user login has expired it will SPA will not know
  // as same client's ( isAuthenticated ) will always return true even if user session is expired
  const authClient = await AuthClient.create();

  return authClient;
};

const getActor = async <T>(
  canisterId: string,
  createActorFn: (canisterId: string, options: { agent: HttpAgent }) => T,
  defaultActor: T
): Promise<T> => {
  try {
    const client = await getAuthClient();
    if (await client.isAuthenticated()) {
      const identity = client.getIdentity();

      const agent = await HttpAgent.create({
        identity,
        host: isLocalDevelopment
          ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943` // Local development URL
          : "https://identity.ic0.app", // Default to mainnet if neither condition is true
      });

      // Fetch root key for certificate validation during development
      // dangerous on mainnet
      if (isLocalDevelopment) {
        await agent.fetchRootKey().catch((err) => {
          console.warn(
            "Unable to fetch root key. Check to ensure that your local replica is running"
          );
          console.error(err);
        });
      }

      return createActorFn(canisterId, {
        agent,
      });
    }
  } catch (error) {
    console.error(`Error initializing actor for ${canisterId}:`, error);
  }
  return defaultActor;
};

export const getActorAlexBackend = () =>
  getActor(alex_backend_canister_id, createAlexBackendActor, alex_backend);

export const getUser = () => getActor(user_canister_id, createUserActor, user);

export const getIcrc7Actor = () =>
  getActor(icrc7_canister_id, createIcrc7Actor, icrc7);

export const getIcrc7ScionActor = () =>
  getActor(icrc7_scion_canister_id, createIcrc7ScionActor, icrc7_scion);

export const getNftManagerActor = () =>
  getActor(nft_manager_canister_id, createNftManagerActor, nft_manager);

export const getActorSwap = () =>
  getActor(icp_swap_canister_id, createActorSwap, icp_swap);

export const getIcpLedgerActor = () =>
  getActor(icp_ledger_canister_id, createActorIcpLedger, icp_ledger_canister);

export const getTokenomicsActor = () =>
  getActor(tokenomics_canister_id, createActorTokenomics, tokenomics);

export const getLbryActor = () =>
  getActor(lbry_canister_id, createActorLbry, LBRY);

export const getAlexActor = () =>
  getActor(alex_canister_id, createActorAlex, ALEX);

export const getActorVetkd = () =>
  getActor(vetkd_canister_id, createActorVetkd, vetkd);

export const getActorEmporium = () =>
  getActor(emporium_canister_id, createActorEmporium, emporium);

export const getActorPerpetua = () =>
  getActor(perpetua_canister_id, createActorPerpetua, perpetua);

export const getLogs = () => getActor(log_canister_id, createActorLogs, logs);

export const getIcpSwapFactoryCanister = () =>
  getActor(
    icp_swap_factory_canister_id,
    createActorIcpSwapFactory,
    icp_swap_factory
  );
export const getActorUserAssetCanister = (canisterId: string) =>
  getActor(canisterId, createActorAssetCanister, asset_canister);

export const getActorAssetManager = () =>
  getActor(asset_manager_canister_id, createActorAssetManager, asset_manager);
