import { ActionReducerMapBuilder, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, SerializedUser } from "./authSlice";
import upgrade from "./thunks/upgrade";
import signup from "../signup/thunks/signup";
import login from "../login/thunks/login";
import update from "./thunks/update";
import { toast } from "sonner";

export const buildAuthExtraReducers = (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
        // update.ts
        .addCase(update.pending, (state) => {
            state.loading = true;
            state.error = null;

            toast.info('Updating profile ...')
        })
        .addCase(update.fulfilled, (state, action:PayloadAction<SerializedUser>) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload;

            toast.success('Profile has been updated.')
        })
        .addCase(update.rejected, (state, action) => {
            state.loading = false;
            state.user = null;
            state.error = action.payload as string;

            toast.success('Profile could not be updated.')
        })

        // upgrade.ts
        .addCase(upgrade.pending, (state) => {
            state.librarianLoading = true;
            state.librarianError = null;
        })
        .addCase(upgrade.fulfilled, (state, action:PayloadAction<SerializedUser>) => {
            state.librarianLoading = false;
            state.librarianError = null;
            state.user = action.payload;
        })
        .addCase(upgrade.rejected, (state, action) => {
            state.librarianLoading = false;
            // state.user = null;
            state.librarianError = action.payload as string;
        })

        // login slice
        // login.ts
        .addCase(login.pending, (state) => {
            state.user = null
        })
        .addCase(login.fulfilled, (state, action:PayloadAction<SerializedUser>) => {
            state.user = action.payload
        })
        .addCase(login.rejected, (state, action) => {
            state.user = null;
        })


        // signup slice
        // signup.ts
        .addCase(signup.fulfilled, (state, action:PayloadAction<SerializedUser>) => {
            state.user = action.payload;
        })
        .addCase(signup.rejected, (state, action) => {
            state.user = null;
        })
};
