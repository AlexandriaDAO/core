import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from '@/store';
import { calculateBytes } from '../utils';

const estimateCost = createAsyncThunk<
    { cost: string, fee: number }, // This is the return type of the thunk's payload
    { file: File }, //Argument that we pass to initialize
    { rejectValue: string , dispatch: AppDispatch, state: RootState }
>("pinax/estimateCost", async ({ file }, { rejectWithValue, getState, dispatch }) => {
    try {
        const user = getState().auth.user;

        const tags = [
            { name: "Content-Type", value: file.type },
            { name: "Application-Id", value: process.env.REACT_MAINNET_APP_ID! },
            { name: "User-Principal", value: user?.principal || '2vxsx-fae' },
        ]

        const tagsBytes = calculateBytes(tags);

        const total = tagsBytes.total + file.size;

        // Calculate LBRY fee (5 LBRY per MB)
        const fileSizeMB = Math.ceil(file.size / (1024 * 1024));
        const fee = fileSizeMB * 5;

        // Fetch price estimation from Arweave
        const response = await fetch(`https://arweave.net/price/${total}/`);
        if (!response.ok) {
            throw new Error('Failed to fetch price estimation from Arweave');
        }

        const cost = await response.text();

        return {
            cost,
            fee
        }
    } catch (error) {
        console.error("Failed to Estimate Cost:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
        return rejectWithValue(
            "An unknown error occurred while estimating cost"
        );
    }
});


export default estimateCost;