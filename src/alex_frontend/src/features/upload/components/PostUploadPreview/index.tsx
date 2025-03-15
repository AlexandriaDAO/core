import React from "react";
import MintNFT from "./MintNFT";
import FileUrl from "./FileUrl";
import TransactionUrl from "./TransactionUrl";
import TransactionStatus from "./TransactionStatus";
import UploadProgress from "../UploadProgress";
import { ChevronDown, X } from "lucide-react";
import FilePreview from "../FilePreview";
import FileInfo from "../FileInfo";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setPostUploadPreview } from "../../uploadSlice";
import TransactionHash from "./TransactionHash";

interface PostUploadPreviewProps {
	file: File;
	transaction: string;
}

const PostUploadPreview: React.FC<PostUploadPreviewProps> = ({
	file,
	transaction,
}) => {

	const dispatch = useAppDispatch();
	const { postUploadPreview } = useAppSelector(state => state.upload);

	return (
		<div className="w-full space-y-1">
			<button
                onClick={() => dispatch(setPostUploadPreview(!postUploadPreview))}
                className="w-full font-syne text-xl flex items-center justify-between hover:opacity-70 transition-opacity"
            >
                <h2 className="text-xl font-semibold">Uploaded File</h2>
                <span className="flex items-center text-sm">
					{postUploadPreview ? (
                        <>
                            Close
                            <X
                                className="w-4 h-4 ml-1"
                                strokeWidth={2}
                            />
                        </>
                    ) : (
                        <>
                            Show
                            <ChevronDown
                                className="w-4 h-4 ml-1"
                                strokeWidth={2}
                            />
                        </>
					)}
				</span>
            </button>

			{/* Details Section */}
			{postUploadPreview && (
				<div className="space-y-4">
					<FilePreview file={file} />
					<UploadProgress />
					<FileInfo file={file} />
					<div className="flex flex-col gap-1">
						<TransactionHash transaction={transaction} />
						<FileUrl transaction={transaction} />
						<TransactionUrl transaction={transaction} />
						<TransactionStatus transaction={transaction} />
					</div>
					<MintNFT />
				</div>
			)}
		</div>
	);
};

export default PostUploadPreview;
