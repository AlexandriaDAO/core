import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/alex_wallet/alex_wallet.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SerializedNode } from '@/features/my-nodes/myNodesSlice';
import { AppDispatch, RootState } from '@/store';
import { getServerIrys } from '@/services/irysService';
import { setProgress } from '../fileUploadSlice';
import { toast } from 'sonner';
import { readFileAsBuffer } from '@/features/irys/utils/gaslessFundAndUpload';

const uploadFile = createAsyncThunk<
    string, // This is the return type of the thunk's payload
    {
        file: File,
        node: SerializedNode,
        actor: ActorSubclass<_SERVICE>
    }, //Argument that we pass to initialize
    { rejectValue: string , dispatch: AppDispatch, state: RootState }
>("fileUploadSlice/uploadFile", async ({file, node, actor}, { rejectWithValue, dispatch, getState }) => {
    try {
        const {auth: { user }} = getState();

        const irys = await getServerIrys(node, actor);

        const chunkedUploader = irys.uploader.chunkedUploader;

        if (file.size >= 100 * 1024 * 1024) { // 100mb or above
            chunkedUploader.setBatchSize(5);
            chunkedUploader.setChunkSize(2 * 1024 * 1024); // 2MB chunks
        } else if (file.size >= 50 * 1024 * 1024) { // 50mb or above
            chunkedUploader.setBatchSize(4);
            chunkedUploader.setChunkSize(1.5 * 1024 * 1024); // 1.5MB chunks
        } else if (file.size >= 10 * 1024 * 1024) { // 10mb or above
            chunkedUploader.setBatchSize(3);
            chunkedUploader.setChunkSize(1 * 1024 * 1024); // 1MB chunks
        } else if (file.size > 5 * 1024 * 1024) { // greater than 5mb
            chunkedUploader.setBatchSize(2);
            chunkedUploader.setChunkSize(768 * 1024); // 0.75MB chunks
        } else {
            chunkedUploader.setBatchSize(1); // default is 5, make it 1 for sequential uploads
            chunkedUploader.setChunkSize(512 * 1024); // 0.5mb chunks which is minimum
        }

        const handleChunkUpload = (chunkInfo: { totalUploaded: number }) => {
            const progress = Math.round((chunkInfo.totalUploaded / file.size) * 100);
            dispatch(setProgress(progress));
        };

        chunkedUploader.on("chunkUpload", handleChunkUpload);

        const handleUploadDone = (finishRes: any) => {
            toast.success(`${file.name} uploaded successfully`);
            dispatch(setProgress(0));
        };

        chunkedUploader.on("done", handleUploadDone);

        const handleChunkError = (error: any) => {
            const errorMessage = error instanceof Error ? error.message : 'Network error during chunk upload';
            toast.error(`Upload failed: ${errorMessage}`);
            chunkedUploader.pause();

            chunkedUploader.off('chunkError', handleChunkError);
            chunkedUploader.off('chunkUpload', handleChunkUpload);
            chunkedUploader.off('done', handleUploadDone);

            throw new Error(errorMessage);
        };

        chunkedUploader.on("chunkError", handleChunkError);

        const res = await chunkedUploader.uploadData(await readFileAsBuffer(file), {
            tags: [
                { name: "Content-Type", value: file.type },
                { name: "Application-Id", value: process.env.REACT_MAINNET_APP_ID! },
                { name: "User-Principal", value: user?.principal || '2vxsx-fae' },
                { name: "Version", value: "1.0" }
            ],
        });

        if(res.status === 200){
            return res.data.id;
        }

        return rejectWithValue('Failed to upload file' + (res.statusText.length ? res.statusText : ''));
    } catch (error) {
        console.error("Failed to Upload File:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while uploading file"
    );
});


export default uploadFile;