import { Wallet } from "../../../../../../src/declarations/alex_wallet/alex_wallet.did";
import { convertTimestamp } from "@/utils/general";
import { SerializedWallet } from "../walletsSlice";
import arweaveClient, { isHtmlResponse } from "@/utils/arweaveClient";

// returns balance in winston
export const getWalletBalance = async (wallet: SerializedWallet) => {
    try {
        const balance = await arweaveClient.wallets.getBalance(wallet.address);
        
        // Check if it looks like HTML
        if (isHtmlResponse(balance)) {
            console.error("Received HTML instead of balance in getWalletBalance!");
            return "Error fetching balance";
        }
        
        return balance;
    } catch (error) {
        console.error("Balance fetch error in getWalletBalance:", error);
        return "Error fetching balance";
    }
}

// // returns address
// export const getWalletAddress = async (wallet: SerializedWallet) => {
//     const address = await arweave.wallets.getAddress(wallet.public)

//     return address;
// }

export function isNumeric(str: string): boolean {
    // Remove whitespace and check if empty
    if (!str.trim()) return false;
    // Convert to number and check if it's valid
    return !isNaN(parseFloat(str)) && isFinite(Number(str));
}

export function parseNumeric(str: string): number | null {
    if (!isNumeric(str)) return null;
    return Number(str);
}

export const winstonToAr = (balance: string) => {
    if(parseNumeric(balance)!==null){
        const ar = arweaveClient.ar.winstonToAr(balance);

        return ar + ' AR';
    }

    return balance;
}

// Helper function to transform IC user to our state format
export const serializeWallet = async (icWallet: Wallet): Promise<SerializedWallet> => {
    const address = await arweaveClient.wallets.getAddress(icWallet.public)

    let balance;
    try {
        balance = await arweaveClient.wallets.getBalance(address);
        
        // Check if it looks like HTML
        if (isHtmlResponse(balance)) {
            console.error("Received HTML instead of balance in serializeWallet!");
            balance = "Error fetching balance"; // Provide a fallback instead of showing HTML
        }
    } catch (error) {
        console.error("Balance fetch error in serializeWallet:", error);
        balance = "Error fetching balance";
    }

    return {
        ...icWallet,
        id: icWallet.id.toString(),
        address: address,
        balance: balance,
        owner: icWallet.owner.toString(),
        created_at: convertTimestamp(icWallet.created_at),
        updated_at: convertTimestamp(icWallet.updated_at)
    }
};

