import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Audio, SonoraState } from "./types";

const initialState: SonoraState = {
    selected: null,
    playing: false,
};

const sonoraSlice = createSlice({
    name: "sonora",
    initialState,
    reducers: {
        setSelected: (state, action: PayloadAction<Audio>) => {
            state.playing = false;
            state.selected = action.payload;
        },
        clearSelected: (state) => {
            state.selected = null;
            state.playing = false;
        },
        setPlaying: (state, action: PayloadAction<boolean>) => {
            state.playing = action.payload;
        },
        playAudio: (state, action: PayloadAction<Audio>) => {
            state.selected = action.payload;
            state.playing = true;
        },
        pauseAudio: (state) => {
            state.playing = false;
        },
    },
});

export const {
    setSelected,
    clearSelected,
    setPlaying,
    playAudio,
    pauseAudio,
} = sonoraSlice.actions;

export default sonoraSlice.reducer;