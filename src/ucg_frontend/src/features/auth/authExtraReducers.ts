import { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import principal from "./thunks/principal";
import login from "./thunks/login";
import logout from "./thunks/logout";
import { AuthState } from "./authSlice";

export const buildAuthExtraReducers = (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
        .addCase(principal.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(principal.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload;
        })
        .addCase(principal.rejected, (state, action) => {
            state.loading = false;
            state.user = '';
            state.error = action.payload as string;
        })

        .addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload;
        })
        .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.user = '';
            state.error = action.payload as string;
        })

        .addCase(logout.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(logout.fulfilled, (state) => {
            state.loading = false;
            state.error = null;
            state.user = '';
        })
        .addCase(logout.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
};
