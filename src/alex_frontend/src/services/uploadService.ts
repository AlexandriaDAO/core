import { readFileAsBuffer } from "@/features/irys/utils/gaslessFundAndUpload";
import { WebIrys } from "@irys/sdk";
import { IrysTransaction } from "@irys/sdk/build/cjs/common/types";

const APP_ID = process.env.DFX_NETWORK === "ic" ? process.env.REACT_MAINNET_APP_ID : process.env.REACT_LOCAL_APP_ID;

export const createFileTransaction = async (file: File , irys: WebIrys): Promise<IrysTransaction> => {
    const buffer = await readFileAsBuffer(file!);
    const tags =  [
        { name: "Content-Type", value: file.type }
    ];

    const tx = irys.createTransaction(buffer, { tags });
    await tx.sign();
    return tx;
};


export const createDataTransaction = async (data: string , irys: WebIrys): Promise<IrysTransaction> => {
    const tags =  [
        { name: "Content-Type", value: "application/json" }
    ];

    const tx = irys.createTransaction(data, { tags });
    await tx.sign();
    return tx;
};
