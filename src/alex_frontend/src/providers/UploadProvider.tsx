import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { WebIrys } from "@irys/sdk";
import { IrysTransaction } from "@irys/sdk/build/cjs/common/types";
import { toast } from "sonner";
import UploadContext from "@/contexts/UploadContext";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { AssetType, reset as resetUploadSlice, setLoading, setPercent, setError, nextStatus, resetStatus } from "@/features/upload/uploadSlice";

const APP_ID = process.env.DFX_NETWORK === "ic" ? process.env.REACT_MAINNET_APP_ID : process.env.REACT_LOCAL_APP_ID;

interface UploadProviderProps {
	children: React.ReactNode;
}

const UploadProvider: React.FC<UploadProviderProps> = ({ children }) => {
    const dispatch = useAppDispatch();
    const {user} = useAppSelector(state=>state.auth);
    const { open } = useAppSelector(state=>state.upload);

    const [irys, setIrys] = useState<WebIrys | null>(null);
    const [asset, setAsset] = useState<IrysTransaction | null>(null);
    const [cover, setCover] = useState<IrysTransaction | null>(null);
    const [poster, setPoster] = useState<File|null>(null);
    const [metadata, setMetadata] = useState<IrysTransaction | null>(null);
    const [manifest, setManifest] = useState<IrysTransaction | null>(null);


    const reset = useCallback(() => {
        dispatch(resetUploadSlice())

        setIrys(null);
        setAsset(null);
        setCover(null);
        setPoster(null);
        setMetadata(null);
        setManifest(null);
    }, [resetUploadSlice, dispatch]);

    useEffect(()=>{
        if(!open) reset();
    }, [open, reset])

    const createManifestTransaction = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            if (!user) throw new Error('User is missing');
            if (!irys) throw new Error('Irys is not available');
            if (!asset) throw new Error('Asset is missing');
            if (!metadata) throw new Error('Metadata is missing');

            const map = new Map([
                ["asset", asset.id],
                ["metadata", metadata.id]
            ]);

            if(open !== AssetType.Image) {
                if(!cover) throw new Error('Cover is missing');
                map.set("cover", cover.id);
            }

            toast.info('Creating manifest');

            const manifest = await irys.uploader.generateManifest({ items: map, indexFile: 'metadata'});

            const tags = [
                { name: "Content-Type", value: "application/x.arweave-manifest+json" },
                { name: "Application-Id", value: APP_ID! },

                { name: "User-Principal", value: user?.principal || '2vxsx-fae' },
                { name: "Asset-Type", value: open.toString() },
                { name: "Upload-Timestamp", value: Date.now().toString() },
                // Add a version tag to help with future updates
                { name: "Version", value: "1.0" }
            ]

            console.log(tags, 'tags');

            const tx = irys.createTransaction(JSON.stringify(manifest, null, 2), { tags });

            await tx.sign();

            setManifest(tx);
        } catch (error: unknown) {
            const message = error instanceof Error ? `Failed to create manifest: ${error.message}` : 'Failed to create manifest: Unknown error';
            dispatch(setError(message));
            toast.error(message);
            dispatch(resetStatus()); // Reset status on error
        } finally {
            dispatch(setLoading(false));
        }
    }, [irys, user, asset, cover, metadata, dispatch]);

    const uploadTransaction = useCallback(async (tx: IrysTransaction, name: string) => {
        try{
            dispatch(setLoading(true));
            if (!irys) throw new Error('Irys is not available');

            const chunkedUploader = irys.uploader.chunkedUploader;
            chunkedUploader.setBatchSize(1); // default is 5, make it 1 for sequential uploads
            chunkedUploader.setChunkSize(512 * 1024); // 0.5mb chunks which is minimum

            chunkedUploader.on("chunkUpload", (chunkInfo) => {
                const progress = Math.round((chunkInfo.totalUploaded / tx.size) * 100);
                dispatch(setPercent(progress));
                toast.info(`Upload progress: ${progress}%`, { id: 'upload-progress', duration: Infinity });
            });

            chunkedUploader.on("done", (finishRes) => {
                toast.dismiss('upload-progress');
                toast.success(`${name} uploaded successfully`);
                dispatch(setPercent(undefined));
            });
            chunkedUploader.on("chunkError", (error) => {
                toast.dismiss('upload-progress');
                const errorMessage = error instanceof Error ? error.message : 'Network error during chunk upload';
                setError(error instanceof Error ? error.message : 'Failed to upload transaction: Unknown error');
                toast.error(`Upload failed: ${errorMessage}`);
                dispatch(setPercent(undefined));
            });

            await chunkedUploader.uploadTransaction(tx);
            dispatch(nextStatus());
        }catch(error: unknown) {
            const message = error instanceof Error ? `Failed to upload transaction: ${error.message}` : 'Failed to upload transaction: Unknown error';
            dispatch(setError(message));
            toast.error(message);
            dispatch(resetStatus()); // Reset status on error
        } finally {
            dispatch(setLoading(false));
        }
    }, [irys, dispatch]);

    const value = useMemo(() => ({
        irys,
        setIrys,

        asset,
        setAsset,

        cover,
        setCover,

        poster,
        setPoster,

        metadata,
        setMetadata,

        manifest,
        setManifest,

        reset,

        createManifestTransaction,
        uploadTransaction,
    }), [
        irys, asset, cover, poster, metadata, manifest,
        reset, createManifestTransaction,uploadTransaction,
    ]);

	return <UploadContext.Provider value={value}> {children} </UploadContext.Provider>
}


export default UploadProvider;