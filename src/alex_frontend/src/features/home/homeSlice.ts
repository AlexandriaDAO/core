import { Book } from "@/components/BookModal";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface HomeState {
    filter: boolean;
    selectedType: number;
    selectedBook: Book | null;
    selectedSearchedBook: any;
    isModalOpen: boolean;
    bookUrl: string | null;
}

const initialState: HomeState = {
    filter: false,
    selectedType: -1,
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
        setSelectedType: (state, action: PayloadAction<any>) => {
            state.selectedType = action.payload;
        },
        setSelectedBook: (state, action: PayloadAction<Book | null>) => {
            // Reset the state before setting the new book
            state.selectedBook = action.payload
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
    setSelectedType, 
    setSelectedBook, 
    setSelectedSearchedBook,
    setIsModalOpen,
		resetBookState
} = homeSlice.actions;

export default homeSlice.reducer;