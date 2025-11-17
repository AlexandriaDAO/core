import { createTokenAdapter } from "../../alexandrian/adapters/TokenAdapter";
import { fetchUserTokens } from "../../alexandrian/api/fetchUserTokens";
import { ARWEAVE_GRAPHQL_ENDPOINT } from "../../permasearch/utils/helpers";
import { natToArweaveId } from "../../../utils/id_convert";
import { LibraryBook } from "../types";

// EPUB content types - handle various formats
const BOOK_CONTENT_TYPES = [
    "application/epub+zip",
    "application/epub zip",  // Handle space instead of +
    "application/epub"       // Handle partial matches
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

export interface FetchUserBookParams {
    userPrincipal: string;
    page?: number;
    pageSize?: number;
    signal?: AbortSignal;
}

export interface UserBookResponse {
    books: LibraryBook[];
    page: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
}

export async function fetchUserBookNFTs({
    userPrincipal,
    page = 1,
    pageSize = 8,
    signal
}: FetchUserBookParams): Promise<UserBookResponse> {
    try {
        // Step 1: Get user's NFT token IDs using Alexandrian patterns
        console.log(`[Library] Fetching NFT tokens for user: ${userPrincipal}, page: ${page}`);
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
        
        console.log(`[Library] Fetched ${tokenResult.tokenIds.length} NFT tokens`);

        const { tokenIds } = tokenResult;
        
        // For now, we'll estimate pagination based on pageSize
        // Since fetchUserTokens doesn't return total count directly,
        // we'll use the returned tokenIds length to determine if there are more pages
        const hasMore = tokenIds.length === pageSize;
        const estimatedTotalCount = hasMore ? (page * pageSize) + 1 : (page - 1) * pageSize + tokenIds.length;
        const estimatedTotalPages = Math.ceil(estimatedTotalCount / pageSize);

        if (tokenIds.length === 0) {
            return {
                books: [],
                page,
                totalPages: page === 1 ? 1 : page - 1,
                totalCount: (page - 1) * pageSize,
                hasMore: false
            };
        }

        // Step 2: Convert token IDs to Arweave IDs
        const arweaveIds = tokenIds.map(tokenId => natToArweaveId(tokenId));

        // Step 3: Fetch transaction metadata from Arweave using GraphQL
        console.log(`[Library] Fetching Arweave metadata for ${arweaveIds.length} transactions`);
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
        
        console.log(`[Library] GraphQL returned ${data.data.transactions?.edges.length || 0} transactions`);

        // Step 4: Filter for book content types and convert to LibraryBook format
        const bookNFTs: LibraryBook[] = [];
        
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
            
            // Check if it's a book file
            const contentType = contentTypeTag?.value.toLowerCase() || '';
            const isBookFile = contentTypeTag && (
                BOOK_CONTENT_TYPES.some(type => contentType.includes(type.toLowerCase())) ||
                contentType.includes('epub') // Catch any epub variants
            );
            
            console.log(`[Library] Transaction ${transaction.id}: Content-Type=${contentTypeTag?.value}, IsBookFile=${isBookFile}`);
            
            if (isBookFile) {
                // Get the corresponding token ID
                const tokenId = arweaveToTokenMap.get(transaction.id);
                if (!tokenId) continue; // Skip if no token ID found
                
                // Convert to LibraryBook format
                const sizeInBytes = parseInt(transaction.data.size || "0");
                const sizeInMB = sizeInBytes / (1024 * 1024);
                
                bookNFTs.push({
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

        console.log(`[Library] Found ${bookNFTs.length} book NFTs out of ${tokenIds.length} total NFTs for user ${userPrincipal}`);
        
        // Calculate final pagination info based on actual book NFTs found
        const bookRatio = tokenIds.length > 0 ? bookNFTs.length / tokenIds.length : 1;
        const adjustedTotalCount = Math.ceil(estimatedTotalCount * bookRatio);
        const adjustedTotalPages = Math.ceil(adjustedTotalCount / pageSize);
        const adjustedHasMore = bookNFTs.length === pageSize || hasMore;
        
        return {
            books: bookNFTs,
            page,
            totalPages: Math.max(1, adjustedTotalPages),
            totalCount: Math.max(bookNFTs.length, adjustedTotalCount),
            hasMore: adjustedHasMore && bookNFTs.length === pageSize
        };
        
    } catch (error) {
        console.error("[Library] Error fetching user book NFTs:", error);
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        
        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes("fetch")) {
                throw new Error("Network error: Unable to connect to blockchain services");
            }
            if (error.message.includes("GraphQL")) {
                throw new Error("Data service error: Unable to fetch book metadata");
            }
            throw new Error(`Library service error: ${error.message}`);
        }
        
        throw new Error("Failed to fetch user book NFTs");
    }
}