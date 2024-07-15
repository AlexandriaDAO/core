import { createAsyncThunk } from "@reduxjs/toolkit";
import { getQuery } from "@/features/irys/query-package/query";
import { Book } from '../portalSlice';

// Define the async thunk
const fetchBooks = createAsyncThunk<
    Book[], // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string }
>("portal/fetchBooks", async (_, { rejectWithValue }) => {
    try {
        const queryResults = await getQuery();

        const transactions = queryResults.data.transactions.edges.map((edge: any) => ({
            id: edge.node.id,
            tags: edge.node.tags,
            address: edge.node.address,
            timestamp: edge.node.timestamp
        }))

        const formattedBooks: Book[] = transactions.map((transaction: { tags: any[]; id: any; }, index: number) => ({
                key: index + 1,
                title: transaction.tags.find((tag: { name: string; }) => tag.name === "title")?.value || "Unknown Title",
                author: transaction.tags.find((tag: { name: string; }) => tag.name === "author")?.value || "Unknown Author",
                cover: '', // This is now fine because coverUrl can be string | null
                transactionId: transaction.id,
                tags: transaction.tags
            })
        );
        return formattedBooks;
    } catch (error) {
        console.error("Failed to Fetch Books:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching All Books"
    );
});


export default fetchBooks;