import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from '@/store';
import { setLbryFee, setPaymentStatus, setPaymentError } from '../uploadSlice';
import { toast } from "sonner";
import { Principal } from "@dfinity/principal";

const processPayment = createAsyncThunk<
    void, // Return type
    { 
        fileSizeBytes: number,
        actor: any // This should be the NFT manager actor
    },
    { rejectValue: string, dispatch: AppDispatch, state: RootState }
>("upload/processPayment", async ({ fileSizeBytes, actor }, { rejectWithValue, dispatch, getState }) => {
    try {
        // Set payment status to pending
        dispatch(setPaymentStatus('pending'));
        
        const user = getState().auth.user;
        if (!user?.principal) {
            throw new Error('User principal not found');
        }

        // Convert user principal to a Principal type if needed
        const userPrincipal = Principal.fromText(user.principal);
        
        // Call the NFT manager canister to deduct the upload fee
        // Make sure we're using the correct method on the NFT manager actor
        const result = await actor.deduct_upload_fee(userPrincipal, BigInt(fileSizeBytes));
        
        // Check if the operation was successful
        if ('Err' in result) {
            throw new Error(result.Err);
        }
        
        // Update payment status to success
        dispatch(setPaymentStatus('success'));
        toast.success('Payment processed successfully');
        
    } catch (error) {
        // Update payment status to failed
        dispatch(setPaymentStatus('failed'));
        
        console.error("Payment failed:", error);
        let errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch(setPaymentError(errorMessage));
        toast.error('Payment failed: ' + errorMessage);
        
        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
        return rejectWithValue("An unknown error occurred during payment");
    }
});

export default processPayment; 