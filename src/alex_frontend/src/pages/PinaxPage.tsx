import React, { lazy, useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ContentType } from "@/features/upload/uploadSlice";
import useNavigationGuard from "@/features/upload/hooks/useNavigationGuard";
import { useCleanupEffect } from "@/features/upload/hooks/useCleanupEffect";
import { useFileEffect } from "@/features/upload/hooks/useFileEffect";
import { useTransactionEffect } from "@/features/upload/hooks/useTransactionEffect";
import { useUploadedFileEffect } from "@/features/upload/hooks/useUploadedFileEffect";
import FileUploader from "@/features/upload/components/FileUploader";
import UploadError from "@/features/upload/components/UploadError";
import PostUploadPreview from "@/features/upload/components/PostUploadPreview";
import PreUploadPreview from "@/features/upload/components/PreUploadPreview";
import Header from "@/features/upload/components/Header";
import TextEditor from "@/features/upload/components/TextEditor";
import FileSelector from "@/features/upload/components/FileSelector";
import PaymentPreview from "@/features/upload/components/PaymentPreview";
import { useContentScanner } from "@/features/upload/hooks/useContentScanner";

const AlexWalletActor = lazy(() => import("@/actors").then(module => ({ default: module.AlexWalletActor })));
const NftManagerActor = lazy(() => import("@/actors").then(module => ({ default: module.NftManagerActor })));
const LbryActor = lazy(() => import("@/actors").then(module => ({ default: module.LbryActor })));

function PinaxPage() {
	const { type, uploading, minting, transaction, minted, uploadError, fetchError, selectError, scanError, lbryFee } = useAppSelector(state => state.upload);
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