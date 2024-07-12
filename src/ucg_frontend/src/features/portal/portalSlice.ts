import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Book {
    key: number;
    title: string;
    author: string;
    image: string;
    transactionId: string;
    bookUrl?: string;
}

interface PortalState {
    selectedBook: Book | null;
    isModalOpen: boolean;
}

const initialState: PortalState = {
    selectedBook: null,
    isModalOpen: false,
};

const portalSlice = createSlice({
    name: "portal",
    initialState,
    reducers: {
        setSelectedBook: (state, action: PayloadAction<Book | null>) => {
            state.selectedBook = null;
        },
        setIsModalOpen: (state, action: PayloadAction<boolean>) => {
            state.isModalOpen = action.payload;
        },
        resetBookState: (state) => {
            state.selectedBook = null;
            state.isModalOpen = false;
        },
    },
});

export const { setSelectedBook, setIsModalOpen, resetBookState } = portalSlice.actions;

export default portalSlice.reducer;