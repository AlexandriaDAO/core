import { ARWEAVE_GRAPHQL_ENDPOINT, getCurrentBlockHeight } from "@/features/permasearch/utils/helpers";
import { ArweaveAudio, FetchAudiosResponse } from "../types";

// Audio content types we want to fetch
const AUDIO_CONTENT_TYPES = [
    "audio/mp3",
    "audio/wav", 
    "audio/ogg",
    "audio/flac",
    "audio/m4a",
    "audio/mpeg",
    "audio/webm"
];

interface FetchAudiosParams {
    cursor?: string | null;
    signal?: AbortSignal;
}

interface GraphQLResponse {
    data: {
        transactions: {
            edges: Array<{
                cursor: string;
                node: ArweaveAudio;
            }>;
            pageInfo: {
                hasNextPage: boolean;
            };
        };
    };
    errors?: Array<{ message: string }>;
}

export async function fetchAudios({ cursor, signal }: FetchAudiosParams = {}): Promise<FetchAudiosResponse> {
    try {
        // Use simple block offset instead of precise timestamp calculation
        // Arweave averages ~130 seconds per block, so 1 hour ≈ 27 blocks
        const currentHeight = await getCurrentBlockHeight();
        const blockRange = { min: 0, max: currentHeight - 30 }; // 30 blocks for safety

        const response = await fetch(ARWEAVE_GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                    query GetAudioFiles($after: String, $tags: [TagFilter!], $range: BlockFilter) {
                        transactions(
                            first: 20, 
                            sort: HEIGHT_DESC, 
                            after: $after, 
                            tags: $tags, 
                            block: $range
                        ) {
                            edges {
                                cursor
                                node {
                                    id
                                    data { size type }
                                    tags { name value }
                                    block { height timestamp }
                                }
                            }
                            pageInfo { hasNextPage }
                        }
                    }
                `,
                variables: {
                    after: cursor,
                    tags: [
                        {
                            name: "Content-Type",
                            values: AUDIO_CONTENT_TYPES
                        }
                    ],
                    range: blockRange
                }
            }),
            signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch audio transactions`);
        }

        const data: GraphQLResponse = await response.json();

        if (data.errors) {
            throw new Error(`GraphQL errors: ${data.errors.map(e => e.message).join(", ")}`);
        }

        const edges = data.data.transactions?.edges || [];
        
        return {
            audios: edges.map(edge => edge.node),
            cursor: edges[edges.length - 1]?.cursor || null,
            hasNext: data.data.transactions?.pageInfo.hasNextPage || false
        };

    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        console.error('Failed to fetch audio transactions:', error);
        throw new Error('Failed to fetch audio transactions');
    }
}