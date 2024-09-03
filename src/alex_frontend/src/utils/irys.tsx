// import { Book } from "@/components/BookModal";
// import Query from "@irys/query";

import { Book } from "@/features/portal/portalSlice";
// import { TokenDetail } from "../../../../src/declarations/alex_backend/alex_backend.did";



// function getTag(name: string, transaction:any): string {
//     return transaction.tags.find((tag: { name: string; }) => tag.name === name)?.value || "";
// };

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


export const getBooks = async (nfts: any[] = []): Promise<Book[]> => {
    const books: Book[] = [];

    await Promise.all(
        nfts.map(async nft => {
            const manifestId = nft.description;
            try {
                const response = await fetch(`https://gateway.irys.xyz/${manifestId}`);
                if (response.ok) {
                    const metadata = await response.json();
                    books.push({
                        ...metadata,
                        manifest: manifestId,
                        owner: nft.owner
                    });
                } else {
                    // Handle non-ok responses, including 404
                    if (response.status === 404) {
                        console.error(`Manifest not found for ID: ${manifestId}. Status: ${response.status}`);
                    } else {
                        console.error(`Failed to fetch manifest for ID: ${manifestId}. Status: ${response.status}`);
                    }
                }
            } catch (err) {
                if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                    console.error(`Network error for manifest ID: ${manifestId}. The resource might not exist or there's a connection issue.`);
                } else {
                    console.error(`Unable to fetch ${manifestId}. Error: ${err}`);
                }
            }
        })
    );

    return books;
};