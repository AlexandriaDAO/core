import { ARWEAVE_GRAPHQL_ENDPOINT } from "../../permasearch/utils/helpers";
import { emporium } from "../../../../../declarations/emporium";

// Book content types we want to filter for (EPUB only to match Library filtering)
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

export interface MarketBook {
    id: string;
    type: string | null;
    size: string | null;
    timestamp: string;
    price: string;
    owner: string;
    token_id: string;
}

export interface FetchMarketBookParams {
    page?: number;
    pageSize?: number;
    currentUserPrincipal?: string;
    signal?: AbortSignal;
}

export interface MarketBookResponse {
    books: MarketBook[];
    totalPages: number;
    totalCount: number;
    page: number;
}

export async function fetchMarketBookNFTs({
    page = 1,
    pageSize = 8,
    currentUserPrincipal,
    signal
}: FetchMarketBookParams = {}): Promise<MarketBookResponse> {
    try {
        console.log("Market: Fetching all marketplace listings, page:", page, "pageSize:", pageSize);
        
        // Step 1: Get all listed NFTs from emporium marketplace  
        const query = {
            page: BigInt(page),
            page_size: BigInt(pageSize),
            sort_by: { Time: null },
            sort_order: { Desc: null }, // Newest first
            selected_user: [] as [], // No user filter - get all listings
            search_term: [] as [],
        };

        const listingsResponse = await emporium.get_listings(query);

        console.log("Market: Found", listingsResponse.nfts.length, "total marketplace listings");

        // Filter out current user's listings if user is provided
        let filteredListings = listingsResponse.nfts;
        if (currentUserPrincipal) {
            filteredListings = listingsResponse.nfts.filter(nft => 
                nft.owner.toString() !== currentUserPrincipal
            );
            console.log("Market: Filtered to", filteredListings.length, "listings (excluding current user)");
        }

        if (filteredListings.length === 0) {
            console.log("Market: No listings found after filtering");
            return {
                books: [],
                totalPages: 0,
                totalCount: 0,
                page,
            };
        }

        // Step 2: Extract arweave IDs from the filtered listings
        const arweaveIds = filteredListings.map(nft => nft.arweave_id);

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

        // Step 4: Filter for book content types
        const bookNFTs: MarketBook[] = [];
        
        for (const edge of data.data.transactions?.edges || []) {
            const transaction = edge.node;
            
            // Find the corresponding listing
            const listing = filteredListings.find(
                nft => nft.arweave_id === transaction.id
            );

            if (!listing) continue;
            
            // Find Content-Type tag
            const contentTypeTag = transaction.tags.find(
                tag => tag.name === "Content-Type"
            );
            
            // Check if it's an EPUB book file
            const isBookFile = contentTypeTag && 
                contentTypeTag.value.toLowerCase().includes('epub');
            
            console.log(`Market: Transaction ${transaction.id}, Content-Type=${contentTypeTag?.value}, IsBookFile=${isBookFile}`);
            
            if (isBookFile) {
                // Convert to MarketBook format
                const sizeInBytes = parseInt(transaction.data.size || "0");
                const sizeInMB = sizeInBytes / (1024 * 1024);
                
                // Convert price from e8s to readable format (assuming ICP)
                const priceInIcp = Number(listing.price) / 100_000_000;
                
                bookNFTs.push({
                    id: transaction.id,
                    type: contentTypeTag.value,
                    size: sizeInMB > 0 ? `${sizeInMB.toFixed(1)} MB` : "Unknown",
                    timestamp: transaction.block?.timestamp 
                        ? new Date(transaction.block.timestamp * 1000).toISOString()
                        : new Date(Number(listing.time) / 1_000_000).toISOString(), // Convert nanoseconds to milliseconds
                    price: `${priceInIcp.toFixed(3)} ICP`,
                    owner: listing.owner.toString(),
                    token_id: listing.token_id.toString(),
                });
            }
        }

        // Calculate pagination based on filtered results
        // This gives approximate pagination since we filter after fetching
        const bookRatio = bookNFTs.length / filteredListings.length || 0;
        const estimatedTotalBooks = Number(listingsResponse.total_count) * bookRatio;
        const estimatedTotalPages = Math.ceil(estimatedTotalBooks / pageSize);

        console.log(`Found ${bookNFTs.length} book NFTs out of ${filteredListings.length} filtered marketplace listings`);
        
        return {
            books: bookNFTs,
            totalPages: Math.max(1, estimatedTotalPages),
            totalCount: Math.floor(estimatedTotalBooks),
            page,
        };
        
    } catch (error) {
        console.error("Error fetching market book NFTs:", error);
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        throw new Error("Failed to fetch market book NFTs");
    }
}