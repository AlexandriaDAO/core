import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from '@/store';
import { WebIrys } from '@irys/sdk';
import { calculateBytes } from '../utils';

const estimateCost = createAsyncThunk<
    number, // This is the return type of the thunk's payload
    { file: File }, //Argument that we pass to initialize
    { rejectValue: string , dispatch: AppDispatch, state: RootState }
>("fileUploadSlice/estimateCost", async ({ file }, { rejectWithValue, getState }) => {
    try {

        const user = getState().auth.user;

        const irys = new WebIrys({
            network: "mainnet",
            token: "ethereum",
            wallet: {
                name: "ethersv5",
                provider: {
                    getSigner: () => ({
                        getAddress: () => "0x0000000000000000000000000000000000000000"
                    })
                }
            }
        });

        await irys.ready();

        const tags = [
            { name: "Content-Type", value: file.type },
            { name: "Application-Id", value: process.env.REACT_MAINNET_APP_ID! },
            { name: "User-Principal", value: user?.principal || '2vxsx-fae' },
        ]

        const tagsBytes = calculateBytes(tags);

        const cost = await irys.getPrice(file.size + tagsBytes.total);

        const costInEth = cost.toNumber() / 1e18; // Convert wei to ETH

        return costInEth;
    } catch (error) {
        console.error("Failed to Estimate Cost:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while estimating cost"
    );
});


export default estimateCost;