import { Wallet } from "../../../../../../src/declarations/user/user.did";
import { convertTimestamp } from "@/utils/general";
import { SerializedWallet } from "../walletsSlice";
import Arweave from 'arweave';
import { parseNumeric } from "@/features/arinax/utils";

const arweave = Arweave.init({});

// returns balance in winston
export const getWalletBalance = async (wallet: SerializedWallet) => {
    const balance = await arweave.wallets.getBalance(wallet.address)

    return balance;
}

// // returns address
// export const getWalletAddress = async (wallet: SerializedWallet) => {
//     const address = await arweave.wallets.getAddress(wallet.public)

//     return address;
// }


export const winstonToAr = (balance: string) => {
    if(parseNumeric(balance)){
        const ar = arweave.ar.winstonToAr(balance);

        return ar + ' AR';
    }

    return balance;
}

// Helper function to transform IC user to our state format
export const serializeWallet = async (icWallet: Wallet): Promise<SerializedWallet> => {
    const address = await arweave.wallets.getAddress(icWallet.public)

    const balance = await arweave.wallets.getBalance(address)

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

