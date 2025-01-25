import { Asset, Book, Image, Audio, Video, BaseAsset } from "@/features/asset/types";

// function getTag(name: string, transaction:any): string {
//     return transaction.tags.find((tag: { name: string; }) => tag.name === name)?.value || "";
// };
import { AssetType } from "@/features/upload/uploadSlice";

// function getAuthor(transaction: any): string {
//     let fullName = 'Unknown Author';
//     const firstName = getTag("author_first", transaction);
//     const lastName = getTag("author_last", transaction);

//     if (firstName && lastName) {
//         fullName = `${firstName} ${lastName}`.trim();
//     } else if (firstName) {
//         fullName = firstName;
//     } else if (lastName) {
//         fullName = lastName;
//     }

//     return fullName;
// }

// export const getMultipleIrysBooks = async (ids: string[] = []): Promise<Book[]> => {
//     // Check if ids is empty
//     if (ids.length<=0) {
//         throw new Error('No NFT IDs found');
//     }

//     const myQuery = new Query({
//         network: process.env.DFX_NETWORK === "ic" ? 'mainnet':'devnet'
//     });

//     const transactions = await myQuery
//         .search("irys:transactions")
//         .ids(ids)
//         .fields({
//             id: true, // Transaction ID
//             tags: { // An array of tags associated with the upload
//                 name: true,
//                 value: true,
//             },
//             timestamp: true, // Timestamp, millisecond accurate, of the time the uploaded was verified
//         });

//     return transactions.map((transaction:any, index) => ({
//             title: getTag('title', transaction) || "Unknown Title",
//             author: getAuthor(transaction),
//             cover: '',
//             id: transaction.id,
//             tags: transaction.tags
//         })
//     );
// }



// export const getSingleIrysBooks = async (id: string = ''): Promise<Book> => {
//     // Check if ids is empty
//     if (id == '') {
//         throw new Error('No NFT ID found');
//     }

//     const myQuery = new Query({
//         network: process.env.DFX_NETWORK === "ic" ? 'mainnet':'devnet'
//     });

//     const transaction:any = await myQuery
//         .search("irys:transactions")
//         .ids([id])
//         .fields({
//             id: true, // Transaction ID
//             tags: { // An array of tags associated with the upload
//                 name: true,
//                 value: true,
//             },
//             timestamp: true, // Timestamp, millisecond accurate, of the time the uploaded was verified
//         })
//         .first();

//     return {
//         title: getTag('title', transaction) || "Unknown Title",
//         author: getAuthor(transaction),
//         cover: '',
//         id: transaction.id,
//         tags: transaction.tags
//     };
// }

import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const isLocal = process.env.DFX_NETWORK !== "ic"

const APP_ID = isLocal ? process.env.REACT_LOCAL_APP_ID : process.env.REACT_MAINNET_APP_ID;

const uri = isLocal ? `https://arweave.devnet.irys.xyz/graphql` : `https://arweave.net/graphql`;

const client = new ApolloClient({
    uri,
    cache: new InMemoryCache()
});

export type fetchAssetsProps = {
    after?: string;
    limit?: number;
    owner?: string;
    type?: string;
    ids?: string[];
};

