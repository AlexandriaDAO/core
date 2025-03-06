import { Principal } from '@dfinity/principal';
import { icrc7 } from '../../../../../../declarations/icrc7';
import { icrc7_scion } from '../../../../../../declarations/icrc7_scion';
import { nft_manager } from '../../../../../../declarations/nft_manager';
import { natToArweaveId } from '@/utils/id_convert';
import type { NFTData } from '@/apps/Modules/shared/types/nft';

// Define the token type
export type TokenType = 'NFT' | 'SBT';

// Interface for token operations
export interface TokenAdapter {
  // Basic token information
  getTokenType(): TokenType;
  
  // Token supply and balance operations
  getTotalSupply(): Promise<bigint>;
  getBalanceOf(owner: Principal, subaccount?: Uint8Array | number[]): Promise<bigint>;
  
  // Token retrieval operations
  getTokens(start?: bigint, take?: bigint): Promise<bigint[]>;
  getTokensOf(owner: Principal, cursor?: bigint, take?: bigint): Promise<bigint[]>;
  getOwnerOf(tokenIds: bigint[]): Promise<Array<[] | [{ owner: Principal, subaccount: [] | [Uint8Array | number[]] }]>>;
  
  // Token metadata
  getTokenMetadata(tokenIds: bigint[]): Promise<Array<[] | [Array<[string, any]>]>>;
  getCollectionMetadata(): Promise<Array<[string, any]>>;
  
  // Token conversion
  tokenToNFTData(tokenId: bigint, ownerPrincipal: string): Promise<NFTData>;
}

// Static helper function to determine token type
export function determineTokenType(tokenId: string): TokenType {
  // Based on backend code comments:
  // OG_IDs (NFTs) are 75-77 characters long
  // SCION_IDs (SBTs) are 95-97 characters long
  
  // If the token ID is longer than 90 characters, it's likely an SBT
  if (tokenId.length >= 90) {
    return 'SBT';
  }
  
  // Otherwise, it's an NFT
  return 'NFT';
}

// Implementation for NFT tokens
class NFTTokenAdapter implements TokenAdapter {
  getTokenType(): TokenType {
    return 'NFT';
  }
  
  async getTotalSupply(): Promise<bigint> {
    return await icrc7.icrc7_total_supply();
  }
  
  async getBalanceOf(owner: Principal, subaccount?: Uint8Array | number[]): Promise<bigint> {
    // Using any to bypass type checking for now
    // The actual structure is correct, but TypeScript is having trouble with the union types
    const params: any = [{
      owner,
      subaccount: subaccount ? [subaccount] : []
    }];
    const balance = await icrc7.icrc7_balance_of(params);
    return balance[0];
  }
  
  async getTokens(start?: bigint, take?: bigint): Promise<bigint[]> {
    // Convert parameters to the expected format: [] | [bigint]
    const startParam: [] | [bigint] = start !== undefined ? [start] : [];
    const takeParam: [] | [bigint] = take !== undefined ? [take] : [];
    return await icrc7.icrc7_tokens(startParam, takeParam);
  }
  
  async getTokensOf(owner: Principal, cursor?: bigint, take?: bigint): Promise<bigint[]> {
    // Using any to bypass type checking for now
    const params: any = { owner, subaccount: [] };
    
    // Convert parameters to the expected format: [] | [bigint]
    const cursorParam: [] | [bigint] = cursor !== undefined ? [cursor] : [];
    const takeParam: [] | [bigint] = take !== undefined ? [take] : [];
    
    return await icrc7.icrc7_tokens_of(params, cursorParam, takeParam);
  }
  
  async getOwnerOf(tokenIds: bigint[]): Promise<Array<[] | [{ owner: Principal, subaccount: [] | [Uint8Array | number[]] }]>> {
    return await icrc7.icrc7_owner_of(tokenIds);
  }
  
  async getTokenMetadata(tokenIds: bigint[]): Promise<Array<[] | [Array<[string, any]>]>> {
    return await icrc7.icrc7_token_metadata(tokenIds);
  }
  
  async getCollectionMetadata(): Promise<Array<[string, any]>> {
    return await icrc7.icrc7_collection_metadata();
  }
  
  async tokenToNFTData(tokenId: bigint, ownerPrincipal: string): Promise<NFTData> {
    return {
      collection: 'NFT',
      principal: ownerPrincipal,
      arweaveId: natToArweaveId(tokenId)
    };
  }
}

// Implementation for SBT tokens
class SBTTokenAdapter implements TokenAdapter {
  getTokenType(): TokenType {
    return 'SBT';
  }
  
  async getTotalSupply(): Promise<bigint> {
    return await icrc7_scion.icrc7_total_supply();
  }
  
  async getBalanceOf(owner: Principal, subaccount?: Uint8Array | number[]): Promise<bigint> {
    // Using any to bypass type checking for now
    // The actual structure is correct, but TypeScript is having trouble with the union types
    const params: any = [{
      owner,
      subaccount: subaccount ? [subaccount] : []
    }];
    const balance = await icrc7_scion.icrc7_balance_of(params);
    return balance[0];
  }
  
  async getTokens(start?: bigint, take?: bigint): Promise<bigint[]> {
    // Convert parameters to the expected format: [] | [bigint]
    const startParam: [] | [bigint] = start !== undefined ? [start] : [];
    const takeParam: [] | [bigint] = take !== undefined ? [take] : [];
    return await icrc7_scion.icrc7_tokens(startParam, takeParam);
  }
  
  async getTokensOf(owner: Principal, cursor?: bigint, take?: bigint): Promise<bigint[]> {
    // Using any to bypass type checking for now
    const params: any = { owner, subaccount: [] };
    
    // Convert parameters to the expected format: [] | [bigint]
    const cursorParam: [] | [bigint] = cursor !== undefined ? [cursor] : [];
    const takeParam: [] | [bigint] = take !== undefined ? [take] : [];
    
    return await icrc7_scion.icrc7_tokens_of(params, cursorParam, takeParam);
  }
  
  async getOwnerOf(tokenIds: bigint[]): Promise<Array<[] | [{ owner: Principal, subaccount: [] | [Uint8Array | number[]] }]>> {
    return await icrc7_scion.icrc7_owner_of(tokenIds);
  }
  
  async getTokenMetadata(tokenIds: bigint[]): Promise<Array<[] | [Array<[string, any]>]>> {
    return await icrc7_scion.icrc7_token_metadata(tokenIds);
  }
  
  async getCollectionMetadata(): Promise<Array<[string, any]>> {
    return await icrc7_scion.icrc7_collection_metadata();
  }
  
  async tokenToNFTData(tokenId: bigint, ownerPrincipal: string): Promise<NFTData> {
    const ogId = await nft_manager.scion_to_og_id(tokenId);
    return {
      collection: 'SBT',
      principal: ownerPrincipal,
      arweaveId: natToArweaveId(ogId)
    };
  }
}

// Factory function to create the appropriate adapter
export function createTokenAdapter(tokenType: TokenType): TokenAdapter {
  switch (tokenType) {
    case 'NFT':
      return new NFTTokenAdapter();
    case 'SBT':
      return new SBTTokenAdapter();
    default:
      throw new Error(`Unsupported token type: ${tokenType}`);
  }
} 