import React, { useEffect } from "react";
import { DialogClose } from "@/lib/components/dialog";
import { Button } from "@/lib/components/button";
import { useUploader } from "@/hooks/useUploader";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";
import Finished from "@/features/upload/components/Finished";
import { LoaderCircle } from "lucide-react";
import ProcessingSteps from "../../components/ProcessingSteps";
import Failed from "../../components/Failed";
import { StepProps } from "antd";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { AssetType, nextScreen, nextStatus, setOpen, setStatus } from "../../uploadSlice";

const Process = () => {
    const dispatch = useAppDispatch();
    const {
        irys,
        asset,
        cover,
        manifest,
        metadata,
        createManifestTransaction,
        uploadTransaction,
    } = useUploader();

    const { user } = useAppSelector(state => state.auth);
    const { status, percent, loading, error, open } = useAppSelector(state => state.upload);

    useEffect(() => {
        if (!manifest) dispatch(setStatus(1));
        else dispatch(setStatus(2));
    }, [manifest]);

    useEffect(() => {
        if (!user || !irys || !asset || !metadata) return;

        if (status === 1 && !manifest)  createManifestTransaction();

        if (!manifest) return;

        switch (status) {
            case 2:
                toast.info("Uploading files to Arweave");
                uploadTransaction(asset, 'Asset');
                break;
            case 3:
                uploadTransaction(metadata, 'Metadata');
                break;
            case 4:
                uploadTransaction(manifest, 'Manifest');
                break;
            case 5:
                setTimeout(() => {
                    dispatch(nextStatus());
                    dispatch(nextScreen());
                }, 2000);
                break;
        }
    }, [status]);

	const items:StepProps[] = [
		{
			title: "Creating Manifest",
			description: "Creating an irys manifest transaction",
			status: status < 1 ? "wait" : status === 1 ? "process" : "finish"
		},
		{
			title: "Uploading asset",
			description: "Uploading your asset file to arweave",
			icon: status == 2 && !percent && <LoaderCircle size={26} className="text-info animate animate-spin"/>,
			status: status < 2 ? "wait" : status === 2 ? "process" : "finish"
		},
		{
			title: "Uploading metadata",
			description: "Uploading your metadata to arweave",
			icon: status == 3 && !percent && <LoaderCircle size={26} className="text-info animate animate-spin"/>,
			status: status < 3 ? "wait" : status === 3 ? "process" : "finish",
		},
		{
			title: "Uploading manifest",
			description: "Uploading your manifest to arweave",
			icon: status == 4 && !percent && <LoaderCircle size={26} className="text-info animate animate-spin"/>,
			status: status < 4 ? "wait" : status === 4 ? "process" : "finish",
		},
		{
			title: "Upload Success",
			description: "Your book has been uploaded",
			status: status < 5 ? "wait" : status === 5 ? "process" : "finish"
		}
	]

    return (
        <div className="flex flex-col gap-2">
            {error ? <Failed /> : status > 5 ? <Finished /> : <ProcessingSteps status={status} percent={percent} items={items} />}

            <footer className="flex justify-end items-center">
                <DialogClose asChild>
                    <Button
                        onClick={() => dispatch(setOpen(false))}
                        type="button"
                        variant="outline"
                        disabled={loading}
                    >
                        Close
                    </Button>
                </DialogClose>
            </footer>
        </div>
    );
};

export default Process;