export const fetchAssets = async ({after = '', limit = 10, owner = '', type = undefined, ids = []}: fetchAssetsProps): Promise<Asset[]> => {
    try {
        const result = await client.query({
        query: gql`
            query {
                transactions(
                    ${ids.length>0 ? `ids: ${JSON.stringify(ids)},` : ''}
                    first: ${limit},
                    ${isLocal ? 'order: DESC,':'sort: HEIGHT_DESC,'}
                    after: "${after}",
                    tags: [
                        { name: "Content-Type", values: ["application/x.arweave-manifest+json"] },
                        { name: "Application-Id", values: ["${APP_ID}"] },
                        ${owner ? `{ name: "User-Principal", values: ["${owner}"] },` : ''}
                        ${type ? `{ name: "Asset-Type", values: ["${type}"] },` : ''}
                    ],
                ) {
                    edges {
                        node {
                            id
                            tags {
                                name
                                value
                            }
                        }
                        cursor
                    }
                }
            }
        `
        });

        return result.data.transactions.edges.map(({node, cursor}:any)=>({
            id: node.id,

            type: node.tags.find((tag: { name: string; }) => tag.name === "Asset-Type")?.value || "",
            owner: node.tags.find((tag: { name: string; }) => tag.name === "User-Principal")?.value || "",
            timestamp: node.tags.find((tag: { name: string; }) => tag.name === "Upload-Timestamp")?.value || "",

            cursor,
        }))
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        throw error;
    }
}
export const getAssets = async <T extends Book | Audio | Video | Image>(manifests: Asset[]): Promise<T[]> => {
    const assets: T[] = [];

    await Promise.all(
        manifests.map(async ({ id, owner, timestamp, type }) => {
            try {
                // const response = await fetch(`https://arweave.net/${id}`);
                const response = await fetch(`https://gateway.irys.xyz/${id}`);
                if (response.ok) {
                    const metadata = await response.json();

                    // Create base asset properties
                    let asset: BaseAsset = {
                        manifest: id,
                        owner: owner,
                        created_at: new Date(parseInt(timestamp)).toLocaleDateString(),
                    };

                    // Add type-specific properties
                    let typedAsset: T;
                    switch(type) {
                        case AssetType.Book:
                            typedAsset = {
                                ...asset,

                                title: metadata.title || 'Untitled',
                                fiction: typeof metadata.fiction === 'boolean' ? metadata.fiction : false,
                                language: metadata.language || 'en',
                                creator: metadata.creator || '',
                                type: typeof metadata.type === 'number' ? metadata.type : 0,
                                categories: Array.isArray(metadata.categories) ? metadata.categories : [],
                                era: typeof metadata.era === 'number' ? metadata.era : 10,
                            } as T;
                            break;
                        case AssetType.Audio:
                            typedAsset = {
                                ...asset,

                                title: metadata.title || 'Untitled',
                                fiction: typeof metadata.fiction === 'boolean' ? metadata.fiction : false,
                                language: metadata.language || 'en',
                                creator: metadata.creator || '',
                                type: typeof metadata.type === 'number' ? metadata.type : 0,
                                categories: Array.isArray(metadata.categories) ? metadata.categories : [],
                                era: typeof metadata.era === 'number' ? metadata.era : 10,
                            } as T;
                            break;
                        case AssetType.Video:
                            typedAsset = {
                                ...asset,

                                title: metadata.title || 'Untitled',
                                fiction: typeof metadata.fiction === 'boolean' ? metadata.fiction : false,
                                language: metadata.language || 'en',
                                creator: metadata.creator || '',
                                type: typeof metadata.type === 'number' ? metadata.type : 0,
                                categories: Array.isArray(metadata.categories) ? metadata.categories : [],
                                era: typeof metadata.era === 'number' ? metadata.era : 10,
                            } as T;
                            break;
                        case AssetType.Image:
                            typedAsset = {
                                ...asset,

                                title: metadata.title || 'Untitled',
                                fiction: typeof metadata.fiction === 'boolean' ? metadata.fiction : false,
                                language: metadata.language || 'en',
                                creator: metadata.creator || '',
                                type: typeof metadata.type === 'number' ? metadata.type : 0,
                                categories: Array.isArray(metadata.categories) ? metadata.categories : [],
                                era: typeof metadata.era === 'number' ? metadata.era : 10,
                            } as T;
                            break;
                    }

                    assets.push(typedAsset);
                } else {
                    // Handle non-ok responses, including 404
                    if (response.status === 404) {
                        console.error(`Transaction Id not found: ${id}. Status: ${response.status}`);
                    } else {
                        console.error(`Failed to fetch Transaction with Id: ${id}. Status: ${response.status}`);
                    }
                }
            } catch (err) {
                if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                    console.error(`Network error for Transaction Id: ${id}. The resource might not exist or there's a connection issue.`);
                } else {
                    console.error(`Unable to fetch ${id}. Error: ${err}`);
                }
            }
        })
    );

    return assets;
};