import { RootState } from "@/store";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getClient, getPrincipal } from "../services/authService";

// Define the async thunk
const login = createAsyncThunk<
    string, // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("auth/login", async (_, { rejectWithValue }) => {
    try {
        const client = await getClient();

        if (await client.isAuthenticated()){
            return getPrincipal(client);
        }

        return await new Promise<string>((resolve, reject) => {
            client.login({
                identityProvider: process.env.DFX_NETWORK === "ic" ? "https://identity.ic0.app" : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`,
                // maxTimeToLive: BigInt (7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
                // default maxTimeToLive is 8 hours
                windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
                onSuccess: ()=>resolve(getPrincipal(client)),
                onError: () => reject(new Error("Could not authenticate")),
            });
        });
    } catch (error) {
        console.error("Failed to login User:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while initializing Authentication"
    );
});


export default login;