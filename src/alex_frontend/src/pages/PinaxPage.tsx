import React, { lazy, useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ContentType } from "@/features/pinax/pinaxSlice";
import useNavigationGuard from "@/features/pinax/hooks/useNavigationGuard";
import { useCleanupEffect } from "@/features/pinax/hooks/useCleanupEffect";
import { useFileEffect } from "@/features/pinax/hooks/useFileEffect";
import { useTransactionEffect } from "@/features/pinax/hooks/useTransactionEffect";
import { useUploadedFileEffect } from "@/features/pinax/hooks/useUploadedFileEffect";
import FileUploader from "@/features/pinax/components/FileUploader";
import UploadError from "@/features/pinax/components/UploadError";
import PostUploadPreview from "@/features/pinax/components/PostUploadPreview";
import PreUploadPreview from "@/features/pinax/components/PreUploadPreview";
import Header from "@/features/pinax/components/Header";
import TextEditor from "@/features/pinax/components/TextEditor";
import FileSelector from "@/features/pinax/components/FileSelector";
import PaymentPreview from "@/features/pinax/components/PaymentPreview";
import { useContentScanner } from "@/features/pinax/hooks/useContentScanner";

const AlexWalletActor = lazy(() => import("@/actors").then(module => ({ default: module.AlexWalletActor })));
const NftManagerActor = lazy(() => import("@/actors").then(module => ({ default: module.NftManagerActor })));
const LbryActor = lazy(() => import("@/actors").then(module => ({ default: module.LbryActor })));

function PinaxPage() {
	const { type, uploading, minting, transaction, minted, uploadError, fetchError, selectError, scanError, lbryFee } = useAppSelector(state => state.pinax);
	const [file, setFile] = useState<File | null>(null);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);

	useCleanupEffect();
	useNavigationGuard({ uploading, minting, transaction, minted });
	useFileEffect({ file, setUploadedFile });
	useTransactionEffect({ transaction, file, setUploadedFile });
	useUploadedFileEffect({ uploadedFile, setFile });
	useContentScanner({ file });
	return (
		<AlexWalletActor>
			<NftManagerActor>
				<LbryActor>
					<div className="py-10 px-4 sm:px-6 md:px-10 flex-grow flex justify-center">
						<div className="max-w-2xl w-full flex flex-col justify-center items-center gap-8">
							<Header />

							{(uploadedFile && transaction) ? <PostUploadPreview file={uploadedFile} transaction={transaction}/> : null}

							{type == ContentType.Manual && <TextEditor setFile={setFile} />}

							{type == ContentType.Local && <FileSelector setFile={setFile} />}

							{file && !uploadedFile && <PreUploadPreview file={file} />}

							{file && !uploadedFile && lbryFee !== null && <PaymentPreview file={file} />}

							{(uploadError || fetchError || selectError || scanError) && <UploadError />}

							{(file || uploadedFile) && <FileUploader file={file} setFile={setFile} />}
						</div>
					</div>
				</LbryActor>
			</NftManagerActor>
		</AlexWalletActor>
	);
}

export default PinaxPage;