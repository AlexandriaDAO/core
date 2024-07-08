import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Book {
    key: number;
    title: string;
    author: string;
    image: string;
    transactionId: string;
		bookUrl?: string;
}

interface HomeState {
    filter: boolean;
    selectedCategory: any;
    selectedBook: Book | null;
    selectedSearchedBook: any;
    isModalOpen: boolean;
    bookUrl: string | null;
}

const initialState: HomeState = {
    filter: false,
    selectedCategory: null,
    selectedBook: null,
    selectedSearchedBook: null,
    isModalOpen: false,
    bookUrl: null,
};

const homeSlice = createSlice({
    name: "home",
    initialState,
    reducers: {
        setFilter: (state, action: PayloadAction<boolean>) => {
            state.filter = action.payload;
        },
        setSelectedCategory: (state, action: PayloadAction<any>) => {
            state.selectedCategory = action.payload;
        },
        // setSelectedBook: (state, action: PayloadAction<Book | null>) => {
        //     state.selectedBook = action.payload;
        //     state.bookUrl = action.payload 
        //         ? `https://node1.irys.xyz/${action.payload.transactionId}`
        //         : null;
        // },
				setSelectedBook: (state, action: PayloadAction<Book | null>) => {
					// Reset the state before setting the new book
					state.selectedBook = null;
					state.bookUrl = null;

					// Set the new book if provided
					if (action.payload) {
							state.selectedBook = action.payload;
							state.bookUrl = `https://node1.irys.xyz/${action.payload.transactionId}`;
							state.isModalOpen = true;
					} else {
							state.isModalOpen = false;
					}
			},
        setSelectedSearchedBook: (state, action: PayloadAction<any>) => {
            state.selectedSearchedBook = action.payload;
        },
        setIsModalOpen: (state, action: PayloadAction<boolean>) => {
            state.isModalOpen = action.payload;
        },
        resetBookState: (state) => {
					state.selectedBook = null;
					state.bookUrl = null;
					state.isModalOpen = false;
				},
    },
});

export const { 
    setFilter, 
    setSelectedCategory, 
    setSelectedBook, 
    setSelectedSearchedBook,
    setIsModalOpen,
		resetBookState
} = homeSlice.actions;

export default homeSlice.reducer;