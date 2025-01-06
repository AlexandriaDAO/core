import { ActionReducerMapBuilder, createSlice, PayloadAction } from "@reduxjs/toolkit";
import fetchMyAssets from "./thunks/fetchMyAssets";
import fetchMyBooks from "./thunks/fetchMyBooks";
import fetchMyImages from "./thunks/fetchMyImages";
import fetchMyAudios from "./thunks/fetchMyAudios";
import fetchMyVideos from "./thunks/fetchMyVideos";
import { Asset, Book, Image, Audio, Video } from "@/features/asset/types";


interface CollectionState {
    assets: Asset[];
    books: Book[];
    images: Image[];
    audios: Audio[];
    videos: Video[];

    cursor: string,

    loading: boolean;
	error: string | null;
}

const initialState: CollectionState = {
    assets: [],
    books: [],
    images: [],
    audios: [],
    videos: [],

    cursor: '',

    loading: false,
	error: null,
};

const collectionSlice = createSlice({
    name: "collection",
    initialState,
    reducers: {
        setAssets: (state, action: PayloadAction<Asset[]>) => {
            state.assets = action.payload;
        },
        setCursor: (state, action:PayloadAction<string>)=>{
            state.cursor = action.payload
        },
        setAudios: (state, action:PayloadAction<Audio[]>) => {
            state.audios = action.payload;
        },
        setBooks: (state, action:PayloadAction<Book[]>) => {
            state.books = action.payload;
        },
        setImages: (state, action:PayloadAction<Image[]>) => {
            state.images = action.payload;
        },
        setVideos: (state, action:PayloadAction<Video[]>) => {
            state.videos = action.payload;
        },
    },
    extraReducers: (builder: ActionReducerMapBuilder<CollectionState>) => {
		builder
			.addCase(fetchMyAssets.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchMyAssets.fulfilled, (state, action:PayloadAction<Asset[]>) => {
				state.loading = false;
				state.error = null;

                state.assets = action.payload;
				state.cursor = action.payload[action.payload.length-1]?.cursor ?? '';
			})
			.addCase(fetchMyAssets.rejected, (state, action) => {
				state.loading = false;
				state.assets = [];
                state.cursor = '';
				state.error = action.payload as string;
			})

            .addCase(fetchMyBooks.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchMyBooks.fulfilled, (state, {payload: {books, cursor}}) => {
				state.loading = false;
				state.error = null;
                state.books = books;
				state.cursor = cursor;
			})
			.addCase(fetchMyBooks.rejected, (state, action) => {
				state.loading = false;
				state.books = [];
                state.cursor = '';
				state.error = action.payload as string;
			})

            .addCase(fetchMyImages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyImages.fulfilled, (state, {payload: {images, cursor}}) => {
                state.loading = false;
                state.error = null;
                state.images = images;
                state.cursor = cursor;
            })
            .addCase(fetchMyImages.rejected, (state, action) => {
                state.loading = false;
                state.images = [];
                state.cursor = '';
                state.error = action.payload as string;
            })

            .addCase(fetchMyAudios.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyAudios.fulfilled, (state, {payload: {audios, cursor}}) => {
                state.loading = false;
                state.error = null;
                state.audios = audios;
                state.cursor = cursor;
            })
            .addCase(fetchMyAudios.rejected, (state, action) => {
                state.loading = false;
                state.audios = [];
                state.cursor = '';
                state.error = action.payload as string;
            })

            .addCase(fetchMyVideos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyVideos.fulfilled, (state, {payload: {videos, cursor}}) => {
                state.loading = false;
                state.error = null;
                state.videos = videos;
                state.cursor = cursor;
            })
            .addCase(fetchMyVideos.rejected, (state, action) => {
                state.loading = false;
                state.videos = [];
                state.cursor = '';
                state.error = action.payload as string;
            })

		}
});

export const { setAssets, setCursor, setAudios, setBooks, setImages, setVideos } = collectionSlice.actions;

export default collectionSlice.reducer;