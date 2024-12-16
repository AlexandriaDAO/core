import { createContext } from 'react';
import { WebIrys } from '@irys/sdk';
import { IrysTransaction } from '@irys/sdk/build/cjs/common/types';

interface UploadContextProps {
    poster: File|null;
    setPoster: React.Dispatch<React.SetStateAction<File|null>>;

    irys: WebIrys | null;
    setIrys: React.Dispatch<React.SetStateAction<WebIrys | null>>;

    asset: IrysTransaction | null;
    setAsset: React.Dispatch<React.SetStateAction<IrysTransaction | null>>;

	cover: IrysTransaction | null;
    setCover: React.Dispatch<React.SetStateAction<IrysTransaction | null>>;

	metadata: IrysTransaction | null;
    setMetadata: React.Dispatch<React.SetStateAction<IrysTransaction | null>>;

	manifest: IrysTransaction | null;
    setManifest: React.Dispatch<React.SetStateAction<IrysTransaction | null>>;

    createManifestTransaction: () => Promise<void>;
    uploadTransaction: (tx: IrysTransaction, name: string) => Promise<void>;

	reset: () => void;
}

const UploadContext = createContext<UploadContextProps>({
    poster: null,
    setPoster: () => {},

	irys: null,
    setIrys: () => {},

    asset: null,
    setAsset: () => {},

    cover: null,
    setCover: () => {},

    metadata: null,
    setMetadata: () => {},

	manifest: null,
    setManifest: () => {},

    createManifestTransaction: async () => {},
    uploadTransaction: async () => {},

    reset: () => {},
});

export default UploadContext;