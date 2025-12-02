import { ARWEAVE_GRAPHQL_ENDPOINT } from "../../permasearch/utils/helpers";
import { emporium } from "../../../../../declarations/emporium";
import { Principal } from "@dfinity/principal";

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

export interface ShelfBook {
    id: string;
    type: string | null;
    size: string | null;
    timestamp: string;
    price: string;
    owner: string;
    token_id: string;
}

export interface FetchShelfBookParams {
    userPrincipal: string;
    page?: number;
    pageSize?: number;
    signal?: AbortSignal;
}

export interface ShelfBookResponse {
    books: ShelfBook[];
    totalPages: number;
    totalCount: number;
    page: number;
}

export async function fetchShelfBookNFTs({
    userPrincipal,
    page = 1,
    pageSize = 8,
    signal
}: FetchShelfBookParams): Promise<ShelfBookResponse> {
    try {
        console.log("Studio: Fetching user's marketplace listings, user:", userPrincipal, "page:", page, "pageSize:", pageSize);
        
        // Step 1: Get user's listed NFTs directly from emporium marketplace
        const query = {
            page: BigInt(page),
            page_size: BigInt(pageSize),
            sort_by: { Time: null },
            sort_order: { Desc: null }, // Newest first
            selected_user: [Principal.fromText(userPrincipal)] as [Principal],
            search_term: [] as [],
        };

        const listingsResponse = await emporium.get_listings(query);
        console.log("Studio: Found", listingsResponse.nfts.length, "marketplace listings for user");

        if (listingsResponse.nfts.length === 0) {
            console.log("Studio: No listings found for user");
            return {
                books: [],
                totalPages: 0,
                totalCount: 0,
                page,
            };
        }

        // Step 2: Extract arweave IDs from the listings
        const arweaveIds = listingsResponse.nfts.map(nft => nft.arweave_id);

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

        // Step 4: Filter for book content and transform
        const bookNFTs: ShelfBook[] = [];
        
        for (const edge of data.data.transactions?.edges || []) {
            const transaction = edge.node;
            
            // Find the corresponding listing
            const listing = listingsResponse.nfts.find(
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
            
            console.log(`Shelf: Transaction ${transaction.id}, Content-Type=${contentTypeTag?.value}, IsBookFile=${isBookFile}`);
            
            if (isBookFile) {
                // Convert to ShelfBook format
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
        const bookRatio = bookNFTs.length / listingsResponse.nfts.length || 0;
        const estimatedTotalBooks = Number(listingsResponse.total_count) * bookRatio;
        const estimatedTotalPages = Math.ceil(estimatedTotalBooks / pageSize);

        console.log(`Studio: Found ${bookNFTs.length} book NFTs out of ${listingsResponse.nfts.length} user listings`);
        
        return {
            books: bookNFTs,
            totalPages: Math.max(1, estimatedTotalPages),
            totalCount: Math.floor(estimatedTotalBooks),
            page,
        };
        
    } catch (error) {
        console.error("Error fetching studio book NFTs:", error);
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        throw new Error("Failed to fetch studio book NFTs");
    }
}