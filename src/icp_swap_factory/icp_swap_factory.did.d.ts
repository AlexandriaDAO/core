import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Address = string;
export interface CallbackStrategy {
  'token' : Token,
  'callback' : [Principal, string],
}
export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'upgrade' : [] | [boolean],
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export type NatResult = { 'ok' : bigint } |
  { 'err' : string };
export interface PublicPoolOverView {
  'id' : bigint,
  'token0TotalVolume' : number,
  'volumeUSD1d' : number,
  'volumeUSD7d' : number,
  'token0Id' : string,
  'token1Id' : string,
  'token1Volume24H' : number,
  'totalVolumeUSD' : number,
  'sqrtPrice' : number,
  'pool' : string,
  'tick' : bigint,
  'liquidity' : bigint,
  'token1Price' : number,
  'feeTier' : bigint,
  'token1TotalVolume' : number,
  'volumeUSD' : number,
  'feesUSD' : number,
  'token0Volume24H' : number,
  'token1Standard' : string,
  'txCount' : bigint,
  'token1Decimals' : number,
  'token0Standard' : string,
  'token0Symbol' : string,
  'token0Decimals' : number,
  'token0Price' : number,
  'token1Symbol' : string,
}
export interface PublicTokenOverview {
  'id' : bigint,
  'volumeUSD1d' : number,
  'volumeUSD7d' : number,
  'totalVolumeUSD' : number,
  'name' : string,
  'volumeUSD' : number,
  'feesUSD' : number,
  'priceUSDChange' : number,
  'address' : string,
  'txCount' : bigint,
  'priceUSD' : number,
  'standard' : string,
  'symbol' : string,
}
export interface StreamingCallbackHttpResponse {
  'token' : [] | [Token],
  'body' : Uint8Array | number[],
}
export type StreamingStrategy = { 'Callback' : CallbackStrategy };
export interface Token { 'arbitrary_data' : string }
export interface Transaction {
  'to' : string,
  'action' : TransactionType,
  'token0Id' : string,
  'token1Id' : string,
  'liquidityTotal' : bigint,
  'from' : string,
  'hash' : string,
  'tick' : bigint,
  'token1Price' : number,
  'recipient' : string,
  'token0ChangeAmount' : number,
  'sender' : string,
  'liquidityChange' : bigint,
  'token1Standard' : string,
  'token0Fee' : number,
  'token1Fee' : number,
  'timestamp' : bigint,
  'token1ChangeAmount' : number,
  'token1Decimals' : number,
  'token0Standard' : string,
  'amountUSD' : number,
  'amountToken0' : number,
  'amountToken1' : number,
  'poolFee' : bigint,
  'token0Symbol' : string,
  'token0Decimals' : number,
  'token0Price' : number,
  'token1Symbol' : string,
  'poolId' : string,
}
export type TransactionType = { 'decreaseLiquidity' : null } |
  {
    'limitOrder' : {
      'token0InAmount' : bigint,
      'positionId' : bigint,
      'tickLimit' : bigint,
      'token1InAmount' : bigint,
    }
  } |
  { 'claim' : null } |
  { 'swap' : null } |
  { 'addLiquidity' : null } |
  { 'transferPosition' : bigint } |
  { 'increaseLiquidity' : null };
export interface _SERVICE {
  'addInvalidPoolIds' : ActorMethod<[Array<string>], undefined>,
  'addOwner' : ActorMethod<[Principal], undefined>,
  'addQuoteToken' : ActorMethod<[string, boolean], undefined>,
  'allPoolStorage' : ActorMethod<[], Array<string>>,
  'allTokenStorage' : ActorMethod<[], Array<string>>,
  'allUserStorage' : ActorMethod<[], Array<string>>,
  'batchInsert' : ActorMethod<[Array<Transaction>], undefined>,
  'cycleAvailable' : ActorMethod<[], NatResult>,
  'cycleBalance' : ActorMethod<[], NatResult>,
  'getAllPools' : ActorMethod<[], Array<PublicPoolOverView>>,
  'getAllTokens' : ActorMethod<[], Array<PublicTokenOverview>>,
  'getControllers' : ActorMethod<[], Array<Principal>>,
  'getDataQueueSize' : ActorMethod<[], bigint>,
  'getInvalidPoolIds' : ActorMethod<[], Array<string>>,
  'getLastDataTime' : ActorMethod<[], bigint>,
  'getOwners' : ActorMethod<[], Array<Principal>>,
  'getPoolQueueSize' : ActorMethod<[], Array<[string, bigint]>>,
  'getPoolsForToken' : ActorMethod<[string], Array<PublicPoolOverView>>,
  'getQuoteTokens' : ActorMethod<[], Array<string>>,
  'getSyncLock' : ActorMethod<[], boolean>,
  'getSyncStatus' : ActorMethod<[], Array<[string, boolean, string]>>,
  'getTokenQueueSize' : ActorMethod<[], Array<[string, bigint]>>,
  'getTotalVolumeAndUser' : ActorMethod<[], [number, bigint]>,
  'getUserQueueSize' : ActorMethod<[], Array<[string, bigint]>>,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'insert' : ActorMethod<[Transaction], undefined>,
  'poolMapping' : ActorMethod<[], Array<[string, string]>>,
  'poolStorage' : ActorMethod<[string], [] | [string]>,
  'setInvalidPoolIds' : ActorMethod<[Array<string>], undefined>,
  'setPoolSyncStatus' : ActorMethod<[boolean], boolean>,
  'setQuoteTokens' : ActorMethod<[Array<string>, boolean], undefined>,
  'setTokenSyncStatus' : ActorMethod<[boolean], boolean>,
  'setUserSyncStatus' : ActorMethod<[boolean], boolean>,
  'syncOverview' : ActorMethod<[], undefined>,
  'tokenMapping' : ActorMethod<[], Array<[string, string]>>,
  'tokenStorage' : ActorMethod<[string], [] | [string]>,
  'updateTokenMetadata' : ActorMethod<[string, string], undefined>,
  'userMapping' : ActorMethod<[], Array<[string, string]>>,
  'userStorage' : ActorMethod<[Address], [] | [string]>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
