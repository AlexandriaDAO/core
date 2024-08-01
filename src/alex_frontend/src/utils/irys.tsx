import { Book } from "@/components/BookModal";
import Query from "@irys/query";


function getTag(name: string, transaction:any): string {
    return transaction.tags.find((tag: { name: string; }) => tag.name === name)?.value || "";
};

function getAuthor(transaction: any): string {
    let fullName = 'Unknown Author';
    const firstName = getTag("author_first", transaction);
    const lastName = getTag("author_last", transaction);

    if (firstName && lastName) {
        fullName = `${firstName} ${lastName}`.trim();
    } else if (firstName) {
        fullName = firstName;
    } else if (lastName) {
        fullName = lastName;
    }

    return fullName;
}

export const getMultipleIrysBooks = async (ids: string[] = []): Promise<Book[]> => {
    // Check if ids is empty
    if (ids.length<=0) {
        throw new Error('No NFT IDs found');
    }

    const myQuery = new Query({
        network: process.env.DFX_NETWORK === "ic" ? 'mainnet':'devnet'
    });

    const transactions = await myQuery
        .search("irys:transactions")
        .ids(ids)
        .fields({
            id: true, // Transaction ID
            tags: { // An array of tags associated with the upload
                name: true,
                value: true,
            },
            timestamp: true, // Timestamp, millisecond accurate, of the time the uploaded was verified
        });

    return transactions.map((transaction:any, index) => ({
            title: getTag('title', transaction) || "Unknown Title",
            author: getAuthor(transaction),
            cover: '',
            id: transaction.id,
            tags: transaction.tags
        })
    );
}



export const getSingleIrysBooks = async (id: string = ''): Promise<Book> => {
    // Check if ids is empty
    if (id == '') {
        throw new Error('No NFT ID found');
    }

    const myQuery = new Query({
        network: process.env.DFX_NETWORK === "ic" ? 'mainnet':'devnet'
    });

    const transaction:any = await myQuery
        .search("irys:transactions")
        .ids([id])
        .fields({
            id: true, // Transaction ID
            tags: { // An array of tags associated with the upload
                name: true,
                value: true,
            },
            timestamp: true, // Timestamp, millisecond accurate, of the time the uploaded was verified
        })
        .first();

    return {
        title: getTag('title', transaction) || "Unknown Title",
        author: getAuthor(transaction),
        cover: '',
        id: transaction.id,
        tags: transaction.tags
    };
}
