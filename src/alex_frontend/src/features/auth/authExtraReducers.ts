import { ActionReducerMapBuilder, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, SerializedUser } from "./authSlice";
import upgrade from "./thunks/upgrade";
import signup from "../signup/thunks/signup";
import login from "../login/thunks/login";
import update from "./thunks/update";
import { toast } from "sonner";
import getCanisters from "./thunks/getCanisters";
import { createCanister } from "./thunks/createCanister";

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
            // state.user = null;
            state.error = action.payload as string;

            toast.error('Profile could not be updated.')
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

        // getCanisters slice
        // getCanisters.ts
        .addCase(getCanisters.pending, (state) => {
            state.canister = undefined;
            state.canisters = {};
            state.canisterLoading = true;
        })
        .addCase(getCanisters.fulfilled, (state, action) => {
            state.canisters = action.payload;
            if(state.user && state.user.principal in action.payload){
                state.canister = action.payload[state.user.principal];
            }
            state.canisterLoading = false;
            state.canisterError = null;
        })
        .addCase(getCanisters.rejected, (state, action) => {
            state.canister = undefined;
            state.canisters = {};
            state.canisterLoading = false;
            state.canisterError = action.payload as string;
        })

        // createCanister slice
        // createCanister.ts
        .addCase(createCanister.pending, (state) => {
            state.canister = undefined;
            if (state.user) {
                const {[state.user.principal]: _, ...remainingCanisters} = state.canisters;
                state.canisters = remainingCanisters;
            }
            state.canisterError = null;
            state.canisterLoading = true;
        })
        .addCase(createCanister.fulfilled, (state, action) => {
            // Set the user's canister key when fulfilled
            if (state.user) {
                state.canister = action.payload;
                state.canisters = {
                    ...state.canisters,
                    [state.user.principal]: action.payload
                }
            }
            state.canisterError = null;
            state.canisterLoading = false;
        })
        .addCase(createCanister.rejected, (state, action) => {
            state.canister = undefined;

            if (state.user) {
                const {[state.user.principal]: _, ...remainingCanisters} = state.canisters;
                state.canisters = remainingCanisters;
            }
            state.canisterError = action.payload as string;
            state.canisterLoading = false;
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
