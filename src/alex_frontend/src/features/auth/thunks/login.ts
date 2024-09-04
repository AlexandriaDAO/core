import { RootState } from "@/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AuthClient } from "@dfinity/auth-client";
import { getPrincipal } from "../utils/authUtils";

const login = createAsyncThunk<
    string,
    AuthClient,
    { rejectValue: string, state: RootState }
>("auth/login", async (client, { rejectWithValue }) => {
    try {
        if (await client.isAuthenticated()) {
            return getPrincipal(client);
        }

        const isLocalDevelopment = process.env.DFX_NETWORK !== "ic";

        return await new Promise<string>((resolve, reject) => {
            client.login({
                identityProvider: isLocalDevelopment
                    ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
                    : "https://identity.ic0.app",
                derivationOrigin: isLocalDevelopment
                    ? undefined
                    : "https://xo3nl-yaaaa-aaaap-abl4q-cai.icp0.io",
                maxTimeToLive: BigInt(7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
                windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
                onSuccess: () => resolve(getPrincipal(client)),
                onError: () => reject(new Error("Could not authenticate")),
            });
        });
    } catch (error) {
        console.error("Failed to login User:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
        return rejectWithValue("An unknown error occurred while initializing Authentication");
    }
});

export default login;