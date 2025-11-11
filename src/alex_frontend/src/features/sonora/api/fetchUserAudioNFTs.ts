import { createTokenAdapter } from "../../alexandrian/adapters/TokenAdapter";
import { fetchUserTokens } from "../../alexandrian/api/fetchUserTokens";
import { ARWEAVE_GRAPHQL_ENDPOINT } from "../../permasearch/utils/helpers";
import { natToArweaveId } from "../../../utils/id_convert";
import { ArchiveAudio } from "../types";

// Audio content types we want to filter for
const AUDIO_CONTENT_TYPES = [
    "audio/mp3",
    "audio/wav", 
    "audio/ogg",
    "audio/flac",
    "audio/m4a",
    "audio/mpeg",
    "audio/webm",
    "audio/x-wav",
    "audio/x-m4a"
];

interface ArweaveTransaction {
    id: string;
    data: {
        size: string;
        type: string;
    };
    tags: Array<{
        name: string;
        value: string;
    }>;
    block: {
        height: number;
        timestamp: number;
    };
}

interface GraphQLResponse {
    data: {
        transactions: {
            edges: Array<{
                node: ArweaveTransaction;
            }>;
        };
    };
    errors?: Array<{ message: string }>;
}

export interface FetchUserAudioParams {
    userPrincipal: string;
    page?: number;
    pageSize?: number;
    signal?: AbortSignal;
}

export interface UserAudioResponse {
    audios: ArchiveAudio[];
    page: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
}

export async function fetchUserAudioNFTs({
    userPrincipal,
    page = 1,
    pageSize = 8,
    signal
}: FetchUserAudioParams): Promise<UserAudioResponse> {
    try {
        // Step 1: Get user's NFT token IDs using Alexandrian patterns
        const tokenAdapter = createTokenAdapter("NFT");
        
        const tokenParams = {
            page: page - 1, // Convert to 0-based indexing for alexandrian API
            pageSize: pageSize,
            sortOrder: "newest" as const,
            sortBy: "default" as const,
            collectionType: "NFT" as const,
            user: userPrincipal,
        };
        
        const tokenResult = await fetchUserTokens(
            tokenAdapter,
            userPrincipal,
            tokenParams,
            signal
        );

        const { tokenIds } = tokenResult;
        
        // For now, we'll estimate pagination based on pageSize
        // Since fetchUserTokens doesn't return total count directly,
        // we'll use the returned tokenIds length to determine if there are more pages
        const hasMore = tokenIds.length === pageSize;
        const estimatedTotalCount = hasMore ? (page * pageSize) + 1 : (page - 1) * pageSize + tokenIds.length;
        const estimatedTotalPages = Math.ceil(estimatedTotalCount / pageSize);

        if (tokenIds.length === 0) {
            return {
                audios: [],
                page,
                totalPages: page === 1 ? 1 : page - 1,
                totalCount: (page - 1) * pageSize,
                hasMore: false
            };
        }

        // Step 2: Convert token IDs to Arweave IDs
        const arweaveIds = tokenIds.map(tokenId => natToArweaveId(tokenId));

        // Step 3: Fetch transaction metadata from Arweave using GraphQL
        const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                    query GetTransactionsByIds($ids: [ID!]) {
                        transactions(
                            ids: $ids,
                            first: 100
                        ) {
                            edges {
                                node {
                                    id
                                    data { size type }
                                    tags { name value }
                                    block { height timestamp }
                                }
                            }
                        }
                    }
                `,
                variables: { ids: arweaveIds }
            }),
            signal,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch transaction metadata: ${response.status}`);
        }

        const data: GraphQLResponse = await response.json();

        if (data.errors) {
            throw new Error(`GraphQL errors: ${data.errors.map(e => e.message).join(", ")}`);
        }

        // Step 4: Filter for audio content types and convert to ArchiveAudio format
        const audioNFTs: ArchiveAudio[] = [];
        
        // Create a map of Arweave ID to Token ID for quick lookup
        const arweaveToTokenMap = new Map<string, bigint>();
        for (let i = 0; i < arweaveIds.length; i++) {
            arweaveToTokenMap.set(arweaveIds[i], tokenIds[i]);
        }
        
        for (const edge of data.data.transactions?.edges || []) {
            const transaction = edge.node;
            
            // Find Content-Type tag
            const contentTypeTag = transaction.tags.find(
                tag => tag.name === "Content-Type"
            );
            
            // Check if it's an audio file
            if (contentTypeTag && AUDIO_CONTENT_TYPES.some(type => 
                contentTypeTag.value.toLowerCase().startsWith(type)
            )) {
                // Get the corresponding token ID
                const tokenId = arweaveToTokenMap.get(transaction.id);
                if (!tokenId) continue; // Skip if no token ID found
                
                // Convert to ArchiveAudio format
                const sizeInBytes = parseInt(transaction.data.size || "0");
                const sizeInMB = sizeInBytes / (1024 * 1024);
                
                audioNFTs.push({
                    id: transaction.id,
                    type: contentTypeTag.value,
                    size: sizeInMB > 0 ? `${sizeInMB.toFixed(1)} MB` : "Unknown",
                    timestamp: transaction.block?.timestamp 
                        ? new Date(transaction.block.timestamp * 1000).toISOString()
                        : new Date().toISOString(),
                    token_id: tokenId.toString()
                });
            }
        }

        console.log(`Found ${audioNFTs.length} audio NFTs out of ${tokenIds.length} total NFTs`);
        
        // Calculate final pagination info based on actual audio NFTs found
        const audioRatio = tokenIds.length > 0 ? audioNFTs.length / tokenIds.length : 1;
        const adjustedTotalCount = Math.ceil(estimatedTotalCount * audioRatio);
        const adjustedTotalPages = Math.ceil(adjustedTotalCount / pageSize);
        const adjustedHasMore = audioNFTs.length === pageSize || hasMore;
        
        return {
            audios: audioNFTs,
            page,
            totalPages: Math.max(1, adjustedTotalPages),
            totalCount: Math.max(audioNFTs.length, adjustedTotalCount),
            hasMore: adjustedHasMore && audioNFTs.length === pageSize
        };
        
    } catch (error) {
        console.error("Error fetching user audio NFTs:", error);
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        throw new Error("Failed to fetch user audio NFTs");
    }
}