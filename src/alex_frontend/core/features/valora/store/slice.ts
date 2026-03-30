import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type FeedType = "recency" | "random" | "storyline";

interface ValoraState {
	feedType: FeedType;
	tagFilter: string | null;
	editMode: { shelfId: string | null };
	showFilters: boolean;
	showFollowing: boolean;
}

const initialState: ValoraState = {
	feedType: "recency",
	tagFilter: null,
	editMode: { shelfId: null },
	showFilters: false,
	showFollowing: false,
};

const valoraSlice = createSlice({
	name: "valora",
	initialState,
	reducers: {
		setFeedType(state, action: PayloadAction<FeedType>) {
			state.feedType = action.payload;
		},
		setTagFilter(state, action: PayloadAction<string>) {
			state.tagFilter = action.payload;
		},
		clearTagFilter(state) {
			state.tagFilter = null;
		},
		setEditMode(state, action: PayloadAction<string>) {
			state.editMode.shelfId = action.payload;
		},
		clearEditMode(state) {
			state.editMode.shelfId = null;
		},
		toggleFilters(state) {
			state.showFilters = !state.showFilters;
		},
		toggleFollowing(state) {
			state.showFollowing = !state.showFollowing;
		},
	},
});

export const {
	setFeedType, setTagFilter, clearTagFilter,
	setEditMode, clearEditMode, toggleFilters, toggleFollowing,
} = valoraSlice.actions;

export default valoraSlice.reducer;
